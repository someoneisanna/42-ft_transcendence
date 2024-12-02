from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from .models import User, Invitation, Friendship, Message
import json
import jwt
import datetime
import pyotp
import qrcode
from qrcode.image.pil import PilImage
from io import BytesIO
import base64
from django.core.files.storage import default_storage

# LOAD HTML PAGES ------------------------------------------------------------------------------------------------

def index(request):
	return render(request, 'index.html')

def landing_page(request):
	if request.user:
		return render(request, 'landing_page.html', {'username': request.user.username, 'isLogged': True})
	return render(request, 'landing_page.html', {'isLogged': False})

def layout(request):
	return render(request, 'layout.html', {'username': request.user.username, 'profile_pic': request.user.profile_pic.url})

def game_choice(request):
	return render(request, 'game_choice.html')

def pong_menu(request):
	return render(request, 'pong/pong_menu.html')

def pong_quickplay(request):
	return render(request, 'pong/pong_quickplay.html')

def pong_tournament(request):
	return render(request, 'pong/pong_tournament.html')

def pong_customGame(request):
	return render(request, 'pong/pong_customGame.html')

def pong_roomList(request):
	return render(request, 'pong/pong_roomList.html')

def dropdown_profile(request):
	return render(request, 'dropdown_profile.html', {'username': request.user.username, 'profile_pic': request.user.profile_pic.url})

def dropdown_settings(request):
	qr_code64 = ''
	if (request.user.check2FA == True):
		qr_code = generate_2fa_qr_code(secret=request.user.skey_2FA, username=request.user.username)
		qr_code64 = base64.b64encode(qr_code).decode('utf-8')
	return render(request, 'dropdown_settings.html', {
		'username': request.user.username, 
		'profile_pic': request.user.profile_pic.url,
		'qr_code': qr_code64,
		'motto': request.user.motto,
		'n_characters': len(request.user.motto),
		'check2FA': request.user.check2FA,
		'comments_policy': request.user.comments_policy,
		'allow_game_invitations': request.user.allow_game_invitations
		})

def dropdown_friends(request):
	return render(request, 'dropdown_friends.html')

def pong_game(request):
	return render(request, 'pong/pong_game.html')

def pong_matchmaking(request):
	return render(request, 'pong/pong_matchmaking.html')

def pong_localTournament(request):
	return render(request, 'pong/pong_localTournament.html', {'name': request.user.username, 'profile_pic': request.user.profile_pic.url})

# HELPER FUNCTIONS -----------------------------------------------------------------------------------------------

def generate_2fa_secret_key(user):
	return pyotp.random_base32()

def generate_2fa_qr_code(secret, username):
	totp = pyotp.TOTP(secret)
	qr_uri = totp.provisioning_uri(name=username, issuer_name='ft_transcendence 2FA')
	qr_code = qrcode.make(qr_uri, image_factory=PilImage)
	img_buffer = BytesIO()
	qr_code.save(img_buffer, format="PNG")
	img_buffer.seek(0)
	return img_buffer.getvalue()

def create_jwt_token(user):
	payload = {
		'user_id': user.id,
		'exp': datetime.datetime.now() + datetime.timedelta(days=1)
	}
	token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
	return token

# LOGIN USERS ----------------------------------------------------------------------------------------------------

def login(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			username_input = data['username']
			password_input = data['password']
			totp_2FA_input = data['totp_2FA']

			if not User.objects.filter(username=username_input).exists():
				return JsonResponse({'error': 'Username doesn\'t exist. Please register.'}, status=400)
			
			user = User.objects.get(username=username_input)
			if user.password != password_input:
				return JsonResponse({'error': 'Incorrect password. Please try again.'}, status=400)
			
			if user.check2FA == True:
				if totp_2FA_input == '':
					return JsonResponse({'message': '2FA required'}, status=422)
				totp = pyotp.TOTP(user.skey_2FA)
				if not totp.verify(totp_2FA_input):
					return JsonResponse({'error': 'Invalid 2FA code. Please try again.'}, status=400)

			token = create_jwt_token(user)
			response = JsonResponse({'username': user.username, 'checkbox': user.check2FA}, status=200)
			response.set_cookie('jwt_transcendence', token, httponly=True, max_age=None, expires=None)
			return response

		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)
	else:
		return redirect('/')

