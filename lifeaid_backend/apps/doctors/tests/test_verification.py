from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.accounts.models import CustomUser, DoctorProfile
from apps.patients.models import HelpRequest

class VerificationTests(APITestCase):
    def setUp(self):
        # Create a patient and a help request
        self.patient = CustomUser.objects.create_user(
            username="patient", email="patient@lifeaid.org", password="Password123!", role=CustomUser.Roles.PATIENT
        )
        self.help_request = HelpRequest.objects.create(
            patient=self.patient,
            title="Need Surgery",
            description="Details about surgery",
            illness_type="Heart",
            amount_required=50000,
            location="City X",
            urgency=HelpRequest.UrgencyChoices.HIGH
        )

        # Create an approved doctor
        self.doctor_user = CustomUser.objects.create_user(
            username="doctor", email="doctor@lifeaid.org", password="Password123!", role=CustomUser.Roles.DOCTOR,
            is_verified=True
        )
        self.doctor_profile = DoctorProfile.objects.create(
            user=self.doctor_user,
            license_number="LIC123",
            specialization="Cardiology",
            hospital_name="General Hospital",
            is_approved=True
        )

        # URLs
        self.pending_list_url = reverse('doctor-pending-requests')
        self.verify_url = reverse('doctor-verify-request', kwargs={'pk': self.help_request.pk})

    def get_token(self, user):
        login_url = reverse('login')
        response = self.client.post(login_url, {"email": user.email, "password": "Password123!"})
        return response.data['access']

    def test_doctor_can_see_pending_requests(self):
        token = self.get_token(self.doctor_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.get(self.pending_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check if it's paginated or a direct list
        results = response.data['results'] if 'results' in response.data else response.data
        self.assertEqual(len(results), 1)

    def test_doctor_can_verify_request(self):
        token = self.get_token(self.doctor_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        verify_data = {
            "action": "approve",
            "doctor_remarks": "Verified and valid."
        }
        response = self.client.put(self.verify_url, verify_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.help_request.refresh_from_db()
        self.assertEqual(self.help_request.status, HelpRequest.StatusChoices.VERIFIED)
        self.assertEqual(self.help_request.verified_by, self.doctor_profile)

    def test_unapproved_doctor_cannot_verify(self):
        # Make doctor unapproved
        self.doctor_profile.is_approved = False
        self.doctor_profile.save()
        
        token = self.get_token(self.doctor_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        verify_data = {"action": "approve", "doctor_remarks": "..."}
        response = self.client.put(self.verify_url, verify_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
