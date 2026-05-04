import hashlib
import hmac

from django.conf import settings
from django.db import transaction
from django.db.models import F

from apps.donors.models import Donation
from apps.patients.models import HelpRequest


def get_razorpay_client():
    from razorpay import Client

    return Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


def create_razorpay_order(donation):
    try:
        client = get_razorpay_client()
        return client.order.create({
            "amount": int(donation.amount * 100),
            "currency": "INR",
            "receipt": f"lifeaid_donation_{donation.id}",
            "payment_capture": 1,
        })
    except Exception as e:
        if settings.DEBUG:
            import uuid
            return {
                "id": f"order_mock_{uuid.uuid4().hex[:12]}",
                "amount": int(donation.amount * 100),
                "currency": "INR",
                "receipt": f"lifeaid_donation_{donation.id}",
                "status": "created",
            }
        raise e


def verify_and_capture_payment(donation, payload):
    generated_signature = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        f'{payload["razorpay_order_id"]}|{payload["razorpay_payment_id"]}'.encode(),
        hashlib.sha256,
    ).hexdigest()

    # Allow mock signature for testing in DEBUG mode
    is_mock = settings.DEBUG and payload.get("razorpay_signature") == "mock_signature"
    signature_is_valid = generated_signature == payload["razorpay_signature"] or is_mock

    invalid_signature = False
    with transaction.atomic():
        donation = Donation.objects.select_for_update().select_related("help_request").get(pk=donation.pk)

        if donation.payment_status == Donation.PaymentStatus.SUCCESS:
            return donation

        if donation.razorpay_order_id and donation.razorpay_order_id != payload["razorpay_order_id"]:
            raise ValueError("Razorpay order does not match this donation.")

        if not signature_is_valid:
            donation.payment_status = Donation.PaymentStatus.FAILED
            donation.save(update_fields=["payment_status"])
            invalid_signature = True
        else:
            donation.razorpay_order_id = payload["razorpay_order_id"]
            donation.razorpay_payment_id = payload["razorpay_payment_id"]
            donation.razorpay_signature = payload["razorpay_signature"]
            donation.transaction_id = payload["razorpay_payment_id"]
            donation.payment_status = Donation.PaymentStatus.SUCCESS
            donation.save()

            help_request = HelpRequest.objects.select_for_update().get(pk=donation.help_request_id)
            HelpRequest.objects.filter(pk=help_request.pk).update(
                amount_raised=F("amount_raised") + donation.amount
            )
            help_request.refresh_from_db(fields=["amount_raised", "amount_required", "status"])
            if help_request.amount_raised >= help_request.amount_required:
                help_request.status = HelpRequest.StatusChoices.FUNDED
                help_request.save(update_fields=["status", "updated_at"])
            else:
                help_request.save(update_fields=["updated_at"])
            donation.help_request = help_request

    if invalid_signature:
        raise ValueError("Invalid Razorpay signature.")

    return donation


def mark_payment_success_from_webhook(donation, payment_id, order_id):
    with transaction.atomic():
        donation = Donation.objects.select_for_update().select_related("help_request").get(pk=donation.pk)

        if donation.payment_status == Donation.PaymentStatus.SUCCESS:
            return donation

        if donation.razorpay_order_id and donation.razorpay_order_id != order_id:
            raise ValueError("Razorpay order does not match this donation.")

        donation.razorpay_order_id = order_id
        donation.razorpay_payment_id = payment_id
        donation.transaction_id = payment_id
        donation.payment_status = Donation.PaymentStatus.SUCCESS
        donation.save()

        help_request = HelpRequest.objects.select_for_update().get(pk=donation.help_request_id)
        HelpRequest.objects.filter(pk=help_request.pk).update(
            amount_raised=F("amount_raised") + donation.amount
        )
        help_request.refresh_from_db(fields=["amount_raised", "amount_required", "status"])
        if help_request.amount_raised >= help_request.amount_required:
            help_request.status = HelpRequest.StatusChoices.FUNDED
            help_request.save(update_fields=["status", "updated_at"])
        else:
            help_request.save(update_fields=["updated_at"])
        donation.help_request = help_request

    return donation


def verify_webhook_signature(payload_body, signature):
    generated = hmac.new(
        settings.RAZORPAY_WEBHOOK_SECRET.encode(),
        payload_body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(generated, signature)
