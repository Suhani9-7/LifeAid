from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.accounts.models import CustomUser

class AuthTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.profile_url = reverse('profile')
        self.user_data = {
            "username": "testuser",
            "email": "testuser@lifeaid.org",
            "password": "Password123!",
            "confirm_password": "Password123!",
            "role": CustomUser.Roles.PATIENT,
            "phone_number": "1234567890"
        }

    def test_registration(self):
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CustomUser.objects.count(), 1)
        self.assertEqual(CustomUser.objects.get().email, "testuser@lifeaid.org")

    def test_registration_rejects_phone_number_longer_than_10_digits(self):
        data = self.user_data.copy()
        data["phone_number"] = "12345678901"

        response = self.client.post(self.register_url, data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("phone_number", response.data)
        self.assertEqual(CustomUser.objects.count(), 0)

    def test_registration_rejects_non_digit_phone_number(self):
        data = self.user_data.copy()
        data["phone_number"] = "12345abc90"

        response = self.client.post(self.register_url, data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("phone_number", response.data)
        self.assertEqual(CustomUser.objects.count(), 0)

    def test_login(self):
        # Register user first
        self.client.post(self.register_url, self.user_data)
        
        login_data = {
            "email": "testuser@lifeaid.org",
            "password": "Password123!"
        }
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_profile_access(self):
        # Register and login
        self.client.post(self.register_url, self.user_data)
        login_data = {"email": "testuser@lifeaid.org", "password": "Password123!"}
        login_res = self.client.post(self.login_url, login_data)
        token = login_res.data['access']
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], "testuser@lifeaid.org")

    def test_profile_update(self):
        self.client.post(self.register_url, self.user_data)
        login_data = {"email": "testuser@lifeaid.org", "password": "Password123!"}
        login_res = self.client.post(self.login_url, login_data)
        token = login_res.data['access']
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        update_url = reverse('profile_update')
        update_data = {"phone_number": "0987654321", "address": "New Address"}
        response = self.client.put(update_url, update_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        user = CustomUser.objects.get(email="testuser@lifeaid.org")
        self.assertEqual(user.phone_number, "0987654321")
        self.assertEqual(user.address, "New Address")
