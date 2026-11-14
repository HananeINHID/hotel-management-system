from rest_framework.routers import DefaultRouter
from .views import ServiceViewSet, ConsommationServiceViewSet

router = DefaultRouter()
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'consommations', ConsommationServiceViewSet, basename='consommation')

urlpatterns = router.urls
