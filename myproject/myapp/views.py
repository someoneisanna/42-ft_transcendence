from django.shortcuts import render, redirect
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

# GO TO HTML PAGES ------------------------------------------------------------------------------------------------

def index(request):
	return render(request, 'index.html')

def landing_page(request):
	return render(request, 'landing_page.html')

def layout(request):
	referer = request.META.get('HTTP_REFERER')
	if referer is None:
		return redirect('/')
	return render(request, 'layout.html')

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

# LOGIN USERS -----------------------------------------------------------------------------------------------------

@csrf_exempt
def login(request):
	return JsonResponse({'username': "a", 'checkbox': 0}, status=200); # REMOVE THIS LINE TO ENABLE LOGIN FUNCTIONALITY
	referer = request.META.get('HTTP_REFERER')
	if referer is None:
		return redirect('/')
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
			response.set_cookie('jwt', token, httponly=True, max_age=None, expires=None)
			return response

		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)

# REGISTER USERS --------------------------------------------------------------------------------------------------

@csrf_exempt
def register(request):
	referer = request.META.get('HTTP_REFERER')
	if referer is None:
		return redirect('/')
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
			response.set_cookie('jwt', token, httponly=True, max_age=None, expires=None)
			return response

		except KeyError:
			return JsonResponse({'error': 'Invalid data'}, status=400)

# GET ALL USERS IN THE DATABASE (FOR TESTING PURPOSES) -----------------------------------------------------------

@csrf_exempt
def users(request):
	if request.method == 'GET':
		users = User.objects.all().values('id', 'username', 'password', 'check2FA', 'skey_2FA')
		user_list = list(users)
		return JsonResponse(user_list, safe=False)

@csrf_exempt
def delete(request):
	if request.method == 'GET':
		User.objects.all().delete()
		return JsonResponse({'message': 'All users deleted'}, status=204)

