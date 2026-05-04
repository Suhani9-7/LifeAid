from django.urls import path

from apps.donors.views import (
    DonationHistoryView,
    DonorRequestFilterView,
    DonorRequestListView,
    DonorRequestSearchView,
    InitiateDonationView,
    VerifyDonationView,
)

urlpatterns = [
    path("requests/", DonorRequestListView.as_view(), name="donor-requests"),
    path("requests/filter/", DonorRequestFilterView.as_view(), name="donor-requests-filter"),
    path("requests/search/", DonorRequestSearchView.as_view(), name="donor-requests-search"),
    path("donate/initiate/", InitiateDonationView.as_view(), name="donor-donate-initiate"),
    path("donate/verify/", VerifyDonationView.as_view(), name="donor-donate-verify"),
    path("donations/history/", DonationHistoryView.as_view(), name="donation-history"),
]
