import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("accounts", "0001_initial"),
        ("patients", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Donation",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("amount", models.DecimalField(decimal_places=2, max_digits=12)),
                ("transaction_id", models.CharField(blank=True, max_length=120)),
                ("payment_status", models.CharField(choices=[("success", "Success"), ("failed", "Failed"), ("pending", "Pending")], default="pending", max_length=20)),
                ("razorpay_order_id", models.CharField(blank=True, max_length=120)),
                ("razorpay_payment_id", models.CharField(blank=True, max_length=120)),
                ("razorpay_signature", models.CharField(blank=True, max_length=255)),
                ("donated_at", models.DateTimeField(auto_now_add=True)),
                ("donor", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="donations", to="accounts.customuser")),
                ("help_request", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="donations", to="patients.helprequest")),
            ],
            options={"ordering": ["-donated_at"]},
        ),
    ]
