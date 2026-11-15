
from rest_framework.routers import DefaultRouter

from .views import SejourViewSet


router = DefaultRouter()
router.register("sejours", SejourViewSet, basename="sejour")

urlpatterns = router.urls
