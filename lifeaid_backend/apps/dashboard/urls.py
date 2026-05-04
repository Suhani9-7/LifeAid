from django.urls import path

from apps.dashboard.views import (
    AdminDashboardView,
    CaseAnalyticsView,
    DonationAnalyticsView,
    DonorDashboardView,
    OrganizationDashboardView,
    PatientDashboardView,
)

urlpatterns = [
    path("admin/", AdminDashboardView.as_view(), name="dashboard-admin"),
    path("patient/", PatientDashboardView.as_view(), name="dashboard-patient"),
    path("donor/", DonorDashboardView.as_view(), name="dashboard-donor"),
    path("org/", OrganizationDashboardView.as_view(), name="dashboard-org"),
    path("analytics/donations/", DonationAnalyticsView.as_view(), name="analytics-donations"),
    path("analytics/cases/", CaseAnalyticsView.as_view(), name="analytics-cases"),
]
