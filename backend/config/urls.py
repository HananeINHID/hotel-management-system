"""
URL configuration for Hotel Management System.
Module Karima : Services, Consommations, Paiements, Employés + Swagger OpenAPI
Module Membre 2 : Chambres, Catégories, Maintenances
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

from config.views import health

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health, name='health'),

    # Documentation interactive Swagger OpenAPI
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Endpoints métier du module de Karima
    path('api/', include('apps.services.urls')),
    path('api/', include('apps.paiements.urls')),
    path('api/', include('apps.employes.urls')),

    # Endpoints métier du module Chambres & Maintenances (Membre 2)
    path('api/', include('apps.chambres.urls')),
    path('api/', include('apps.maintenances.urls')),

    # Endpoints métier du module Clients & Avis (Safae)
    path('api/', include('apps.clients.urls')),
    path('api/', include('apps.avis.urls')),
]
