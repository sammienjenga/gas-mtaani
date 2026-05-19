from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # 1. Django Admin Interface
    path('admin/', admin.site.urls),
    
    # 2. Your API Endpoints (Login, Products, Orders, etc.)
    path('api/', include('api.urls')),
]

# 3. Serve Media Files during Development
# This is critical for the Marketplace images to be visible in the browser.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)