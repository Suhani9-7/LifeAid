from django.db import transaction
from django.db.models import Count, Sum
from rest_framework import generics, status
from rest_framework.response import Response

from apps.donors.models import Donation
from apps.notifications.services import trigger_donation_confirmation_notification, trigger_help_request_status_notification
from apps.organizations.serializers import BulkDonationSerializer
from apps.patients.models import HelpRequest
from apps.patients.serializers import HelpRequestSerializer
from apps.accounts.serializers import OrganizationProfileSerializer
from common.permissions import IsApprovedOrganization, IsOrganization


class OrganizationProfileUpsertView(generics.GenericAPIView):
    serializer_class = OrganizationProfileSerializer
    permission_classes = [IsOrganization]

    def post(self, request, *args, **kwargs):
        profile = getattr(request.user, "organization_profile", None)
        serializer = self.get_serializer(profile, data=request.data, partial=bool(profile))
        serializer.is_valid(raise_exception=True)
        profile = serializer.save(user=request.user) if not profile else serializer.save()
        return Response({
            "message": "Organization profile submitted successfully.",
            "profile": OrganizationProfileSerializer(profile, context={"request": request}).data,
        }, status=status.HTTP_200_OK)


class OrganizationRequestListView(generics.ListAPIView):
    serializer_class = HelpRequestSerializer
    permission_classes = [IsOrganization]

    def get_queryset(self):
        return HelpRequest.objects.filter(status__in=[HelpRequest.StatusChoices.VERIFIED, HelpRequest.StatusChoices.APPROVED])


class OrganizationBulkDonateView(generics.GenericAPIView):
    serializer_class = BulkDonationSerializer
    permission_classes = [IsApprovedOrganization]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        created = []
        for item in serializer.validated_data["donations"]:
            help_request = HelpRequest.objects.select_for_update().get(pk=item["help_request_id"])
            donation = Donation.objects.create(
                donor=request.user,
                help_request=help_request,
                donor_display_name=request.user.get_full_name() or request.user.username,
                amount=item["amount"],
                message="Bulk organization support",
                transaction_id=f"ORG-{request.user.id}-{help_request.id}-{Donation.objects.count() + 1}",
                payment_status=Donation.PaymentStatus.SUCCESS,
            )
            help_request.amount_raised += item["amount"]
            if help_request.amount_raised >= help_request.amount_required:
                help_request.status = HelpRequest.StatusChoices.FUNDED
            help_request.save(update_fields=["amount_raised", "status", "updated_at"])
            trigger_donation_confirmation_notification(donation)
            if help_request.status == HelpRequest.StatusChoices.FUNDED:
                trigger_help_request_status_notification(help_request)
            created.append(donation.id)
        return Response({"message": "Bulk donations processed successfully.", "donation_ids": created}, status=status.HTTP_201_CREATED)


class OrganizationAnalyticsView(generics.GenericAPIView):
    permission_classes = [IsOrganization]

    def get(self, request, *args, **kwargs):
        donations = Donation.objects.filter(donor=request.user, payment_status=Donation.PaymentStatus.SUCCESS)
        total = donations.aggregate(total_amount=Sum("amount"), cases_helped=Count("help_request", distinct=True))
        return Response({
            "total_donated": total["total_amount"] or 0,
            "cases_helped": total["cases_helped"] or 0,
        })
