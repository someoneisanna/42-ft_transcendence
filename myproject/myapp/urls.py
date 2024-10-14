from django.urls import path
from . import views

urlpatterns = [
	path('', views.index, name='index'),
	path('landing/', views.landing_page, name='landing'),
	path('game_choice/', views.game_choice, name='game_choice'),
	path('users/', views.users, name='users'),						# API for getting all users
	path('login/', views.login, name='login'),						# API for logging in
	path('register/', views.register, name='register'),				# API for registering
	path('delete/', views.delete, name='delete'),					# API for deleting all users

	# path('', views.base, name='base'),
	# path('about/', views.about, name='about'),
	# path('contact/', views.contact, name='contact'),
]
