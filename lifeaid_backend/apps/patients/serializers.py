from rest_framework import serializers

from apps.patients.models import HelpRequest


class HelpRequestSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    verified_by_name = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = HelpRequest
        fields = [
            "id",
            "patient",
            "patient_name",
            "title",
            "description",
            "illness_type",
            "amount_required",
            "amount_raised",
            "location",
            "urgency",
            "status",
            "document",
            "image_url",
            "verified_by",
            "verified_by_name",
            "doctor_remarks",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["patient", "amount_raised", "status", "verified_by", "doctor_remarks"]

    def get_patient_name(self, obj):
        return obj.patient.get_full_name() or obj.patient.username

    def get_verified_by_name(self, obj):
        return obj.verified_by.user.get_full_name() if obj.verified_by else None

    def get_image_url(self, obj):
        if obj.document:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.document.url)
            return obj.document.url
        return None


class PublicHelpRequestDetailSerializer(HelpRequestSerializer):
    donations = serializers.SerializerMethodField()

    class Meta(HelpRequestSerializer.Meta):
        fields = HelpRequestSerializer.Meta.fields + ["donations"]

    def get_donations(self, obj):
        return [
            {
                "id": donation.id,
                "caseId": obj.id,
                "donorName": donation.donor_display_name or donation.donor.get_full_name() or donation.donor.username,
                "amount": donation.amount,
                "date": donation.donated_at,
                "message": donation.message,
            }
            for donation in obj.donations.filter(payment_status="success")
        ]


class HelpRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = HelpRequest
        fields = [
            "id",
            "title",
            "description",
            "illness_type",
            "amount_required",
            "location",
            "urgency",
            "document",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        return HelpRequest.objects.create(patient=self.context["request"].user, **validated_data)
