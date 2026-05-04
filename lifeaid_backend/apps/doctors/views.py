from rest_framework import generics, status
from rest_framework.response import Response

from apps.accounts.models import DoctorProfile
from apps.doctors.serializers import DoctorVerifySerializer
from apps.notifications.services import trigger_help_request_status_notification
from apps.patients.models import HelpRequest
from apps.patients.serializers import HelpRequestSerializer
from common.permissions import IsApprovedDoctor, IsDoctor


class PendingHelpRequestListView(generics.ListAPIView):
    serializer_class = HelpRequestSerializer
    permission_classes = [IsApprovedDoctor]

    def get_queryset(self):
        return HelpRequest.objects.filter(status=HelpRequest.StatusChoices.PENDING)


class VerifyHelpRequestView(generics.GenericAPIView):
    serializer_class = DoctorVerifySerializer
    permission_classes = [IsApprovedDoctor]
    queryset = HelpRequest.objects.all()

    def put(self, request, *args, **kwargs):
        help_request = self.get_object()
        serializer = self.get_serializer(
            data=request.data,
            context={"help_request": help_request, "doctor_profile": request.user.doctor_profile},
        )
        serializer.is_valid(raise_exception=True)
        updated_request = serializer.save()
        trigger_help_request_status_notification(updated_request)
        return Response({
            "message": "Help request reviewed successfully.",
            "request": HelpRequestSerializer(updated_request).data,
        }, status=status.HTTP_200_OK)


class VerifiedByDoctorListView(generics.ListAPIView):
    serializer_class = HelpRequestSerializer
    permission_classes = [IsApprovedDoctor]

    def get_queryset(self):
        return HelpRequest.objects.filter(verified_by=self.request.user.doctor_profile)


from apps.accounts.serializers import DoctorProfileSerializer

class DoctorProfileUpsertView(generics.GenericAPIView):
    permission_classes = [IsDoctor]
    serializer_class = DoctorProfileSerializer

    def post(self, request, *args, **kwargs):
        profile = getattr(request.user, "doctor_profile", None)
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        # If profile doesn't exist, create it manually or let save handle it if we passed the user
        if not profile:
            profile = serializer.save(user=request.user)
        else:
            profile = serializer.save()

        return Response({
            "message": "Doctor profile submitted successfully.",
            "profile": serializer.data,
        }, status=status.HTTP_200_OK)
