from django.contrib import admin

from apps.adminpanel.models import ActivityLog

admin.site.site_header = "LifeAid Administration"
admin.site.site_title = "LifeAid Admin"
admin.site.index_title = "LifeAid Control Panel"


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ("action", "performed_by", "timestamp")
    list_filter = ("action",)
    search_fields = ("action", "description", "performed_by__username")
