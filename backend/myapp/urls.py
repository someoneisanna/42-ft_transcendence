from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
	path('', views.index, name='index'),
	path('landing/', views.landing_page, name='landing'),										# HTML for landing page
	path('layout/', views.layout, name='layout'),												# HTML for header and footer
	path('game_choice/', views.game_choice, name='game_choice'),								# HTML for game choice
	path('pong_quickplay/', views.pong_quickplay, name='pong_quickplay'),						# HTML for quickplay
	path('pong_tournament/', views.pong_tournament, name='pong_tournament'),					# HTML for tournament
	path('pong_customGame/', views.pong_customGame, name='pong_customGame'),					# HTML for custom game
	path('pong_roomList/', views.pong_roomList, name='pong_roomList'),							# HTML for room list
	path('pong_menu/', views.pong_menu, name='pong_menu'),										# HTML for pong menu
	path('pong_game/', views.pong_game, name='pong_game'),										# HTML for game
	path('user_profile/', views.user_profile, name='user_profile'),								# HTML for user profile
	path('dropdown_profile/', views.dropdown_profile, name='dropdown_profile'),					# HTML for profile page
	path('dropdown_settings/', views.dropdown_settings, name='dropdown_settings'),				# HTML for settings page
	path('dropdown_friends/', views.dropdown_friends, name='dropdown_friends'),					# HTML for friends page
	path('pong_matchmaking/', views.pong_matchmaking, name='pong_matchmaking'),					# HTML for matchmaking
	path('pong_localTournament/', views.pong_localTournament, name='pong_localTournament'),		# HTML for local tournament
	path('pong_remoteTournament/', views.pong_remoteTournament, name='pong_remoteTournament'),	# HTML for remote tournament
	
	path('api/login/', views.login, name='login'),																				# API for logging in
	path('api/register/', views.register, name='register'),																		# API for registering
	path('api/get_current_user/', views.get_current_user, name='get_current_user'),												# API for getting the current user
	path('api/update_email/', views.update_email, name='update_email'),															# API for updating email
	path('api/update_password/', views.update_password, name='update_password'),												# API for updating password
	path('api/update_default_language/', views.update_default_language, name='update_default_language'),						# API for updating default language
	path('api/update2FAcheck/', views.update2FAcheck, name='update2FAcheck'),													# API for updating 2FA check
	path('api/logout/', views.logout, name='logout'),																			# API for logging out
	path('api/send_email/', views.send_email, name='send_email'),																# API for sending an email
	path('api/verify_password_code/', views.verify_password_code, name='verify_password_code'),									# API for verifying a password code
	path('api/change_pic/', views.change_pic, name='change_pic'),																# API for changing a profile picture
	path('api/update_motto/', views.update_motto, name='update_motto'),															# API for changing a motto
	path('api/update_comments_policy/', views.update_comments_policy, name='update_comments_policy'),							# API for updating comments policy
	path('api/update_game_invitations_policy/', views.update_game_invitations_policy, name='update_game_invitations_policy'),	# API for updating game invitations policy
	path('api/get_game_invitation_settings/', views.get_game_invitation_settings, name='get_game_invitation_settings'),			# API for getting game invitation settings
	path('api/search_friends/', views.search_friends, name='search_friends'),													# API for searching for users
	path('api/search_pending/', views.search_pending, name='search_pending'),													# API for searching for pending friend requests
	path('api/get_relationship/', views.get_relationship, name='get_relationship'),												# API for getting the relationship between two users
	path('api/get_friends/', views.get_friends, name='get_friends'),															# API for getting all friends
	path('api/send_friend_request/', views.send_friend_request, name='send_friend_request'),									# API for sending a friend request
	path('api/accept_invitation/', views.accept_invitation, name='accept_invitation'),											# API for accepting a friend request
	path('api/reject_invitation/', views.reject_invitation, name='reject_invitation'),											# API for rejecting a friend request
	path('api/remove_friend/', views.remove_friend, name='remove_friend'),														# API for removing a friend
	path('api/cancel_invitation/', views.cancel_invitation, name='cancel_invitation'),											# API for cancelling a friend request
	path('api/block_user/', views.block_user, name='block_user'),																# API for blocking a user
	path('api/unblock_user/', views.unblock_user, name='unblock_user'),															# API for unblocking a user
	path('api/delete_user/', views.delete_user, name='delete_user'),															# API for deleting all users
	path('api/pong_log_stats/', views.pong_log_stats, name='pong_log_stats'),													# API for logging pong game stats
	path('api/pong_log_tournament_win/', views.pong_log_tournament_win, name='pong_log_tournament_win'),					# API for logging pong tournament win
	path('api/pong_get_stats/', views.pong_get_stats, name='pong_get_stats'),													# API for getting pong game stats
	path('api/pong_get_history_stats/', views.pong_get_history_stats, name='pong_get_history_stats'),							# API for getting pong game history stats
	path('api/post_profile_comment/', views.post_profile_comment, name='post_profile_comment'),									# API for posting a profile comment
	path('api/get_profile_comments/', views.get_profile_comments, name='get_profile_comments'),									# API for getting user comments
	path('api/delete_profile_comment/', views.delete_profile_comment, name='delete_profile_comment'),							# API for deleting a profile comment
	path('api/reset_stats/', views.reset_stats, name='reset_stats'),															# API for resetting stats

	##path('users/', views.users, name='users'),												# API for getting all users
	#path('friendships/', views.friendships, name='friendships'),							# API for getting all friends
	#path('messages/', views.messages, name='messages'),										# API for getting all messages
	#path('delete/', views.delete, name='delete'),											# API for deleting all users
	#path('pong_matches/', views.pong_matches, name='pong_matches'),							# API for getting all pong matches
	#path('comments/', views.comments, name='comments'),										# API for getting all comments
]

if settings.DEBUG:
	urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
