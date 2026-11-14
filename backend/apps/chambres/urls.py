from rest_framework.routers import DefaultRouter
from .views import CategorieChambreViewSet, ChambreViewSet

router = DefaultRouter()
router.register(r'categories-chambres', CategorieChambreViewSet, basename='categorie-chambre')
router.register(r'chambres', ChambreViewSet, basename='chambre')

urlpatterns = router.urls
