import json

from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.donors.models import Donation
from apps.notifications.services import trigger_donation_confirmation_notification
from apps.payments.serializers import CreateOrderSerializer, PaymentVerifySerializer
from apps.payments.services import (
    create_razorpay_order,
    mark_payment_success_from_webhook,
    verify_and_capture_payment,
    verify_webhook_signature,
)


class CreateOrderView(generics.GenericAPIView):
    serializer_class = CreateOrderSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        donation = Donation.objects.get(pk=serializer.validated_data["donation_id"], donor=request.user)
        order = create_razorpay_order(donation)
        donation.razorpay_order_id = order["id"]
        donation.save(update_fields=["razorpay_order_id"])
        return Response({"order": order})


class PaymentVerifyView(generics.GenericAPIView):
    serializer_class = PaymentVerifySerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        donation = Donation.objects.get(pk=serializer.validated_data["donation_id"], donor=request.user)
        try:
            verify_and_capture_payment(donation, serializer.validated_data)
        except ValueError as exc:
            raise ValidationError({"payment": str(exc)}) from exc
        trigger_donation_confirmation_notification(donation)
        return Response({"message": "Payment verified successfully."})


class PaymentWebhookView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        signature = request.headers.get("X-Razorpay-Signature", "")
        body = request.body
        if not verify_webhook_signature(body, signature):
            return Response({"detail": "Invalid webhook signature."}, status=status.HTTP_400_BAD_REQUEST)

        payload = json.loads(body.decode("utf-8"))
        event = payload.get("event")
        if event == "payment.captured":
            payment = payload["payload"]["payment"]["entity"]
            donation = Donation.objects.filter(razorpay_order_id=payment.get("order_id")).first()
            if donation and donation.payment_status != Donation.PaymentStatus.SUCCESS:
                mark_payment_success_from_webhook(donation, payment.get("id"), payment.get("order_id"))
                trigger_donation_confirmation_notification(donation)
        return Response({"message": "Webhook processed."})
