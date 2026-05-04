from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from apps.accounts.models import DoctorProfile, OrganizationProfile

User = get_user_model()


class DoctorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorProfile
        fields = ["license_number", "license_document", "specialization", "hospital_name", "is_approved"]
        read_only_fields = ["is_approved"]


class OrganizationProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationProfile
        fields = ["org_name", "registration_number", "website", "is_approved"]
        read_only_fields = ["is_approved"]


class UserProfileSerializer(serializers.ModelSerializer):
    doctor_profile = DoctorProfileSerializer(read_only=True)
    organization_profile = OrganizationProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "role",
            "phone_number",
            "profile_picture",
            "address",
            "is_verified",
            "doctor_profile",
            "organization_profile",
        ]
        read_only_fields = ["id", "role", "is_verified"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    license_number = serializers.CharField(required=False, write_only=True)
    license_document = serializers.FileField(required=False, write_only=True)
    specialization = serializers.CharField(required=False, write_only=True)
    hospital_name = serializers.CharField(required=False, write_only=True)
    org_name = serializers.CharField(required=False, write_only=True)
    registration_number = serializers.CharField(required=False, write_only=True)
    website = serializers.URLField(required=False, write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "password",
            "confirm_password",
            "role",
            "phone_number",
            "address",
            "license_number",
            "license_document",
            "specialization",
            "hospital_name",
            "org_name",
            "registration_number",
            "website",
        ]

    def validate(self, attrs):
        if attrs.get("role") == User.Roles.ADMIN:
            raise serializers.ValidationError({"role": "Cannot register as an admin."})
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        doctor_fields = {
            "license_number": validated_data.pop("license_number", None),
            "license_document": validated_data.pop("license_document", None),
            "specialization": validated_data.pop("specialization", None),
            "hospital_name": validated_data.pop("hospital_name", None),
        }
        org_fields = {
            "org_name": validated_data.pop("org_name", None),
            "registration_number": validated_data.pop("registration_number", None),
            "website": validated_data.pop("website", ""),
        }
        validated_data.pop("confirm_password")

        role = validated_data["role"]
        user = User.objects.create_user(
            is_verified=role in [User.Roles.DONOR, User.Roles.PATIENT],
            **validated_data,
        )

        if role == User.Roles.DOCTOR and doctor_fields["license_number"] and doctor_fields["specialization"] and doctor_fields["hospital_name"]:
            DoctorProfile.objects.create(user=user, **doctor_fields)
        elif role == User.Roles.ORGANIZATION and org_fields["org_name"] and org_fields["registration_number"]:
            OrganizationProfile.objects.create(user=user, **org_fields)

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.EMAIL_FIELD

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserProfileSerializer(self.user).data
        return data


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "phone_number", "profile_picture", "address"]
