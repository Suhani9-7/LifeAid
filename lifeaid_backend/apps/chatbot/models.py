from django.db import models
from django.conf import settings


class ChatLog(models.Model):
    """Log of all chatbot conversations for monitoring and improvement"""

    STATUS_CHOICES = [
        ('success', 'Success'),
        ('error', 'Error'),
        ('rate_limited', 'Rate Limited'),
    ]

    session_id = models.CharField(max_length=255, null=True, blank=True)
    user_identifier = models.CharField(max_length=255, null=True, blank=True)

    user_message = models.TextField()
    bot_response = models.TextField(blank=True)

    timestamp = models.DateTimeField(auto_now_add=True)
    duration_ms = models.IntegerField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='success')
    error_message = models.TextField(blank=True, null=True)

    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['status']),
            models.Index(fields=['user_identifier']),
        ]

    def __str__(self):
        return f"{self.user_identifier or 'Anonymous'} - {self.timestamp.strftime('%Y-%m-%d %H:%M')}"

    @property
    def duration_seconds(self):
        if self.duration_ms:
            return round(self.duration_ms / 1000, 2)
        return None
