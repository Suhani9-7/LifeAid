from django.contrib import admin

from apps.patients.models import HelpRequest


@admin.register(HelpRequest)
class HelpRequestAdmin(admin.ModelAdmin):
    list_display = ("title", "patient", "illness_type", "amount_required", "amount_raised", "status", "urgency")
    list_filter = ("status", "urgency", "illness_type")
    search_fields = ("title", "patient__username", "illness_type", "location")