# REGISTER USERS -------------------------------------------------------------------------------------------------

def register(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			username_input = data['username']
			password_input = data['password']
			checkbox_input = data['checkbox']

			if User.objects.filter(username=username_input).exists():
				return JsonResponse({'error': 'Username already exists. Please login.'}, status=400)

			secret_key = generate_2fa_secret_key(user=username_input)
			qr_code = generate_2fa_qr_code(secret=secret_key, username=username_input)
			qr_code64 = base64.b64encode(qr_code).decode('utf-8')
			
			user = User.objects.create(username=username_input, password=password_input, check2FA=checkbox_input, skey_2FA=secret_key)

			token = create_jwt_token(user)
			response = JsonResponse({'username': user.username, 'checkbox': user.check2FA, 'qr_code': qr_code64}, status=200)
			response.set_cookie('jwt_transcendence', token, httponly=True, max_age=None, expires=None)
			return response

		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)
	else:
		return redirect('/')
	
# GET CURRENT USER -----------------------------------------------------------------------------------------------

def get_current_user(request):
	if request.method == 'GET':
		if request.user:
			return JsonResponse({'username': request.user.username}, status=200)
		return JsonResponse({'error': 'No user logged in'}, status=400)
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)

# UPDATE PASSWORD ------------------------------------------------------------------------------------------------

def update_password(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			old_password = data['old_password']
			new_password = data['new_password']

			if request.user.password != old_password:
				return JsonResponse({'error': 'Incorrect password. Please try again.'}, status=400)

			request.user.password = new_password
			request.user.save()

			return JsonResponse({'message': 'Password updated successfully'}, status=200)
		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)
	
# UPDATE 2FA CHECK -----------------------------------------------------------------------------------------------

def update2FAcheck(request):
	if request.method == 'POST':
		try:
			checkbox_input = json.loads(request.body)

			request.user.check2FA = checkbox_input
			request.user.save()

			secret_key = generate_2fa_secret_key(user=request.user.username)
			qr_code = generate_2fa_qr_code(secret=secret_key, username=request.user.username)
			qr_code64 = base64.b64encode(qr_code).decode('utf-8')

			request.user.skey_2FA = secret_key
			request.user.save()

			return JsonResponse({'message': f'2FAcheck updated successfully to {str(checkbox_input)}', 'qr_code': qr_code64}, status=200)
		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)

# LOGOUT USERS ---------------------------------------------------------------------------------------------------

def logout(request):
	if request.method == 'POST':
		response = JsonResponse({'message': 'Logged out successfully'}, status=200)
		response.delete_cookie('jwt_transcendence')
		return response
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)
	
# CHANGE PROFILE PICTURE -----------------------------------------------------------------------------------------

def change_pic(request):
	if request.method == 'POST' or request.method == 'DELETE':
		
		if request.method == 'POST':
			profile_picture = request.FILES.get('profile_pic')
		else:
			profile_picture = 'default.jpg'

		if profile_picture:
			if request.user.profile_pic and request.user.profile_pic.name != 'default.jpg':
				if default_storage.exists(request.user.profile_pic.name):
					default_storage.delete(request.user.profile_pic.name)
			request.user.profile_pic = profile_picture
			request.user.save()
			return JsonResponse({'message': 'Profile picture changed successfully.', 'path': request.user.profile_pic.url}, status=200)
		return JsonResponse({'error': 'No file provided.'}, status=400)
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)

# UPDATE MOTTO ---------------------------------------------------------------------------------------------------

