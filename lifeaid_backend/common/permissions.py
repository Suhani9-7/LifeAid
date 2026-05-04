from rest_framework.permissions import BasePermission


class IsRole(BasePermission):
    allowed_roles = []

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in self.allowed_roles)


class IsPatient(IsRole):
    allowed_roles = ["patient"]


class IsDoctor(IsRole):
    allowed_roles = ["doctor", "admin"]


class IsApprovedDoctor(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == "admin":
            return True
        profile = getattr(request.user, "doctor_profile", None)
        return bool(request.user.role == "doctor" and profile and profile.is_approved and request.user.is_verified)


class IsDonor(IsRole):
    allowed_roles = ["donor", "organization"]


class IsOrganization(IsRole):
    allowed_roles = ["organization"]


class IsApprovedOrganization(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        profile = getattr(request.user, "organization_profile", None)
        return bool(request.user.role == "organization" and profile and profile.is_approved and request.user.is_verified)


class IsAdmin(IsRole):
    allowed_roles = ["admin"]
