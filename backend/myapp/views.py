from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from .models import User, Invitation, Friendship, Message, PongGame, Comment
import json
import jwt
import datetime
import pyotp
import qrcode
from qrcode.image.pil import PilImage
from io import BytesIO
import base64
from django.core.files.storage import default_storage
from django.utils.dateparse import parse_datetime
from django.core.mail import send_mail

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

def user_profile(request):
	if request.method == 'GET':
		username = request.GET.get('u', '').strip()
		user = User.objects.get(username=username)
		if not user:
			redirect('/')
		pong_game_wins = user.pong_game_wins
		total_wins = sum(pong_game_wins)
		pong_game_losses = user.pong_game_losses
		total_losses = sum(pong_game_losses)
		tournament_wins = user.pong_tournament_wins
		total_tournament_wins = sum(tournament_wins)
		tournament_losses = user.pong_tournament_losses
		total_tournament_losses = sum(tournament_losses)
		tournament_final_wins = user.pong_n_tournaments_won
		return render(request, 'user_profile.html', {
			'username': user.username, 
			'profile_pic': user.profile_pic.url,
			'motto': user.motto,
			'joined': user.joined,
			'games_played': total_wins + total_losses,
			'games_won': total_wins,
			'games_lost': total_losses,
			'tournaments_played': total_tournament_wins + total_tournament_losses,
			'tournaments_won': total_tournament_wins,
			'tournaments_lost': total_tournament_losses,
			'tournaments_final_won': tournament_final_wins,
		})

def dropdown_profile(request):
	pong_game_wins = request.user.pong_game_wins
	total_wins = sum(pong_game_wins)
	pong_game_losses = request.user.pong_game_losses
	total_losses = sum(pong_game_losses)
	tournament_wins = request.user.pong_tournament_wins
	total_tournament_wins = sum(tournament_wins)
	tournament_losses = request.user.pong_tournament_losses
	total_tournament_losses = sum(tournament_losses)
	tournament_final_wins = request.user.pong_n_tournaments_won
	return render(request, 'dropdown_profile.html', {
		'username': request.user.username, 
		'profile_pic': request.user.profile_pic.url,
		'motto': request.user.motto,
		'joined': request.user.joined,
		'games_played': total_wins + total_losses,
		'games_won': total_wins,
		'games_lost': total_losses,
		'tournaments_played': total_tournament_wins + total_tournament_losses,
		'tournaments_won': total_tournament_wins,
		'tournaments_lost': total_tournament_losses,
		'tournaments_final_won': tournament_final_wins
		})

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
		'allow_game_invitations': request.user.allow_game_invitations,
		'default_language': str(request.user.default_language)
		})

def dropdown_friends(request):
	return render(request, 'dropdown_friends.html')

def pong_game(request):
	return render(request, 'pong/pong_game.html')

def pong_matchmaking(request):
	return render(request, 'pong/pong_matchmaking.html')

def pong_localTournament(request):
	return render(request, 'pong/pong_localTournament.html', {'name': request.user.username, 'profile_pic': request.user.profile_pic.url})

def pong_remoteTournament(request):
	return render(request, 'pong/pong_remoteTournament.html', {'name': request.user.username, 'profile_pic': request.user.profile_pic.url})

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
			response = JsonResponse({'username': user.username, 'language': user.default_language, 'checkbox': user.check2FA}, status=200)
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
			email_input = data['email'].lower()
			password_input = data['password']
			checkbox_input = data['checkbox']

			if User.objects.filter(username__iexact=username_input).exists():
				return JsonResponse({'error': 'Username already exists. Please login.'}, status=400)
			if User.objects.filter(email=email_input).exists():
				return JsonResponse({'error': 'Email already exists. Please login.'}, status=400)

			secret_key = generate_2fa_secret_key(user=username_input)
			qr_code = generate_2fa_qr_code(secret=secret_key, username=username_input)
			qr_code64 = base64.b64encode(qr_code).decode('utf-8')
			
			user = User.objects.create(username=username_input, email=email_input, password=password_input, check2FA=checkbox_input, skey_2FA=secret_key, 
				pong_game_wins=[0, 0, 0, 0], pong_game_losses=[0, 0, 0, 0], pong_tournament_wins=[0, 0], pong_tournament_losses=[0, 0], pong_n_tournaments_won=0)

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

# UPDATE EMAIL ---------------------------------------------------------------------------------------------------

def update_email(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			new_email = data['email']
			password = data['password']

			if User.objects.filter(email=new_email).exists():
				return JsonResponse({'error': 'Email already exists. Please try again.'}, status=400)
			
			if request.user.password != password:
				return JsonResponse({'error': 'Incorrect password. Please try again.'}, status=400)

			request.user.email = new_email
			request.user.save()

			return JsonResponse({'message': 'Email updated successfully!'}, status=200)
		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)
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

			return JsonResponse({'message': 'Password updated successfully!'}, status=200)
		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)

