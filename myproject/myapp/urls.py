from django.urls import path
from . import views

urlpatterns = [
	path('', views.index, name='index'),
	path('landing/', views.landing_page, name='landing'),			# HTML for landing page
	path('layout/', views.layout, name='layout'),					# HTML for header and footer
	path('menu_pong/', views.menu_pong, name='menu_pong'),			# HTML for pong menu
	
	path('login/', views.login, name='login'),						# API for logging in
	path('register/', views.register, name='register'),				# API for registering
	path('logout/', views.logout, name='logout'),					# API for logging out
	
	path('users/', views.users, name='users'),						# API for getting all users
	path('delete/', views.delete, name='delete'),					# API for deleting all users
]
