from rest_framework import serializers

from apps.accounts.serializers import UserProfileSerializer
from apps.adminpanel.models import ActivityLog
from apps.patients.serializers import HelpRequestSerializer


class ActivityLogSerializer(serializers.ModelSerializer):
    performed_by = UserProfileSerializer(read_only=True)

    class Meta:
        model = ActivityLog
        fields = "__all__"