# UPDATE DEFAULT LANGUAGE ----------------------------------------------------------------------------------------

def update_default_language(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			new_language = data['language']

			if new_language != '0' and new_language != '1' and new_language != '2' and new_language != '3':
				return JsonResponse({'error': 'Invalid language'}, status=400)

			request.user.default_language = int(new_language)
			request.user.save()

			return JsonResponse({'message': 'Default language updated to ' + new_language}, status=200)
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

# SEND EMAIL TO RESET PASSWORD -----------------------------------------------------------------------------------

def send_email(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			email_input = data['email']

			if not User.objects.filter(email=email_input).exists():
				return JsonResponse({'error': 'Email doesn\'t exist. Please register.'}, status=400)
			user = User.objects.get(email=email_input)

			verification_code = pyotp.random_base32()
			totp = pyotp.TOTP(verification_code)
			verification_code = totp.now()

			print("Your 6-digit verification code is:", verification_code)
			user.verification_code = verification_code
			user.save()

			subject = 'ft_transcendence - Reset Password'
			message = 'Greetings, ' + user.username + '!\n' + 'Enter this verification code to reset your password: ' + verification_code
			send_mail(subject, message, settings.EMAIL_HOST_USER, [email_input])

			return JsonResponse({'email': email_input, 'message': 'Email sent successfully'}, status=200)
		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)
	
# VERIFY PASSWORD CODE -------------------------------------------------------------------------------------------

def verify_password_code(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			code_input = data['code']
			email_input = data['email']
			password_input = data['password']

			if not User.objects.filter(email=email_input).exists():
				return JsonResponse({'error': 'Email doesn\'t exist. Please register.'}, status=400)
			user = User.objects.get(email=email_input)

			if user.verification_code != code_input:
				return JsonResponse({'error': 'Incorrect verification code. Please try again.'}, status=400)
			
			user.password = password_input
			user.verification_code = ''
			user.save()

			return JsonResponse({'message': 'Verification code correct'}, status=200)
		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)
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

# GET GAME INVITATION SETTINGS -----------------------------------------------------------------------------------

def get_game_invitation_settings(request):
	if request.method == 'GET':
		username = request.GET.get('u', '').strip()
		if username == '':
			return JsonResponse({'error': 'No username provided'}, status=400)
		user = User.objects.get(username=username)
		if not user:
			return JsonResponse({'error': 'User doesn\'t exist'}, status=400)
		return JsonResponse({'allow_game_invitations': user.allow_game_invitations}, status=200)
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
		try:
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
		try:
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

# LOG PONG GAME STATS --------------------------------------------------------------------------------------------

def pong_log_stats(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			game_type = data['game_type']
			room_name = data['room_name']
			
			if not User.objects.filter(username=data['player1']).exists():
				player1 = None
			else:
				player1 = User.objects.get(username=data['player1'])
				
			if not User.objects.filter(username=data['player2']).exists():
				player2 = None
			else:
				player2 = User.objects.get(username=data['player2'])
			player1_score = data['player1_score']
			player2_score = data['player2_score']

			# Add game to the list of games
			try:
				PongGame.objects.create(game_type=game_type, room_name=room_name, player1=player1, player2=player2, player1_score=player1_score, player2_score=player2_score)
			except IntegrityError:
				return JsonResponse({'message': 'Game log already exists'}, status=200)

			# Add game result to each user's database
			if game_type == 'duel':
				index = 0
			elif game_type == 'remote':
				index = 1
			elif game_type == 'ai_match':
				index = 2
			elif game_type == 'custom_local' or game_type == 'custom_ai':
				index = 3
			elif game_type == 'local_tournament':
				index = 10
			elif game_type == 'remote_tournament':
				index = 11

			if player1_score > player2_score:
				if player1:
					if index < 10:
						player1.pong_game_wins[index] += 1
					else:
						player1.pong_tournament_wins[index - 10] += 1
					player1.save()
				if player2:
					if index < 10:
						player2.pong_game_losses[index] += 1
					else:
						player2.pong_tournament_losses[index - 10] += 1
					player2.save()
			elif player1_score < player2_score:
				if player1:
					if index < 10:
						player1.pong_game_losses[index] += 1
					else:
						player1.pong_tournament_losses[index - 10] += 1
					player1.save()
				if player2:
					if index < 10:
						player2.pong_game_wins[index] += 1
					else:
						player2.pong_tournament_wins[index - 10] += 1
					player2.save()
	
			return JsonResponse({'message': 'Game stats logged successfully'}, status=200)
		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)
	
# LOG PONG TOURNAMENT WIN ----------------------------------------------------------------------------------------

def pong_log_tournament_win(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			if not User.objects.filter(username=data['username']).exists():
				return JsonResponse({'error': 'User not found'}, status=400)
			user = User.objects.get(username=data['username'])
			if user != request.user:
				return JsonResponse({'error': 'You cannot log a tournament win for another user'}, status=400)
			user.pong_n_tournaments_won += 1
			user.save()
			return JsonResponse({'message': 'Tournament win logged successfully'}, status=200)
		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)

# GET STATS HELPERS ----------------------------------------------------------------------------------------------

def get_stats_history_list(user, start, end):
	stats = PongGame.objects.filter(player1=user) | PongGame.objects.filter(player2=user)
	stats_count = stats.count()
	stats = stats.order_by('-created_at')[start:end]
	games_list = []

	if not stats.exists():
		return ({'games': games_list, 'total': stats_count})
	
	for stat in stats:
		if (stat.game_type == 'duel' or stat.game_type == 'custom_local' or stat.game_type == 'local_tournament'):
			opponent = 'Guest'
		elif (stat.game_type == 'ai_match' or stat.game_type == 'custom_ai'):
			opponent = 'AI'
		if (stat.player1 == user):
			username = stat.player1.username
			if (stat.game_type == 'remote' or stat.game_type == 'remote_tournament'):
				if stat.player2:
					opponent = stat.player2.username
				else:
					opponent = 'Player'
			user_score = stat.player1_score
			opponent_score = stat.player2_score
		else:
			username = stat.player2.username
			if (stat.game_type == 'remote' or stat.game_type == 'remote_tournament'):
				if stat.player1:
					opponent = stat.player1.username
				else:
					opponent = 'Player'
			user_score = stat.player2_score
			opponent_score = stat.player1_score
		games_list.append({
				'game_type': stat.game_type,
				'user': username,
				'opponent': opponent,
				'user_score': user_score,
				'opponent_score': opponent_score,
				'created_at': stat.created_at
			})
	return ({'games': games_list, 'total': stats_count})

# GET PONG GAME STATS (NEXT AND PREVIOUS) ------------------------------------------------------------------------

def pong_get_history_stats(request):
	if request.method == 'GET':
		try:
			username = request.GET.get('q', '').strip()
			start = int(request.GET.get('start', '0'))
			end = start + 15
			user = User.objects.get(username=username)
			if not user:
				return JsonResponse({'error': 'User not found'}, status=400)
			history = get_stats_history_list(user, start, end)
			games = history.get('games')
			if not games:
				games = []
			count = history.get('total')
			return JsonResponse({'games': games, 'total': count})
		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)
	
