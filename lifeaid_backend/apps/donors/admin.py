from django.contrib import admin

from apps.donors.models import Donation


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ("donor", "help_request", "amount", "payment_status", "donated_at")
    list_filter = ("payment_status",)
    search_fields = ("donor__username", "help_request__title", "transaction_id", "razorpay_order_id")
