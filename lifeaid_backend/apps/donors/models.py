from django.conf import settings
from django.db import models


class Donation(models.Model):
    class PaymentStatus(models.TextChoices):
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"
        PENDING = "pending", "Pending"

    donor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="donations")
    help_request = models.ForeignKey("patients.HelpRequest", on_delete=models.CASCADE, related_name="donations")
    donor_display_name = models.CharField(max_length=150, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    message = models.TextField(blank=True)
    transaction_id = models.CharField(max_length=120, blank=True)
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    razorpay_order_id = models.CharField(max_length=120, blank=True)
    razorpay_payment_id = models.CharField(max_length=120, blank=True)
    razorpay_signature = models.CharField(max_length=255, blank=True)
    donated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-donated_at"]

    def __str__(self):
        return f"{self.donor.username} -> {self.help_request.title}"