# GET PONG GAME STATS --------------------------------------------------------------------------------------------

def pong_get_stats(request):
	if request.method == 'GET':
		try:
			username = request.GET.get('q', '').strip()
			user = User.objects.get(username=username)
			if not user:
				return JsonResponse({'error': 'User not found'}, status=400)
			game_wins = user.pong_game_wins
			game_losses = user.pong_game_losses
			tournament_wins = user.pong_tournament_wins
			tournament_losses = user.pong_tournament_losses
			history = get_stats_history_list(user, 0, 15)
			games = history.get('games')
			if not games:
				games = []
			count = history.get('total')
			return JsonResponse({'games': games, 'total': count, 'game_wins': game_wins, 'game_losses': game_losses, 'tournament_wins': tournament_wins, 'tournament_losses': tournament_losses})
		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)
	
# POST A COMMENT IN A USER'S PROFILE -----------------------------------------------------------------------------

def post_profile_comment(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			recipient = User.objects.get(username=data['recipient'])
			if not recipient:
				return JsonResponse({'error': 'Recipient not found'}, status=400)
			author = request.user
			message = data['message']

			if author.blocked_by.filter(username=recipient.username).exists():
				return JsonResponse({'error': 'You are blocked by this user'}, status=400)
			
			if recipient.comments_policy == 'nobody':
				return JsonResponse({'error': 'This user does not accept comments'}, status=400)
			
			if recipient.comments_policy == 'friends' and not Friendship.objects.filter(user1=recipient, user2=author).exists() and not Friendship.objects.filter(user1=author, user2=recipient).exists():
				return JsonResponse({'error': 'This user only accepts comments from friends'}, status=400)
			
			comment = Comment.objects.create(author=author, recipient=recipient, message=message)

			return JsonResponse({'id': comment.id, 'author': author.username, 'profile_pic': author.profile_pic.url, 'message': message, 'created_at': comment.created_at}, status=200)
		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)
	
