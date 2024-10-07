from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),  # URL for the homepage
    path('users/', views.user_list, name='user-list'),
	path('users/<str:username>/', views.user_detail, name='user-detail'),
]
