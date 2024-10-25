from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
	path('', views.index, name='index'),
	path('landing/', views.landing_page, name='landing'),									# HTML for landing page
	path('layout/', views.layout, name='layout'),											# HTML for header and footer
	path('game_choice/', views.game_choice, name='game_choice'),							# HTML for game choice
	path('pong_quickplay/', views.pong_quickplay, name='pong_quickplay'),					# HTML for quickplay
	path('pong_tournament/', views.pong_tournament, name='pong_tournament'),				# HTML for tournament
	path('pong_customGame/', views.pong_customGame, name='pong_customGame'),				# HTML for custom game
	path('pong_roomList/', views.pong_roomList, name='pong_roomList'),						# HTML for room list
	path('menu_pong/', views.menu_pong, name='menu_pong'),									# HTML for pong menu
	path('dropdown_profile/', views.dropdown_profile, name='dropdown_profile'),				# HTML for profile page
	path('dropdown_settings/', views.dropdown_settings, name='dropdown_settings'),			# HTML for settings page
	path('dropdown_friends/', views.dropdown_friends, name='dropdown_friends'),				# HTML for friends page
	
	path('api/login/', views.login, name='login'),												# API for logging in
	path('api/register/', views.register, name='register'),										# API for registering
	path('api/logout/', views.logout, name='logout'),											# API for logging out
	path('api/change_pic/', views.change_pic, name='change_pic'),								# API for changing a profile picture
	path('api/search_friends/', views.search_friends, name='search_friends'),					# API for searching for users
	path('api/get_relationship/', views.get_relationship, name='get_relationship'),				# API for getting the relationship between two users
	path('api/send_friend_request/', views.send_friend_request, name='send_friend_request'),	# API for sending a friend request
	path('api/accept_invitation/', views.accept_invitation, name='accept_invitation'),			# API for accepting a friend request
	path('api/reject_invitation/', views.reject_invitation, name='reject_invitation'),			# API for rejecting a friend request
	path('api/remove_friend/', views.remove_friend, name='remove_friend'),						# API for removing a friend
	path('api/cancel_invitation/', views.cancel_invitation, name='cancel_invitation'),			# API for cancelling a friend request

	path('users/', views.users, name='users'),												# API for getting all users
	path('delete/', views.delete, name='delete'),											# API for deleting all users
]

if settings.DEBUG:
	urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
