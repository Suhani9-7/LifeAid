from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.http import HttpResponse, JsonResponse

def api_root(request):
    return JsonResponse({
        "message": "Welcome to LifeAid API",
        "version": "1.0",
        "status": "running"
    })

def favicon(request):
    svg = (
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>"
        "<rect fill='#10b981' width='100' height='100'/>"
        "<text x='50' y='60' font-size='60' font-weight='700' "
        "text-anchor='middle' fill='white'>LA</text>"
        "</svg>"
    )
    return HttpResponse(svg, content_type="image/svg+xml")

def chrome_devtools_probe(request):
    return HttpResponse(status=204)

urlpatterns = [
    path("", api_root, name="api-root"),
    path("favicon.ico", favicon, name="favicon"),
    path(".well-known/appspecific/com.chrome.devtools.json", chrome_devtools_probe, name="chrome-devtools-probe"),
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/patient/", include("apps.patients.urls")),
    path("api/doctor/", include("apps.doctors.urls")),
    path("api/donor/", include("apps.donors.urls")),
    path("api/org/", include("apps.organizations.urls")),
    path("api/payment/", include("apps.payments.urls")),
    path("api/notifications/", include("apps.notifications.urls")),
    path("api/dashboard/", include("apps.dashboard.urls")),
    path("api/chatbot/", include("apps.chatbot.urls")),
    path("api/admin/", include("apps.adminpanel.urls")),
    path("api/", include("apps.patients.public_urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
