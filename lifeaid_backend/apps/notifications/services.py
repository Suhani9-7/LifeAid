import os

from django.conf import settings
from django.core.mail import send_mail

from apps.notifications.models import Notification

try:
    from twilio.rest import Client
except Exception:
    Client = None


def create_in_app_notification(user, message, notification_type=Notification.NotificationType.IN_APP):
    return Notification.objects.create(user=user, message=message, notification_type=notification_type)


def send_email_notification(user, subject, message):
    if not user.email:
        return
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=True)
    create_in_app_notification(user, message, Notification.NotificationType.EMAIL)


def send_sms_notification(user, message):
    if not settings.ENABLE_SMS_NOTIFICATIONS or not user.phone_number or Client is None:
        return
    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        client.messages.create(body=message, from_=settings.TWILIO_PHONE_NUMBER, to=user.phone_number)
        create_in_app_notification(user, message, Notification.NotificationType.SMS)
    except Exception as e:
        print(f"SMS Notification Error: {e}")


def notify_user(user, subject, message):
    create_in_app_notification(user, message)
    send_email_notification(user, subject, message)
    send_sms_notification(user, message)


def trigger_help_request_status_notification(help_request):
    subject = f"LifeAid request update: {help_request.status.title()}"
    message = f'Your help request "{help_request.title}" is now {help_request.status}.'
    notify_user(help_request.patient, subject, message)


def trigger_donation_confirmation_notification(donation):
    donor_message = f'Your donation of INR {donation.amount} for "{donation.help_request.title}" has been confirmed.'
    patient_message = f'A donation of INR {donation.amount} has been received for your request "{donation.help_request.title}".'
    notify_user(donation.donor, "LifeAid donation confirmed", donor_message)
    notify_user(donation.help_request.patient, "LifeAid donation received", patient_message)