def update_motto(request):
	if request.method == 'POST':
		try:
			new_motto = json.loads(request.body)

			if new_motto == request.user.motto:
				return JsonResponse({'message': 'Motto is already set to this value.'}, status=200)

			request.user.motto = new_motto
			request.user.save()

			return JsonResponse({'message': 'Motto changed successfully!'}, status=200)
		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)

# UPDATE COMMENTS POLICY -----------------------------------------------------------------------------------------

def update_comments_policy(request):
	if request.method == 'POST':
		try:
			policy_input = json.loads(request.body)

			if policy_input != 'anyone' and policy_input != 'friends' and policy_input != 'nobody':
				return JsonResponse({'error': 'Invalid policy'}, status=400)

			request.user.comments_policy = policy_input
			request.user.save()

			return JsonResponse({'message': 'Comments policy updated to ' + policy_input}, status=200)
		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)

# UPDATE GAME INVITATIONS POLICY --------------------------------------------------------------------------------

def update_game_invitations_policy(request):
	if request.method == 'POST':
		try:
			checkbox_input = json.loads(request.body)

			request.user.allow_game_invitations = checkbox_input
			request.user.save()

			return JsonResponse({'message': f'Game invitations policy updated successfully to {str(checkbox_input)}'}, status=200)
		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)

# SEARCH FOR FRIENDS ---------------------------------------------------------------------------------------------

def search_friends(request):
	if request.method == 'GET':
		search_input = request.GET.get('q', '').strip()
		if search_input == '':
			return JsonResponse({'error': 'No search input provided'}, status=200)

		blocked_by_users = request.user.blocked_by.all()
		users = User.objects.exclude(id=request.user.id)
		users = users.exclude(id__in=blocked_by_users)
		users = users.filter(username__icontains=search_input)

		if not users.exists():
			return JsonResponse([], safe=False)
		user_list = []
		for user in users:
			user_list.append({
				'username': user.username,
				'profile_pic': user.profile_pic.url
			})
		return JsonResponse(user_list, safe=False)
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)
	
# SEARCH FOR PENDING FRIEND REQUESTS ------------------------------------------------------------------------------

def search_pending(request):
	if request.method == 'GET':
		pending_list = []
		pending_invitations = Invitation.objects.filter(to_user=request.user)
		for invitation in pending_invitations:
			pending_list.append({
				'username': invitation.from_user.username,
				'profile_pic': invitation.from_user.profile_pic.url
			})
		return JsonResponse(pending_list, safe=False)
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)

# GET RELATIONSHIP BETWEEN TWO USERS -----------------------------------------------------------------------------

def get_relationship(request):
	if request.method == 'GET':
		try:
			username_input = request.GET.get('username', '')
			if username_input == '':
				return JsonResponse({'error': 'No username provided'}, status=400)
			if not User.objects.filter(username=username_input).exists():
				return JsonResponse({'error': 'Username doesn\'t exist'}, status=400)
			target_user = User.objects.get(username=username_input)
			relationship = 'none'
			if request.user.blocked_users.filter(username=target_user.username).exists():
				relationship = 'blocked'
			elif Friendship.objects.filter(user1=request.user, user2=target_user).exists() or Friendship.objects.filter(user1=target_user, user2=request.user).exists():
				relationship = 'friends'
			elif Invitation.objects.filter(from_user=request.user, to_user=target_user).exists():
				relationship = 'invitation_sent'
			elif Invitation.objects.filter(from_user=target_user, to_user=request.user).exists():
				relationship = 'invitation_received'
			return JsonResponse({'relationship': relationship}, status=200)
		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)
	
# GET ALL FRIENDS ------------------------------------------------------------------------------------------------

