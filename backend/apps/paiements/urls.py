from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import PaiementViewSet, SejourResumeFinancierView, DashboardStatsView

router = DefaultRouter()
router.register(r'paiements', PaiementViewSet, basename='paiement')

urlpatterns = [
    path('sejours/<int:id>/resume-financier/', SejourResumeFinancierView.as_view(), name='sejour-resume-financier'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
] + router.urls
