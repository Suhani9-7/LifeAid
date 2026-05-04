from django.urls import reverse
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase
from apps.accounts.models import CustomUser
from apps.donors.models import Donation
from apps.patients.models import HelpRequest

@override_settings(DEBUG=True)
class PaymentTests(APITestCase):
    def setUp(self):
        # Setup users and a request
        self.donor = CustomUser.objects.create_user(
            username="donor", email="donor@lifeaid.org", password="Password123!", role=CustomUser.Roles.DONOR,
            is_verified=True
        )
        self.patient = CustomUser.objects.create_user(
            username="patient2", email="patient2@lifeaid.org", password="Password123!", role=CustomUser.Roles.PATIENT,
            is_verified=True
        )
        self.help_request = HelpRequest.objects.create(
            patient=self.patient,
            title="Help Me",
            description="...",
            illness_type="General",
            amount_required=1000,
            location="..."
        )
        self.donation = Donation.objects.create(
            donor=self.donor,
            help_request=self.help_request,
            amount=500
        )

        self.create_order_url = reverse('payment-create-order')
        self.verify_payment_url = reverse('payment-verify')

    def get_token(self, user):
        login_url = reverse('login')
        response = self.client.post(login_url, {"email": user.email, "password": "Password123!"})
        if response.status_code != 200:
            print(f"Login failed: {response.data}")
        return response.data['access']

    def test_create_order(self):
        token = self.get_token(self.donor)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.post(self.create_order_url, {"donation_id": self.donation.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('order', response.data)
        
        self.donation.refresh_from_db()
        self.assertTrue(self.donation.razorpay_order_id.startswith('order_mock_'))

    def test_verify_payment_mock(self):
        token = self.get_token(self.donor)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        verify_data = {
            "donation_id": self.donation.id,
            "razorpay_order_id": "order_123",
            "razorpay_payment_id": "pay_123",
            "razorpay_signature": "mock_signature" 
        }
        response = self.client.post(self.verify_payment_url, verify_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.donation.refresh_from_db()
        self.assertEqual(self.donation.payment_status, Donation.PaymentStatus.SUCCESS)
        
        self.help_request.refresh_from_db()
        self.assertEqual(self.help_request.amount_raised, 500)
