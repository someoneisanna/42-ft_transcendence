from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
	path('', views.index, name='index'),
	path('landing/', views.landing_page, name='landing'),									# HTML for landing page
	path('layout/', views.layout, name='layout'),											# HTML for header and footer
	path('game_choice/', views.game_choice, name='game_choice'),							# HTML for game choice
	path('menu_pong/', views.menu_pong, name='menu_pong'),									# HTML for pong menu
	path('dropdown_profile/', views.dropdown_profile, name='dropdown_profile'),				# HTML for profile page
	path('dropdown_settings/', views.dropdown_settings, name='dropdown_settings'),			# HTML for settings page
	path('dropdown_friends/', views.dropdown_friends, name='dropdown_friends'),				# HTML for friends page
	
	path('login/', views.login, name='login'),												# API for logging in
	path('register/', views.register, name='register'),										# API for registering
	path('logout/', views.logout, name='logout'),											# API for logging out
	path('upload_pic/', views.upload_pic, name='upload_pic'),								# API for uploading a profile picture

	path('users/', views.users, name='users'),												# API for getting all users
	path('delete/', views.delete, name='delete'),											# API for deleting all users
]

if settings.DEBUG:
	urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
