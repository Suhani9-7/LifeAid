from django.db.models import Q, Sum
from rest_framework import generics, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from apps.notifications.models import Notification
from apps.notifications.serializers import NotificationSerializer
from apps.notifications.services import create_in_app_notification
from apps.donors.models import Donation
from apps.patients.models import HelpRequest
from apps.patients.serializers import HelpRequestCreateSerializer, HelpRequestSerializer, PublicHelpRequestDetailSerializer
from common.permissions import IsPatient


class CreateHelpRequestView(generics.CreateAPIView):
    serializer_class = HelpRequestCreateSerializer
    permission_classes = [IsPatient]

    def perform_create(self, serializer):
        help_request = serializer.save()
        create_in_app_notification(
            help_request.patient,
            f'Your help request "{help_request.title}" was submitted successfully and is awaiting doctor verification.',
        )


class DocumentUploadView(generics.UpdateAPIView):
    serializer_class = HelpRequestSerializer
    permission_classes = [IsPatient]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return HelpRequest.objects.filter(patient=self.request.user)

    def post(self, request, *args, **kwargs):
        # We use POST for simplicity in some frontend environments, but it performs a partial update
        return self.partial_update(request, *args, **kwargs)


class MyHelpRequestListView(generics.ListAPIView):
    serializer_class = HelpRequestSerializer
    permission_classes = [IsPatient]

    def get_queryset(self):
        return HelpRequest.objects.filter(patient=self.request.user)


class MyHelpRequestDetailView(generics.RetrieveAPIView):
    serializer_class = HelpRequestSerializer
    permission_classes = [IsPatient]

    def get_queryset(self):
        return HelpRequest.objects.filter(patient=self.request.user)


class PatientNotificationsView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsPatient]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class PublicRequestSearchView(generics.ListAPIView):
    serializer_class = HelpRequestSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        query = self.request.query_params.get("q", "")
        queryset = HelpRequest.objects.filter(status__in=[HelpRequest.StatusChoices.VERIFIED, HelpRequest.StatusChoices.APPROVED])
        if query:
            queryset = queryset.filter(
                Q(patient__first_name__icontains=query)
                | Q(patient__last_name__icontains=query)
                | Q(illness_type__icontains=query)
                | Q(title__icontains=query)
            )
        return queryset


class PublicRequestFilterView(generics.ListAPIView):
    serializer_class = HelpRequestSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = HelpRequest.objects.filter(status__in=[HelpRequest.StatusChoices.VERIFIED, HelpRequest.StatusChoices.APPROVED])
        illness_type = self.request.query_params.get("illness_type")
        location = self.request.query_params.get("location")
        urgency = self.request.query_params.get("urgency")
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")

        if illness_type:
            queryset = queryset.filter(illness_type__icontains=illness_type)
        if location:
            queryset = queryset.filter(location__icontains=location)
        if urgency:
            queryset = queryset.filter(urgency=urgency)
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        return queryset


class PublicRequestDetailView(generics.RetrieveAPIView):
    serializer_class = PublicHelpRequestDetailSerializer
    permission_classes = [permissions.AllowAny]
    queryset = HelpRequest.objects.filter(status__in=[HelpRequest.StatusChoices.VERIFIED, HelpRequest.StatusChoices.APPROVED, HelpRequest.StatusChoices.FUNDED])


class PublicStatsView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get(self, request, *args, **kwargs):
        successful_donations = Donation.objects.filter(payment_status=Donation.PaymentStatus.SUCCESS)
        return Response({
            "patientsHelped": successful_donations.values("help_request__patient").distinct().count(),
            "donationsCollected": successful_donations.aggregate(total=Sum("amount"))["total"] or 0,
            "activeCases": HelpRequest.objects.filter(status__in=[HelpRequest.StatusChoices.VERIFIED, HelpRequest.StatusChoices.APPROVED, HelpRequest.StatusChoices.FUNDED]).count(),
            "verifiedDoctors": HelpRequest.objects.exclude(verified_by=None).values("verified_by").distinct().count(),
        })
