from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from apps.accounts.models import CustomUser, DoctorProfile, OrganizationProfile


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ("username", "email", "role", "is_verified", "is_staff")
    list_filter = ("role", "is_verified", "is_staff")
    fieldsets = UserAdmin.fieldsets + (
        ("LifeAid", {"fields": ("role", "phone_number", "profile_picture", "address", "is_verified")}),
    )


@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "license_number", "specialization", "hospital_name", "is_approved")
    list_filter = ("is_approved", "specialization")
    search_fields = ("user__username", "license_number", "hospital_name")


@admin.register(OrganizationProfile)
class OrganizationProfileAdmin(admin.ModelAdmin):
    list_display = ("org_name", "user", "registration_number", "is_approved")
    list_filter = ("is_approved",)
    search_fields = ("org_name", "registration_number", "user__username")