def get_friends(request):
	if request.method == 'GET':
		friendships = Friendship.objects.filter(user1=request.user) | Friendship.objects.filter(user2=request.user)
		friend_list = []
		for friendship in friendships:
			if friendship.user1 == request.user:
				friend_list.append({
					'id': friendship.user2.id,
					'username': friendship.user2.username,
					'profile_pic': friendship.user2.profile_pic.url
				})
			else:
				friend_list.append({
					'id': friendship.user1.id,
					'username': friendship.user1.username,
					'profile_pic': friendship.user1.profile_pic.url
				})
		friend_list = sorted(friend_list, key=lambda friend: friend['username'].lower())
		return JsonResponse({'friends': friend_list, 'current_user': request.user.username}, safe=False)
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)

	
# SEND FRIEND REQUEST --------------------------------------------------------------------------------------------

def send_friend_request(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			username_input = data['username']

			if not User.objects.filter(username=username_input).exists():
				return JsonResponse({'error': 'Username doesn\'t exist'}, status=400)

			target_user = User.objects.get(username=username_input)

			if request.user == target_user:
				return JsonResponse({'error': 'You cannot send a friend request to yourself'}, status=400)

			if Invitation.objects.filter(from_user=request.user, to_user=target_user).exists():
				return JsonResponse({'error': 'Friend request already sent'}, status=400)

			Invitation.objects.create(from_user=request.user, to_user=target_user)

			return JsonResponse({'success': 'Friend request sent successfully'}, status=200)

		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)

# ACCEPT FRIEND REQUEST ------------------------------------------------------------------------------------------

def accept_invitation(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			username_input = data['username']

			if not User.objects.filter(username=username_input).exists():
				return JsonResponse({'error': 'Username doesn\'t exist'}, status=400)

			target_user = User.objects.get(username=username_input)

			if request.user == target_user:
				return JsonResponse({'error': 'You cannot accept a friend request from yourself'}, status=400)

			if not Invitation.objects.filter(from_user=target_user, to_user=request.user).exists():
				return JsonResponse({'error': 'No friend request found'}, status=400)

			Friendship.objects.create(user1=request.user, user2=target_user)

			Invitation.objects.filter(from_user=target_user, to_user=request.user).delete()

			return JsonResponse({'success': 'Friend request accepted successfully'}, status=200)

		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)

# REJECT FRIEND REQUEST ------------------------------------------------------------------------------------------

def reject_invitation(request):
	if request.method == 'POST':
		print('1')
		try:
			print('2')
			data = json.loads(request.body)
			username_input = data['username']

			if not User.objects.filter(username=username_input).exists():
				return JsonResponse({'error': 'Username doesn\'t exist'}, status=400)

			target_user = User.objects.get(username=username_input)

			if request.user == target_user:
				return JsonResponse({'error': 'You cannot reject a friend request from yourself'}, status=400)

			if not Invitation.objects.filter(from_user=target_user, to_user=request.user).exists():
				return JsonResponse({'error': 'No friend request found'}, status=400)

			Invitation.objects.filter(from_user=target_user, to_user=request.user).delete()

			return JsonResponse({'success': 'Friend request rejected successfully'}, status=200)

		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)

# REMOVE FRIEND --------------------------------------------------------------------------------------------------

def remove_friend(request):
	if request.method == 'POST':
		print('1')
		try:
			print('2')
			data = json.loads(request.body)
			username_input = data['username']

			if not User.objects.filter(username=username_input).exists():
				return JsonResponse({'error': 'Username doesn\'t exist'}, status=400)

			target_user = User.objects.get(username=username_input)

			if request.user == target_user:
				return JsonResponse({'error': 'You cannot remove yourself'}, status=400)

			if not Friendship.objects.filter(user1=request.user, user2=target_user).exists() and not Friendship.objects.filter(user1=target_user, user2=request.user).exists():
				return JsonResponse({'error': 'You are not friends with this user'}, status=400)

			Friendship.objects.filter(user1=request.user, user2=target_user).delete()
			Friendship.objects.filter(user1=target_user, user2=request.user).delete()

			return JsonResponse({'success': 'Friend removed successfully'}, status=200)

		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)

# CANCEL FRIEND REQUEST ------------------------------------------------------------------------------------------

