from django.shortcuts import render

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from .models import User
import json
import jwt
import datetime
import pyotp
import qrcode
from qrcode.image.pil import PilImage
from io import BytesIO
import base64

def index(request):
	return render(request, 'myapp/index.html')

# 2FA: GENERATE A SECRET KEY AND QR CODE FOR A USER ---------------------------------------------------------------

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

# CREATE A JWT TOKEN FOR A USER -----------------------------------------------------------------------------------

def create_jwt_token(user):
	payload = {
		'user_id': user.id,
		'exp': datetime.datetime.now() + datetime.timedelta(hours=5)
	}
	token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
	return token

# GET ALL USERS IN THE DATABASE (FOR TESTING PURPOSES) -----------------------------------------------------------

@csrf_exempt
def users(request):
	if request.method == 'GET':
		users = User.objects.all().values('id', 'username', 'password', 'skey_2FA')
		user_list = list(users)
		return JsonResponse(user_list, safe=False)
	elif request.method == 'DELETE':
		User.objects.all().delete()
		return JsonResponse({'message': 'All users deleted'}, status=204)

# LOGIN USERS -----------------------------------------------------------------------------------------------------

@csrf_exempt
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
			
			totp = pyotp.TOTP(user.skey_2FA)
			if not totp.verify(totp_2FA_input):
				return JsonResponse({'error': 'Invalid 2FA code. Please try again.'}, status=400)

			token = create_jwt_token(user)
			response = JsonResponse({'username': user.username, 'token': token}, status=200)
			response.set_cookie('jwt', token, httponly=True, max_age=None, expires=None)
			return response

		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)

# REGISTER USERS --------------------------------------------------------------------------------------------------

@csrf_exempt
def register(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			username_input = data['username']
			password_input = data['password']

			if User.objects.filter(username=username_input).exists():
				return JsonResponse({'error': 'Username already exists. Please login.'}, status=400)

			secret_key = generate_2fa_secret_key(user=username_input)
			qr_code = generate_2fa_qr_code(secret=secret_key, username=username_input)
			qr_code64 = base64.b64encode(qr_code).decode('utf-8')
			
			user = User.objects.create(username=username_input, password=password_input, skey_2FA=secret_key)

			return JsonResponse({'username': user.username, 'qr_code': qr_code64}, status=200)

		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)








# from django.shortcuts import get_object_or_404
# Get, update, or delete a single item
# @csrf_exempt
# def user_detail(request, username):
# 	user = get_object_or_404(User, username=username)
# 
# 	if request.method == 'GET':
# 		return JsonResponse({'id': user.id, 'username': user.username, 'password': user.password})
# 
# 	elif request.method == 'PUT':
# 		try:
# 			data = json.loads(request.body)
# 			user.username = data.get('username', user.username)
# 			user.password = data.get('password', user.password)
# 			user.save()
# 			return JsonResponse({'id': user.id, 'username': user.username, 'password': user.password})
# 		except KeyError:
# 			return JsonResponse({'error': 'Invalid data'}, status=400)
# 
# 	elif request.method == 'DELETE':
# 		user.delete()
# 		return JsonResponse({'message': 'Item deleted'}, status=204)
