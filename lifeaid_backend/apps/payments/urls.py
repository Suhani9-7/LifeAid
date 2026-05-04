from django.urls import path

from apps.payments.views import CreateOrderView, PaymentVerifyView, PaymentWebhookView

urlpatterns = [
    path("create-order/", CreateOrderView.as_view(), name="payment-create-order"),
    path("verify/", PaymentVerifyView.as_view(), name="payment-verify"),
    path("webhook/", PaymentWebhookView.as_view(), name="payment-webhook"),
]
