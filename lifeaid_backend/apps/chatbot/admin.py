from django.contrib import admin
from django.db.models import Count, Q, Avg, F, ExpressionWrapper, DurationField
from django.utils import timezone
from datetime import timedelta

from apps.chatbot.models import ChatLog


@admin.register(ChatLog)
class ChatLogAdmin(admin.ModelAdmin):
    """Admin interface for viewing chatbot conversation logs"""

    list_display = (
        'timestamp',
        'user_identifier',
        'user_message_preview',
        'status',
        'duration_seconds',
        'ip_address',
    )
    list_filter = ('status', 'timestamp')
    search_fields = ('user_identifier', 'user_message', 'bot_response', 'ip_address')
    readonly_fields = (
        'session_id',
        'user_identifier',
        'user_message',
        'bot_response',
        'timestamp',
        'duration_ms',
        'status',
        'error_message',
        'ip_address',
        'user_agent',
    )
    fieldsets = (
        ('User Information', {
            'fields': ('user_identifier', 'session_id', 'ip_address')
        }),
        ('Conversation', {
            'fields': ('user_message', 'bot_response', 'status', 'error_message')
        }),
        ('Technical Details', {
            'fields': ('timestamp', 'duration_ms', 'user_agent')
        }),
    )

    def user_message_preview(self, obj):
        return obj.user_message[:50] + ('...' if len(obj.user_message) > 50 else '')
    user_message_preview.short_description = 'Message Preview'

    def get_queryset(self, request):
        return super().get_queryset(request).order_by('-timestamp')

    def changelist_view(self, request, extra_context=None):
        # Add analytics to the admin changelist view
        response = super().changelist_view(request, extra_context=extra_context)

        if hasattr(response, 'context_data'):
            analytics = self.get_analytics()
            response.context_data['analytics'] = analytics

        return response

    def get_analytics(self):
        """Generate chatbot usage analytics"""
        last_30_days = timezone.now() - timedelta(days=30)

        total_conversations = ChatLog.objects.filter(timestamp__gte=last_30_days).count()
        total_messages = ChatLog.objects.filter(timestamp__gte=last_30_days).count()

        success_logs = ChatLog.objects.filter(
            timestamp__gte=last_30_days,
            status='success'
        )
        avg_duration = success_logs.aggregate(avg=Avg('duration_ms'))['avg'] or 0

        success_count = success_logs.count()
        error_count = ChatLog.objects.filter(
            timestamp__gte=last_30_days,
            status='error'
        ).count()
        rate_limited_count = ChatLog.objects.filter(
            timestamp__gte=last_30_days,
            status='rate_limited'
        ).count()

        success_rate = (success_count / total_conversations * 100) if total_conversations > 0 else 0
        error_rate = ((error_count + rate_limited_count) / total_conversations * 100) if total_conversations > 0 else 0

        # Top questions (simplified - get most common starting words)
        top_questions = (
            ChatLog.objects
            .filter(timestamp__gte=last_30_days, status='success')
            .values('user_message')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )

        # Conversations by day (last 7 days)
        conversations_by_day = []
        for i in range(7):
            day = timezone.now().date() - timedelta(days=i)
            count = ChatLog.objects.filter(
                timestamp__date=day
            ).count()
            conversations_by_day.append({
                'date': day.strftime('%Y-%m-%d'),
                'count': count
            })
        conversations_by_day.reverse()

        return {
            'total_conversations': total_conversations,
            'total_messages': total_messages,
            'avg_duration_ms': round(avg_duration, 2),
            'success_rate': round(success_rate, 2),
            'error_rate': round(error_rate, 2),
            'top_questions': [
                {'question': item['user_message'][:50], 'count': item['count']}
                for item in top_questions
            ],
            'conversations_by_day': conversations_by_day,
        }
