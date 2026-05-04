import csv

from django.contrib.auth import get_user_model
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.serializers import UserProfileSerializer
from apps.adminpanel.models import ActivityLog
from apps.adminpanel.serializers import ActivityLogSerializer
from apps.adminpanel.services import log_admin_activity
from apps.donors.models import Donation
from apps.notifications.services import trigger_help_request_status_notification
from apps.patients.models import HelpRequest
from apps.patients.serializers import HelpRequestSerializer
from common.permissions import IsAdmin

User = get_user_model()


class AdminUserListView(generics.ListAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        queryset = User.objects.all().order_by("role", "username")
        role = self.request.query_params.get("role")
        if role:
            queryset = queryset.filter(role=role)
        return queryset


class ApproveUserView(APIView):
    permission_classes = [IsAdmin]

    def put(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.is_verified = True
        user.save(update_fields=["is_verified"])
        if user.role == User.Roles.DOCTOR and hasattr(user, "doctor_profile"):
            user.doctor_profile.is_approved = True
            user.doctor_profile.save(update_fields=["is_approved"])
        if user.role == User.Roles.ORGANIZATION and hasattr(user, "organization_profile"):
            user.organization_profile.is_approved = True
            user.organization_profile.save(update_fields=["is_approved"])
        log_admin_activity(request.user, "approve_user", f"Approved user {user.id}")
        return Response({"message": "User approved successfully."})


class DeleteUserView(APIView):
    permission_classes = [IsAdmin]

    def delete(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        log_admin_activity(request.user, "delete_user", f"Deleted user {user.id}")
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminRequestListView(generics.ListAPIView):
    serializer_class = HelpRequestSerializer
    permission_classes = [IsAdmin]
    queryset = HelpRequest.objects.all()


class ApproveRequestView(APIView):
    permission_classes = [IsAdmin]

    def put(self, request, pk):
        help_request = get_object_or_404(HelpRequest, pk=pk)
        help_request.status = HelpRequest.StatusChoices.APPROVED
        help_request.save(update_fields=["status", "updated_at"])
        log_admin_activity(request.user, "approve_request", f"Approved help request {help_request.id}")
        trigger_help_request_status_notification(help_request)
        return Response({"message": "Help request approved successfully."})


class DonationReportView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        if request.query_params.get("format") == "csv":
            response = HttpResponse(content_type="text/csv")
            response["Content-Disposition"] = 'attachment; filename="lifeaid_donations.csv"'
            writer = csv.writer(response)
            writer.writerow(["Donor", "Request", "Amount", "Status", "Date"])
            for donation in Donation.objects.select_related("donor", "help_request"):
                writer.writerow([donation.donor.username, donation.help_request.title, donation.amount, donation.payment_status, donation.donated_at])
            return response
        data = Donation.objects.select_related("donor", "help_request").values("id", "donor__username", "help_request__title", "amount", "payment_status", "donated_at")
        return Response(list(data))


class ActivityLogListView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAdmin]
    queryset = ActivityLog.objects.select_related("performed_by").all()
