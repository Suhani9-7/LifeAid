import time
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

import json

# Rate limiting
RATE_LIMIT_REQUESTS = 20
RATE_LIMIT_WINDOW = 60
BLOCK_DURATION = 300
rate_limit_store = {}

MAX_MESSAGE_LENGTH = 2000
BANNED_PATTERNS = [
    'ignore previous instructions',
    'ignore all instructions',
    'you are now',
    'act as if',
    'pretend to be',
    'bypass',
    'jailbreak',
    'DAN mode',
]


@csrf_exempt
def chatbot_message(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    start_time = time.time()
    
    # Parse request body
    try:
        body = json.loads(request.body)
        user_message = body.get('message', '').strip()
    except:
        return JsonResponse({'reply': 'Invalid request format.', 'status': 'error'}, status=400)
    
    if not user_message:
        return JsonResponse({'reply': 'Please enter a message.', 'status': 'error'}, status=400)
    
    # Sanitize input
    if len(user_message) > MAX_MESSAGE_LENGTH:
        user_message = user_message[:MAX_MESSAGE_LENGTH]
    
    message_lower = user_message.lower()
    for pattern in BANNED_PATTERNS:
        if pattern in message_lower:
            user_message = '[Filtered content]'
            break
    
    user_message = ' '.join(user_message.split())
    
    # Check API key
    if not hasattr(settings, 'GOOGLE_API_KEY') or not settings.GOOGLE_API_KEY:
        return JsonResponse({
            'reply': "I'm currently offline for maintenance. Please contact support.",
            'status': 'error',
        }, status=503)
    
    # Generate response
    try:
        import google.genai as genai
        
        client = genai.Client(api_key=settings.GOOGLE_API_KEY)
        
        system_prompt = (
            "You are the LifeAid Assistant, an AI supporting a medical donation platform. "
            "Be helpful, empathetic, and concise. "
            "Only discuss LifeAid-related topics. "
            f"For urgent issues, contact support at {getattr(settings, 'SUPPORT_EMAIL', 'support@lifeaid.org')}."
        )
        
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash-lite',
                contents=user_message,
                config=genai.types.GenerateContentConfig(
                    max_output_tokens=500,
                    temperature=0.7,
                    system_instruction=system_prompt,
                ),
            )
        except:
            # Try fallback model
            response = client.models.generate_content(
                model='gemini-flash-lite-latest',
                contents=user_message,
                config=genai.types.GenerateContentConfig(
                    max_output_tokens=500,
                    temperature=0.7,
                    system_instruction=system_prompt,
                ),
            )
        
        bot_reply = response.text if hasattr(response, 'text') and response.text else "I'm not sure how to respond."
        if len(bot_reply) > 2000:
            bot_reply = bot_reply[:2000] + "..."
        
        duration_ms = int((time.time() - start_time) * 1000)
        
        return JsonResponse({
            'reply': bot_reply,
            'status': 'success',
            'duration_ms': duration_ms,
        })
        
    except Exception as e:
        error_msg = str(e)
        print(f"Gemini API Error: {error_msg}")
        
        return JsonResponse({
            'reply': "I'm having trouble processing that right now. Please try again later.",
            'status': 'error',
        }, status=500)


def chatbot_health(request):
    has_api_key = bool(
        hasattr(settings, 'GOOGLE_API_KEY') and settings.GOOGLE_API_KEY
    )
    return JsonResponse({
        'status': 'healthy' if has_api_key else 'degraded',
        'api_configured': has_api_key,
        'timestamp': time.time(),
    })
