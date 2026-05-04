from django.db.models import Count, Q, Sum
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from apps.donors.models import Donation
from apps.donors.serializers import DonationHistorySerializer, InitiateDonationSerializer, VerifyDonationSerializer
from apps.notifications.services import trigger_donation_confirmation_notification
from apps.payments.services import create_razorpay_order, verify_and_capture_payment
from apps.patients.models import HelpRequest
from apps.patients.serializers import HelpRequestSerializer
from common.permissions import IsDonor


class DonorRequestListView(generics.ListAPIView):
    serializer_class = HelpRequestSerializer
    permission_classes = [IsDonor]

    def get_queryset(self):
        return HelpRequest.objects.filter(status__in=[HelpRequest.StatusChoices.VERIFIED, HelpRequest.StatusChoices.APPROVED])


class DonorRequestFilterView(DonorRequestListView):
    def get_queryset(self):
        queryset = super().get_queryset()
        params = self.request.query_params
        if params.get("illness_type"):
            queryset = queryset.filter(illness_type__icontains=params["illness_type"])
        if params.get("location"):
            queryset = queryset.filter(location__icontains=params["location"])
        if params.get("urgency"):
            queryset = queryset.filter(urgency=params["urgency"])
        if params.get("date"):
            queryset = queryset.filter(created_at__date=params["date"])
        return queryset


class DonorRequestSearchView(DonorRequestListView):
    def get_queryset(self):
        queryset = super().get_queryset()
        query = self.request.query_params.get("q", "")
        if query:
            queryset = queryset.filter(
                Q(patient__first_name__icontains=query)
                | Q(patient__last_name__icontains=query)
                | Q(illness_type__icontains=query)
                | Q(title__icontains=query)
            )
        return queryset


class InitiateDonationView(generics.GenericAPIView):
    serializer_class = InitiateDonationSerializer
    permission_classes = [IsDonor]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        help_request = get_object_or_404(HelpRequest, pk=serializer.validated_data["help_request_id"])
        donation = Donation.objects.create(
            donor=request.user,
            help_request=help_request,
            donor_display_name=request.user.get_full_name() or request.user.username,
            amount=serializer.validated_data["amount"],
            message=serializer.validated_data.get("message", ""),
            payment_status=Donation.PaymentStatus.PENDING,
        )
        order_data = create_razorpay_order(donation)
        donation.razorpay_order_id = order_data["id"]
        donation.save(update_fields=["razorpay_order_id"])
        return Response({
            "message": "Donation order created successfully.",
            "donation_id": donation.id,
            "order": order_data,
        }, status=status.HTTP_201_CREATED)


class VerifyDonationView(generics.GenericAPIView):
    serializer_class = VerifyDonationSerializer
    permission_classes = [IsDonor]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        donation = get_object_or_404(Donation, pk=serializer.validated_data["donation_id"], donor=request.user)
        try:
            donation = verify_and_capture_payment(donation, serializer.validated_data)
        except ValueError as exc:
            raise ValidationError({"payment": str(exc)}) from exc
        trigger_donation_confirmation_notification(donation)
        return Response({
            "message": "Payment verified successfully.",
            "donation": DonationHistorySerializer(donation, context={"request": request}).data,
            "case": HelpRequestSerializer(donation.help_request, context={"request": request}).data,
        })


class DonationHistoryView(generics.ListAPIView):
    serializer_class = DonationHistorySerializer
    permission_classes = [IsDonor]

    def get_queryset(self):
        return Donation.objects.filter(donor=self.request.user, payment_status=Donation.PaymentStatus.SUCCESS)
