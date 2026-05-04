from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("donors", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="donation",
            name="donor_display_name",
            field=models.CharField(blank=True, max_length=150),
        ),
        migrations.AddField(
            model_name="donation",
            name="message",
            field=models.TextField(blank=True),
        ),
    ]
