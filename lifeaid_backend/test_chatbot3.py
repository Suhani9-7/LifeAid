import django


def main():
    django.setup()
    from django.test import RequestFactory
    from apps.chatbot.views import chatbot_message

    factory = RequestFactory()
    req = factory.post(
        '/api/chatbot/message/',
        data='{"message": "Hello, how are you?"}',
        content_type='application/json'
    )

    try:
        response = chatbot_message(req)
        print('Status:', response.status_code)
        print('Content:', response.content[:500])
    except Exception as e:
        print('Error:', str(e))
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
