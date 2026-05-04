from django.conf import settings
from django.db import models

from common.validators import validate_medical_document


class HelpRequest(models.Model):
    class UrgencyChoices(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"

    class StatusChoices(models.TextChoices):
        PENDING = "pending", "Pending"
        VERIFIED = "verified", "Verified"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        FUNDED = "funded", "Funded"

    patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="help_requests")
    title = models.CharField(max_length=200)
    description = models.TextField()
    illness_type = models.CharField(max_length=120)
    amount_required = models.DecimalField(max_digits=12, decimal_places=2)
    amount_raised = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    location = models.CharField(max_length=150)
    urgency = models.CharField(max_length=10, choices=UrgencyChoices.choices, default=UrgencyChoices.MEDIUM)
    status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.PENDING)
    document = models.FileField(upload_to="help_requests/", validators=[validate_medical_document], blank=True, null=True)
    verified_by = models.ForeignKey("accounts.DoctorProfile", on_delete=models.SET_NULL, blank=True, null=True, related_name="verified_requests")
    doctor_remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.patient.username}"
