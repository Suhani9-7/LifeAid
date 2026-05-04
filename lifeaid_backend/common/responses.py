from rest_framework.response import Response


def success_response(message, **data):
    payload = {"message": message}
    payload.update(data)
    return Response(payload)
