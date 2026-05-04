from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth, TruncWeek
from django.db import DatabaseError
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import CustomUser
from apps.donors.models import Donation
from apps.patients.models import HelpRequest
from common.permissions import IsAdmin, IsDonor, IsOrganization, IsPatient


class AdminDashboardView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        return Response({
            "total_users": CustomUser.objects.count(),
            "total_requests": HelpRequest.objects.count(),
            "total_donations": Donation.objects.filter(payment_status=Donation.PaymentStatus.SUCCESS).aggregate(total=Sum("amount"))["total"] or 0,
            "pending_verifications": HelpRequest.objects.filter(status=HelpRequest.StatusChoices.PENDING).count(),
            "verified_doctors": CustomUser.objects.filter(role=CustomUser.Roles.DOCTOR, is_verified=True).count(),
        })


class PatientDashboardView(APIView):
    permission_classes = [IsPatient]

    def get(self, request):
        requests = HelpRequest.objects.filter(patient=request.user)
        return Response({
            "total_requests": requests.count(),
            "pending": requests.filter(status=HelpRequest.StatusChoices.PENDING).count(),
            "verified": requests.filter(status=HelpRequest.StatusChoices.VERIFIED).count(),
            "approved": requests.filter(status=HelpRequest.StatusChoices.APPROVED).count(),
            "funded": requests.filter(status=HelpRequest.StatusChoices.FUNDED).count(),
        })


class DonorDashboardView(APIView):
    permission_classes = [IsDonor]

    def get(self, request):
        donations = Donation.objects.filter(donor=request.user, payment_status=Donation.PaymentStatus.SUCCESS)
        return Response({
            "total_donated": donations.aggregate(total=Sum("amount"))["total"] or 0,
            "patients_helped": donations.values("help_request__patient").distinct().count(),
        })


class OrganizationDashboardView(APIView):
    permission_classes = [IsOrganization]

    def get(self, request):
        donations = Donation.objects.filter(donor=request.user, payment_status=Donation.PaymentStatus.SUCCESS)
        return Response({
            "total_donated": donations.aggregate(total=Sum("amount"))["total"] or 0,
            "cases_helped": donations.values("help_request").distinct().count(),
        })


class DonationAnalyticsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        try:
            # Force evaluation with list() to catch the potential ValueError early
            monthly = list(Donation.objects.filter(payment_status=Donation.PaymentStatus.SUCCESS)
                          .annotate(period=TruncMonth("donated_at"))
                          .values("period")
                          .annotate(total=Sum("amount"))
                          .order_by("period"))
            
            weekly = list(Donation.objects.filter(payment_status=Donation.PaymentStatus.SUCCESS)
                         .annotate(period=TruncWeek("donated_at"))
                         .values("period")
                         .annotate(total=Sum("amount"))
                         .order_by("period"))
            
            return Response({"monthly": monthly, "weekly": weekly})
        except (ValueError, DatabaseError) as e:
            # Fallback for databases without timezone tables (common in local MySQL)
            print(f"Analytics aggregation error: {e}. Using fallback Python-based grouping.")
            
            # Fetch all successful donations and group in memory
            all_successful = Donation.objects.filter(
                payment_status=Donation.PaymentStatus.SUCCESS
            ).values("donated_at", "amount")
            
            from collections import defaultdict
            monthly_map = defaultdict(float)
            for d in all_successful:
                dt = d["donated_at"]
                if dt:
                    # Truncate to first of month
                    month_key = dt.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                    monthly_map[month_key] += float(d["amount"] or 0)
            
            fallback_monthly = [
                {"period": k, "total": v} 
                for k, v in sorted(monthly_map.items())
            ]
            
            return Response({
                "monthly": fallback_monthly, 
                "weekly": fallback_monthly,
                "warning": "Database timezone tables missing, using fallback aggregation."
            })


class CaseAnalyticsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        illness = HelpRequest.objects.values("illness_type").annotate(count=Count("id")).order_by("-count")
        location = HelpRequest.objects.values("location").annotate(count=Count("id")).order_by("-count")
        urgency = HelpRequest.objects.values("urgency").annotate(count=Count("id")).order_by("-count")
        return Response({
            "by_illness_type": list(illness),
            "by_location": list(location),
            "by_urgency": list(urgency),
        })
