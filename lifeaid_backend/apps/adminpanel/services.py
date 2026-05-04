from apps.adminpanel.models import ActivityLog


def log_admin_activity(user, action, description):
    return ActivityLog.objects.create(performed_by=user, action=action, description=description)
