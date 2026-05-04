import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="ActivityLog",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("action", models.CharField(max_length=120)),
                ("timestamp", models.DateTimeField(auto_now_add=True)),
                ("description", models.TextField()),
                ("performed_by", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="activity_logs", to="accounts.customuser")),
            ],
            options={"ordering": ["-timestamp"]},
        ),
    ]
