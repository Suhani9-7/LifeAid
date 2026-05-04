from django.urls import path

from apps.patients.views import (
    CreateHelpRequestView,
    DocumentUploadView,
    MyHelpRequestDetailView,
    MyHelpRequestListView,
    PatientNotificationsView,
)

urlpatterns = [
    path("request/create/", CreateHelpRequestView.as_view(), name="patient-request-create"),
    path("request/my-requests/", MyHelpRequestListView.as_view(), name="patient-request-list"),
    path("request/<int:pk>/", MyHelpRequestDetailView.as_view(), name="patient-request-detail"),
    path("request/<int:pk>/upload-document/", DocumentUploadView.as_view(), name="patient-request-upload-document"),
    path("notifications/", PatientNotificationsView.as_view(), name="patient-notifications"),
]
