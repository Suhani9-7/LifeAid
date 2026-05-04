from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    class Roles(models.TextChoices):
        PATIENT = "patient", "Patient"
        DOCTOR = "doctor", "Doctor"
        DONOR = "donor", "Donor"
        ORGANIZATION = "organization", "Organization"
        ADMIN = "admin", "Admin"

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Roles.choices)
    phone_number = models.CharField(max_length=20, blank=True)
    profile_picture = models.ImageField(upload_to="profiles/", blank=True, null=True)
    address = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "role"]

    def save(self, *args, **kwargs):
        if self.role == self.Roles.ADMIN:
            self.is_staff = True
            self.is_superuser = True
            self.is_verified = True
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.role})"


class DoctorProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="doctor_profile")
    license_number = models.CharField(max_length=100, unique=True)
    license_document = models.FileField(upload_to="medical_docs/", blank=True, null=True)
    specialization = models.CharField(max_length=120)
    hospital_name = models.CharField(max_length=150)
    is_approved = models.BooleanField(default=False)

    def __str__(self):
        return f"Dr. {self.user.get_full_name() or self.user.username}"


class OrganizationProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="organization_profile")
    org_name = models.CharField(max_length=150)
    registration_number = models.CharField(max_length=100, unique=True)
    website = models.URLField(blank=True)
    is_approved = models.BooleanField(default=False)

    def __str__(self):
        return self.org_name
