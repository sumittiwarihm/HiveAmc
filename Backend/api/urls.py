from django.urls import path
from .views import homePageData

urlpatterns = [
    path('homePage/', homePageData, name="homePage"),
]