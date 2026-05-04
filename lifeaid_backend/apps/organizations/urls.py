from django.urls import path

from apps.organizations.views import OrganizationAnalyticsView, OrganizationBulkDonateView, OrganizationProfileUpsertView, OrganizationRequestListView

urlpatterns = [
    path("profile/", OrganizationProfileUpsertView.as_view(), name="org-profile-upsert"),
    path("requests/", OrganizationRequestListView.as_view(), name="org-requests"),
    path("donate/bulk/", OrganizationBulkDonateView.as_view(), name="org-bulk-donate"),
    path("donations/analytics/", OrganizationAnalyticsView.as_view(), name="org-analytics"),
]
