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
    
    # Check API keys (Prefer Groq, fallback to Gemini)
    use_groq = bool(hasattr(settings, 'GROQ_API_KEY') and settings.GROQ_API_KEY)
    use_gemini = bool(hasattr(settings, 'GOOGLE_API_KEY') and settings.GOOGLE_API_KEY)

    if not use_groq and not use_gemini:
        return JsonResponse({
            'reply': "I'm currently offline for maintenance. Please contact support.",
            'status': 'error',
        }, status=503)
    
    # Generate response
    bot_reply = None
    last_error = None
    
    # Try Groq first
    if use_groq:
        try:
            from groq import Groq
            client = Groq(api_key=settings.GROQ_API_KEY)
            
            system_prompt = (
                "You are the LifeAid Assistant, an AI supporting a medical donation platform. "
                "Be helpful, empathetic, and concise. "
                "Only discuss LifeAid-related topics. "
                f"For urgent issues, contact support at {getattr(settings, 'SUPPORT_EMAIL', 'support@lifeaid.org')}."
            )

            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                max_tokens=500,
                temperature=0.7,
            )
            bot_reply = response.choices[0].message.content
        except Exception as e:
            last_error = str(e)
            print(f"Groq API Error: {last_error}")
            if "429" in last_error:
                # If rate limited by Groq, we'll try Gemini next if available
                pass
            # Other errors will also fall back to Gemini
    
    # Try Gemini if Groq failed or wasn't used
    if not bot_reply and use_gemini:
        try:
            import google.genai as genai
            client = genai.Client(api_key=settings.GOOGLE_API_KEY)
            
            system_prompt = (
                "You are the LifeAid Assistant, an AI supporting a medical donation platform. "
                "Be helpful, empathetic, and concise. "
                "Only discuss LifeAid-related topics. "
                f"For urgent issues, contact support at {getattr(settings, 'SUPPORT_EMAIL', 'support@lifeaid.org')}."
            )
            
            # Using a more standard model name if the previous one had issues
            model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-flash-lite-latest')
            
            response = client.models.generate_content(
                model=model_name,
                contents=user_message,
                config=genai.types.GenerateContentConfig(
                    max_output_tokens=500,
                    temperature=0.7,
                    system_instruction=system_prompt,
                ),
            )
            if hasattr(response, 'text') and response.text:
                bot_reply = response.text
            else:
                last_error = "Gemini returned empty response"
        except Exception as e:
            last_error = str(e)
            print(f"Gemini API Error: {last_error}")

    if bot_reply:
        if len(bot_reply) > 2000:
            bot_reply = bot_reply[:2000] + "..."
        
        duration_ms = int((time.time() - start_time) * 1000)
        
        return JsonResponse({
            'reply': bot_reply,
            'status': 'success',
            'duration_ms': duration_ms,
        })
    else:
        # Both failed or weren't available
        if last_error and "429" in last_error:
            return JsonResponse({
                'reply': "I'm a bit overwhelmed with requests right now. Please try again in a moment.",
                'status': 'error',
            }, status=429)
        
        return JsonResponse({
            'reply': "I'm having trouble processing that right now. Please try again later.",
            'status': 'error',
            'debug_error': last_error if settings.DEBUG else None
        }, status=500)


def chatbot_health(request):
    has_groq = bool(hasattr(settings, 'GROQ_API_KEY') and settings.GROQ_API_KEY)
    has_gemini = bool(hasattr(settings, 'GOOGLE_API_KEY') and settings.GOOGLE_API_KEY)
    
    return JsonResponse({
        'status': 'healthy' if (has_groq or has_gemini) else 'degraded',
        'groq_configured': has_groq,
        'gemini_configured': has_gemini,
        'timestamp': time.time(),
    })
