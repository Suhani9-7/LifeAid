from django.urls import path

from apps.patients.views import PublicRequestDetailView, PublicRequestFilterView, PublicRequestSearchView, PublicStatsView

urlpatterns = [
    path("requests/search/", PublicRequestSearchView.as_view(), name="public-request-search"),
    path("requests/filter/", PublicRequestFilterView.as_view(), name="public-request-filter"),
    path("requests/<int:pk>/", PublicRequestDetailView.as_view(), name="public-request-detail"),
    path("public/stats/", PublicStatsView.as_view(), name="public-stats"),
]
