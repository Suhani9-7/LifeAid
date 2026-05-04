import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Notification",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("message", models.TextField()),
                ("is_read", models.BooleanField(default=False)),
                ("notification_type", models.CharField(choices=[("email", "Email"), ("sms", "SMS"), ("in-app", "In App")], default="in-app", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="notifications", to="accounts.customuser")),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