def cancel_invitation(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			username_input = data['username']

			if not User.objects.filter(username=username_input).exists():
				return JsonResponse({'error': 'Username doesn\'t exist'}, status=400)

			target_user = User.objects.get(username=username_input)

			if request.user == target_user:
				return JsonResponse({'error': 'You cannot cancel a friend request to yourself'}, status=400)

			if not Invitation.objects.filter(from_user=request.user, to_user=target_user).exists():
				return JsonResponse({'error': 'No friend request found'}, status=400)

			Invitation.objects.filter(from_user=request.user, to_user=target_user).delete()

			return JsonResponse({'success': 'Friend request cancelled successfully'}, status=200)

		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)
	
# BLOCK USER -----------------------------------------------------------------------------------------------------

def block_user(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			currentUser_input = data['current_user']
			targetUser_input = data['target']

			if not User.objects.filter(username=currentUser_input).exists():
				return JsonResponse({'error': 'Current user doesn\'t exist'}, status=400)
			
			if not User.objects.filter(username=targetUser_input).exists():
				return JsonResponse({'error': 'Target user doesn\'t exist'}, status=400)
			
			current_user = User.objects.get(username=currentUser_input)
			target_user = User.objects.get(username=targetUser_input)

			if current_user == target_user:
				return JsonResponse({'error': 'You cannot block yourself'}, status=400)
			
			if Friendship.objects.filter(user1=current_user, user2=target_user).exists():
				Friendship.objects.filter(user1=current_user, user2=target_user).delete()
			
			if Friendship.objects.filter(user1=target_user, user2=current_user).exists():
				Friendship.objects.filter(user1=target_user, user2=current_user).delete()

			current_user.blocked_users.add(target_user)
			current_user.save()

			return JsonResponse({'success': 'User blocked successfully'}, status=200)
		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)

# UNBLOCK USER ---------------------------------------------------------------------------------------------------

def unblock_user(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			targetUser_input = data['username']

			if not User.objects.filter(username=request.user.username).exists():
				return JsonResponse({'error': 'Current user doesn\'t exist'}, status=400)
			
			if not User.objects.filter(username=targetUser_input).exists():
				return JsonResponse({'error': 'Target user doesn\'t exist'}, status=400)
			
			current_user = User.objects.get(username=request.user.username)
			target_user = User.objects.get(username=targetUser_input)

			if current_user == target_user:
				return JsonResponse({'error': 'You cannot unblock yourself'}, status=400)
			
			if not current_user.blocked_users.filter(username=target_user.username).exists():
				return JsonResponse({'error': 'User not blocked'}, status=400)

			current_user.blocked_users.remove(target_user)
			current_user.save()

			return JsonResponse({'success': 'User unblocked successfully'}, status=200)
		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)

# DELETE USER ----------------------------------------------------------------------------------------------------

def delete_user(request):
	if request.method == 'DELETE':
		request.user.delete()
		response = JsonResponse({'message': 'User deleted successfully'}, status=200)
		response.delete_cookie('jwt_transcendence')
		return response
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)

# GET ALL USERS IN THE DATABASE (FOR TESTING PURPOSES) -----------------------------------------------------------

def users(request):
	if request.method == 'GET':
		users = User.objects.all().values('id', 'username', 'password', 'check2FA', 'skey_2FA', 'profile_pic', 'motto', 'comments_policy', 'allow_game_invitations')
		user_list = list(users)
		return JsonResponse(user_list, safe=False)

def friendships(request):
	if request.method == 'GET':
		friendships = Friendship.objects.all().values('user1', 'user2', 'created_at')
		friend_list = list(friendships)
		return JsonResponse(friend_list, safe=False)

def delete(request):
	if request.method == 'GET':
		User.objects.all().delete()
		Friendship.objects.all().delete()
		Invitation.objects.all().delete()
		Message.objects.all().delete()
		return JsonResponse({'message': 'All users deleted'}, status=204)
