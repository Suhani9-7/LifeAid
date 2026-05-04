from rest_framework import serializers
from apps.chatbot.models import ChatLog


class ChatLogSerializer(serializers.ModelSerializer):
    """Serializer for ChatLog model"""

    duration_seconds = serializers.ReadOnlyField()
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = ChatLog
        fields = [
            'id',
            'session_id',
            'user_identifier',
            'user_email',
            'user_message',
            'bot_response',
            'timestamp',
            'duration_ms',
            'duration_seconds',
            'status',
            'error_message',
            'ip_address',
        ]
        read_only_fields = fields

    def get_user_email(self, obj):
        return obj.user_identifier if '@' in (obj.user_identifier or '') else None


class ChatAnalyticsSerializer(serializers.Serializer):
    """Serializer for chatbot analytics data"""

    total_conversations = serializers.IntegerField()
    total_messages = serializers.IntegerField()
    avg_duration_ms = serializers.FloatField()
    success_rate = serializers.FloatField()
    top_questions = serializers.ListField(child=serializers.DictField())
    conversations_by_day = serializers.ListField(child=serializers.DictField())
    error_rate = serializers.FloatField()
