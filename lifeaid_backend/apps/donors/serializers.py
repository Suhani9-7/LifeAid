from rest_framework import serializers

from apps.donors.models import Donation
from apps.patients.models import HelpRequest
from apps.patients.serializers import HelpRequestSerializer


class DonationHistorySerializer(serializers.ModelSerializer):
    help_request = HelpRequestSerializer(read_only=True)

    class Meta:
        model = Donation
        fields = "__all__"


class InitiateDonationSerializer(serializers.Serializer):
    help_request_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    message = serializers.CharField(required=False, allow_blank=True)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Donation amount must be greater than zero.")
        return value

    def validate_help_request_id(self, value):
        if not HelpRequest.objects.filter(pk=value, status__in=[HelpRequest.StatusChoices.VERIFIED, HelpRequest.StatusChoices.APPROVED]).exists():
            raise serializers.ValidationError("Help request is not available for donation.")
        return value


class VerifyDonationSerializer(serializers.Serializer):
    donation_id = serializers.IntegerField()
    razorpay_order_id = serializers.CharField()
    razorpay_payment_id = serializers.CharField()
    razorpay_signature = serializers.CharField()
