from django.urls import path

from apps.doctors.views import DoctorProfileUpsertView, PendingHelpRequestListView, VerifyHelpRequestView, VerifiedByDoctorListView

urlpatterns = [
    path("profile/", DoctorProfileUpsertView.as_view(), name="doctor-profile-upsert"),
    path("requests/pending/", PendingHelpRequestListView.as_view(), name="doctor-pending-requests"),
    path("requests/<int:pk>/verify/", VerifyHelpRequestView.as_view(), name="doctor-verify-request"),
    path("requests/verified/", VerifiedByDoctorListView.as_view(), name="doctor-verified-requests"),
]
