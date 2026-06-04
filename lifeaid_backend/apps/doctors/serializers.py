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
        
        if action == "approve":
            help_request.status = HelpRequest.StatusChoices.VERIFIED
            # Verify the patient user as well
            patient_user = help_request.patient
            if not patient_user.is_verified:
                patient_user.is_verified = True
                patient_user.save(update_fields=["is_verified"])
        else:
            help_request.status = HelpRequest.StatusChoices.REJECTED
            
        help_request.save(update_fields=["verified_by", "doctor_remarks", "status", "updated_at"])
        return help_request