# DELETE A COMMENT ------------------------------------------------------------------------------------------------

def delete_profile_comment(request):
	if request.method == 'DELETE':
		try:
			data = json.loads(request.body)
			id = data['id']
			author = data['author']
			recipient = data['recipient']
			
			author = User.objects.get(username=author)
			if not author:
				return JsonResponse({'error': 'Author not found'}, status=400)
			
			recipient = User.objects.get(username=recipient)
			if not recipient:
				return JsonResponse({'error': 'Recipient not found'}, status=423)
			if recipient != request.user:
				return JsonResponse({'error': 'You cannot delete comments in other users\' profiles'}, status=400)

			comment = Comment.objects.filter(id=id, author=author, recipient=recipient)
			if not comment.exists():
				return JsonResponse({'error': 'Comment not found'}, status=400)
			comment.delete()

			return JsonResponse({'message': 'Comment deleted successfully'}, status=200)
		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)
	
# GET USER PROFILE COMMENTS --------------------------------------------------------------------------------------

def get_profile_comments(request):
	if request.method == 'GET':
		try:
			username = request.GET.get('q', '').strip()
			user = User.objects.get(username=username)
			if not user:
				return JsonResponse({'error': 'User not found'}, status=400)
			comments = Comment.objects.filter(recipient=user).order_by('-created_at')
			comments_list = []
			for comment in comments:
				comments_list.append({
					'id': comment.id,
					'author': comment.author.username,
					'profile_pic': comment.author.profile_pic.url,
					'message': comment.message,
					'created_at': comment.created_at
				})
			return JsonResponse({'comments': comments_list}, status=200)
		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)
	
# RESET PONG GAME STATS ------------------------------------------------------------------------------------------

def reset_stats(request):
	if request.method == 'POST':
		try:
			request.user.pong_game_wins = [0, 0, 0, 0]
			request.user.pong_game_losses = [0, 0, 0, 0]
			request.user.pong_tournament_wins = [0, 0]
			request.user.pong_tournament_losses = [0, 0]
			request.user.pong_n_tournaments_won = 0
			request.user.save()
			matches = PongGame.objects.filter(player1=request.user) | PongGame.objects.filter(player2=request.user)
			for  match in matches:
				if (match.game_type == 'remote'):
					if (match.player1 == request.user):
						match.player1 = None
					elif (match.player2 == request.user):
						match.player2 = None
					match.save()
					if (match.player1 == None and match.player2 == None):
						match.delete()
				else:
					match.delete()
			return JsonResponse({'message': 'Stats reset successfully'}, status=200)
		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)

# GET ALL USERS IN THE DATABASE (FOR TESTING PURPOSES) -----------------------------------------------------------

# def users(request):
# 	if request.method == 'GET':
# 		users = User.objects.all().values('id', 
# 									'username', 
# 									'email', 
# 									'password',
# 									'check2FA', 
# 									'skey_2FA',
# 									'verification_code',
# 									'default_language',
# 									'joined',
# 									'profile_pic', 
# 									'motto',
# 									'comments_policy', 
# 									'allow_game_invitations',
# 									'blocked_users',
# 									'pong_game_wins',
# 									'pong_game_losses',
# 									'pong_tournament_wins',
# 									'pong_tournament_losses',
# 									'pong_n_tournaments_won',)
# 		user_list = list(users)
# 		return JsonResponse(user_list, safe=False)

# def friendships(request):
# 	if request.method == 'GET':
# 		friendships = Friendship.objects.all().values('user1', 'user2', 'created_at')
# 		friend_list = list(friendships)
# 		return JsonResponse(friend_list, safe=False)
	
# def messages(request):
# 	if request.method == 'GET':
# 		messages = Message.objects.all().values('room_name', 'sender', 'receiver', 'message', 'sent_at')
# 		message_list = list(messages)
# 		return JsonResponse(message_list, safe=False)

# def delete(request):
# 	if request.method == 'GET':
# 		User.objects.all().delete()
# 		# Friendship.objects.all().delete()
# 		# Invitation.objects.all().delete()
# 		# Message.objects.all().delete()
# 		# PongGame.objects.all().delete()
# 		return JsonResponse({'message': 'All users deleted'}, status=204)

# def pong_matches(request):
# 	if request.method == 'GET':
# 		matches = PongGame.objects.all().values('game_type', 'room_name', 'player1', 'player2', 'player1_score', 'player2_score', 'created_at')
# 		match_list = list(matches)
# 		return JsonResponse(match_list, safe=False)

# def comments(request):
# 	if request.method == 'GET':
# 		comments = Comment.objects.all().values('author', 'recipient', 'message', 'created_at')
# 		comment_list = list(comments)
# 		return JsonResponse(comment_list, safe=False)
