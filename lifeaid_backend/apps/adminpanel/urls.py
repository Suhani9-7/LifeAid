from django.urls import path

from apps.adminpanel.views import (
    ActivityLogListView,
    AdminRequestListView,
    AdminUserListView,
    ApproveRequestView,
    ApproveUserView,
    DeleteUserView,
    DonationReportView,
)

urlpatterns = [
    path("users/", AdminUserListView.as_view(), name="admin-users"),
    path("users/<int:pk>/approve/", ApproveUserView.as_view(), name="admin-user-approve"),
    path("users/<int:pk>/delete/", DeleteUserView.as_view(), name="admin-user-delete"),
    path("requests/", AdminRequestListView.as_view(), name="admin-requests"),
    path("requests/<int:pk>/approve/", ApproveRequestView.as_view(), name="admin-request-approve"),
    path("reports/donations/", DonationReportView.as_view(), name="admin-donation-report"),
    path("logs/", ActivityLogListView.as_view(), name="admin-logs"),
]
