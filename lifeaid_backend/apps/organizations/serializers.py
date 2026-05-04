from rest_framework import serializers


class BulkDonationItemSerializer(serializers.Serializer):
    help_request_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)


class BulkDonationSerializer(serializers.Serializer):
    donations = BulkDonationItemSerializer(many=True)
