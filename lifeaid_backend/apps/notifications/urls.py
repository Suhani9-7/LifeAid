from django.urls import path

from apps.notifications.views import MarkNotificationReadView, NotificationListView

urlpatterns = [
    path("all/", NotificationListView.as_view(), name="notifications-all"),
    path("mark-read/<int:pk>/", MarkNotificationReadView.as_view(), name="notification-mark-read"),
]
