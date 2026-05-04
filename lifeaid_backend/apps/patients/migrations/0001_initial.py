import django.db.models.deletion
from django.db import migrations, models

import common.validators


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="HelpRequest",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=200)),
                ("description", models.TextField()),
                ("illness_type", models.CharField(max_length=120)),
                ("amount_required", models.DecimalField(decimal_places=2, max_digits=12)),
                ("amount_raised", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("location", models.CharField(max_length=150)),
                ("urgency", models.CharField(choices=[("low", "Low"), ("medium", "Medium"), ("high", "High")], default="medium", max_length=10)),
                ("status", models.CharField(choices=[("pending", "Pending"), ("verified", "Verified"), ("approved", "Approved"), ("rejected", "Rejected"), ("funded", "Funded")], default="pending", max_length=20)),
                ("document", models.FileField(blank=True, null=True, upload_to="help_requests/", validators=[common.validators.validate_medical_document])),
                ("doctor_remarks", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("patient", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="help_requests", to="accounts.customuser")),
                ("verified_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="verified_requests", to="accounts.doctorprofile")),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
