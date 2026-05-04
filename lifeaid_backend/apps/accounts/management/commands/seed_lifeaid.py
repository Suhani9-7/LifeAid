from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import connection
from django.db import transaction

from apps.accounts.models import DoctorProfile, OrganizationProfile
from apps.adminpanel.models import ActivityLog
from apps.donors.models import Donation
from apps.notifications.models import Notification
from apps.patients.models import HelpRequest

User = get_user_model()


class Command(BaseCommand):
    help = "Seed LifeAid sample users, requests, donations, and notifications."

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write("Seeding LifeAid sample data...")

        with connection.cursor() as cursor:
            cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
            for table in [
                "django_admin_log",
                "token_blacklist_blacklistedtoken",
                "token_blacklist_outstandingtoken",
                "adminpanel_activitylog",
                "donors_donation",
                "notifications_notification",
                "patients_helprequest",
                "accounts_doctorprofile",
                "accounts_organizationprofile",
                "accounts_customuser_groups",
                "accounts_customuser_user_permissions",
                "accounts_customuser",
            ]:
                cursor.execute(f"TRUNCATE TABLE {table}")
            cursor.execute("SET FOREIGN_KEY_CHECKS = 1")

        admin_user = User.objects.create_superuser(
            email="admin@lifeaid.org",
            username="admin",
            first_name="LifeAid",
            last_name="Admin",
            password="Admin@12345",
            role=User.Roles.ADMIN,
            is_verified=True,
        )

        patients = [
            ("Sarah", "Johnson", "sarah.patient@lifeaid.org", "sarah_patient", "+1 (555) 123-4567", "Boston, MA"),
            ("James", "Williams", "james.patient@lifeaid.org", "james_williams", "+1 (555) 334-1298", "Los Angeles, CA"),
            ("Maria", "Garcia", "maria.patient@lifeaid.org", "maria_garcia", "+1 (555) 983-6642", "Houston, TX"),
            ("Robert", "Brown", "robert.patient@lifeaid.org", "robert_brown", "+1 (555) 765-3110", "New York, NY"),
            ("Lisa", "Thompson", "lisa.patient@lifeaid.org", "lisa_thompson", "+1 (555) 901-0192", "Chicago, IL"),
            ("David", "Lee", "david.patient@lifeaid.org", "david_lee", "+1 (555) 110-0876", "Phoenix, AZ"),
        ]
        patient_users = {}
        for first, last, email, username, phone, address in patients:
            user = User.objects.create_user(
                email=email,
                username=username,
                first_name=first,
                last_name=last,
                password="Patient@123",
                role=User.Roles.PATIENT,
                phone_number=phone,
                address=address,
                is_verified=True,
            )
            patient_users[first] = user

        doctors = [
            ("Michael", "Chen", "doctor.chen@lifeaid.org", "doctor_chen", "MD-123456", "Cardiology", "Boston General Hospital"),
            ("Emily", "Rodriguez", "doctor.rodriguez@lifeaid.org", "doctor_rodriguez", "MD-453210", "Oncology", "Westside Medical Center"),
            ("Susan", "Park", "doctor.park@lifeaid.org", "doctor_park", "MD-889001", "Pediatrics", "Houston Children's Hospital"),
        ]
        doctor_profiles = {}
        for first, last, email, username, license_number, specialization, hospital in doctors:
            user = User.objects.create_user(
                email=email,
                username=username,
                first_name=first,
                last_name=last,
                password="Doctor@123",
                role=User.Roles.DOCTOR,
                phone_number="+1 (555) 210-4000",
                address=hospital,
                is_verified=True,
            )
            doctor_profiles[first] = DoctorProfile.objects.create(
                user=user,
                license_number=license_number,
                specialization=specialization,
                hospital_name=hospital,
                is_approved=True,
            )

        donor = User.objects.create_user(
            email="john.donor@lifeaid.org",
            username="john_donor",
            first_name="John",
            last_name="Smith",
            password="Donor@123",
            role=User.Roles.DONOR,
            phone_number="+1 (555) 888-1234",
            address="Seattle, WA",
            is_verified=True,
        )
        organization_user = User.objects.create_user(
            email="foundation@lifeaid.org",
            username="health_foundation",
            first_name="Healthcare",
            last_name="Foundation",
            password="Org@123",
            role=User.Roles.ORGANIZATION,
            phone_number="+1 (555) 777-3322",
            address="Austin, TX",
            is_verified=True,
        )
        OrganizationProfile.objects.create(
            user=organization_user,
            org_name="Healthcare Foundation",
            registration_number="HF-2026-001",
            website="https://healthcarefoundation.example.org",
            is_approved=True,
        )

        cases = [
            ("Sarah", 34, "Cardiac Surgery - Valve Replacement", "Sarah is a single mother of two who needs urgent cardiac valve replacement surgery. She has been diagnosed with severe mitral valve regurgitation and requires immediate medical intervention.", "Cardiac Surgery", Decimal("50000"), Decimal("32000"), "Boston, MA", "high", "verified", "Michael", "Patient requires immediate surgical intervention. The valve replacement is critical and time-sensitive."),
            ("James", 58, "Cancer Treatment - Chemotherapy", "James was recently diagnosed with stage 3 colon cancer. He needs to start chemotherapy treatment immediately but cannot afford the medical expenses.", "Cancer Treatment", Decimal("75000"), Decimal("45000"), "Los Angeles, CA", "high", "verified", "Emily", "Patient diagnosed with stage 3 colon cancer. Chemotherapy treatment plan has been prepared and should begin within 2 weeks."),
            ("Maria", 7, "Pediatric Surgery - Cleft Palate Repair", "Maria is a 7-year-old girl who needs corrective surgery for cleft palate. This surgery will help her speak and eat normally.", "Pediatric Surgery", Decimal("25000"), Decimal("18000"), "Houston, TX", "medium", "verified", "Susan", "Scheduled for cleft palate repair surgery. The procedure will significantly improve quality of life."),
            ("Robert", 45, "Kidney Transplant", "Robert has been on dialysis for 3 years and urgently needs a kidney transplant. A matching donor has been found but he needs financial support for the surgery.", "Organ Transplant", Decimal("120000"), Decimal("85000"), "New York, NY", "high", "verified", "Michael", "Donor match found. Transplant surgery scheduled pending financial clearance. This is a life-saving procedure."),
            ("Lisa", 29, "Spinal Cord Surgery", "Lisa suffered a severe spinal injury in a car accident. She needs urgent spinal surgery to prevent permanent paralysis.", "Neurosurgery", Decimal("95000"), Decimal("12000"), "Chicago, IL", "high", "pending", None, ""),
            ("David", 52, "Diabetes Management & Treatment", "David needs ongoing diabetes treatment and insulin therapy. His condition has worsened and requires intensive medical management.", "Chronic Disease", Decimal("30000"), Decimal("22000"), "Phoenix, AZ", "medium", "verified", "Emily", "Patient requires continuous glucose monitoring and insulin pump therapy for better diabetes management."),
        ]
        requests = {}
        for first_name, age, title, description, illness_type, amount_required, amount_raised, location, urgency, status, doctor_key, remarks in cases:
            help_request = HelpRequest.objects.create(
                patient=patient_users[first_name],
                title=title,
                description=description,
                illness_type=illness_type,
                amount_required=amount_required,
                amount_raised=amount_raised,
                location=location,
                urgency=urgency,
                status=status,
                verified_by=doctor_profiles.get(doctor_key) if doctor_key else None,
                doctor_remarks=remarks,
            )
            requests[first_name] = help_request

        donations = [
            ("Anonymous", "Praying for your recovery!", requests["Sarah"], Decimal("5000"), "2026-03-10"),
            ("John Smith", "Stay strong!", requests["Sarah"], Decimal("2000"), "2026-03-09"),
            ("Healthcare Foundation", "", requests["Sarah"], Decimal("10000"), "2026-03-08"),
            ("Anonymous", "", requests["James"], Decimal("3000"), "2026-03-11"),
            ("Community Trust", "Supporting your fight!", requests["James"], Decimal("15000"), "2026-03-07"),
            ("Children's Fund", "For Maria's bright future", requests["Maria"], Decimal("8000"), "2026-03-09"),
            ("Kidney Foundation", "", requests["Robert"], Decimal("25000"), "2026-03-10"),
            ("Anonymous", "", requests["Robert"], Decimal("10000"), "2026-03-09"),
        ]
        for index, (donor_name, message, help_request, amount, date_str) in enumerate(donations, start=1):
            if donor_name == "John Smith":
                donor_user = donor
            elif donor_name == "Healthcare Foundation":
                donor_user = organization_user
            else:
                donor_user = donor
            donation = Donation.objects.create(
                donor=donor_user,
                help_request=help_request,
                donor_display_name=donor_name,
                amount=amount,
                message=message,
                transaction_id=f"pay_sample_{index:03d}",
                payment_status=Donation.PaymentStatus.SUCCESS,
                razorpay_order_id=f"order_sample_{index:03d}",
                razorpay_payment_id=f"pay_sample_{index:03d}",
                razorpay_signature="sample_signature",
            )
            Donation.objects.filter(pk=donation.pk).update(donated_at=f"{date_str}T09:00:00+05:30")

        Notification.objects.create(user=donor, message="Donation received for Sarah Johnson", notification_type=Notification.NotificationType.EMAIL)
        Notification.objects.create(user=donor, message="Case update: Kidney Transplant", notification_type=Notification.NotificationType.SMS)
        Notification.objects.create(user=donor, message="New urgent case available", notification_type=Notification.NotificationType.EMAIL)
        Notification.objects.create(user=donor, message="Payment reminder", notification_type=Notification.NotificationType.SMS)

        ActivityLog.objects.create(
            action="seed_data",
            performed_by=admin_user,
            description="Seeded LifeAid frontend-aligned sample data.",
        )

        self.stdout.write(self.style.SUCCESS("LifeAid sample data seeded successfully."))
