from django.urls import path
from .views import home, new_and_repeat, audience, path_analysis, ad_overlap , reach_and_frequency

urlpatterns = [
    path('homePage/', home, name="home"),
    path('new_and_repeat/', new_and_repeat, name="new_and_repeat"),
    path('audience/', reach_and_frequency, name="audience"),
    path('path_analysis/', path_analysis, name="path_analysis"),
    path('ad_overlap/', ad_overlap, name="ad_overlap"),
]