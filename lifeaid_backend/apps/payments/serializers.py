from rest_framework import serializers


class CreateOrderSerializer(serializers.Serializer):
    donation_id = serializers.IntegerField()


class PaymentVerifySerializer(serializers.Serializer):
    donation_id = serializers.IntegerField()
    razorpay_order_id = serializers.CharField()
    razorpay_payment_id = serializers.CharField()
    razorpay_signature = serializers.CharField()
