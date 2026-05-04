from rest_framework import serializers

from apps.patients.models import HelpRequest


class DoctorVerifySerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["approve", "reject"])
    doctor_remarks = serializers.CharField()

    def save(self, **kwargs):
        help_request = self.context["help_request"]
        doctor_profile = self.context["doctor_profile"]
        action = self.validated_data["action"]
        help_request.verified_by = doctor_profile
        help_request.doctor_remarks = self.validated_data["doctor_remarks"]
        help_request.status = HelpRequest.StatusChoices.VERIFIED if action == "approve" else HelpRequest.StatusChoices.REJECTED
        help_request.save(update_fields=["verified_by", "doctor_remarks", "status", "updated_at"])
        return help_request
