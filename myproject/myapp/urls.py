from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),  # URL for the homepage
    path('items/', views.item_list, name='item-list'),
    path('items/<int:item_id>/', views.item_detail, name='item-detail'),
]
