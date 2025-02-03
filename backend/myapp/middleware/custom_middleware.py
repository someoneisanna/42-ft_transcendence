import jwt
from django.http import JsonResponse, HttpResponseRedirect
from django.conf import settings
from myapp.models import User
from django.shortcuts import redirect

import logging

# class JWTMiddleware:
class customMiddleware:
	def __init__(self, get_response):
		self.get_response = get_response

	def __call__(self, request):
		# Check if the csrf token is present in the POST requests
		if request.method == "POST" or request.method == "PUT" or request.method == "DELETE":
			csrf_token = request.COOKIES.get("csrftoken")
			if not csrf_token:
				return JsonResponse({'error': 'CSRF token is missing. Please refresh the page and try again.'}, status=403)
	
		# Paths that do not require a jwt token
		untokenized_paths = ['favicon.ico', '/', '/api/login/', '/api/register/', '/api/send_email/', '/api/verify_password_code/',
			'/users/' ,'/delete/', '/friendships/', '/messages/', '/pong_matches/', '/comments/']
		if request.path in untokenized_paths:
			return self.get_response(request)
		
		# For all other paths, check if the jwt token is valid
		jwt_token = request.COOKIES.get('jwt_transcendence')
		if jwt_token:
			try:
				payload = jwt.decode(jwt_token, settings.SECRET_KEY, algorithms=['HS256'])
				request.user = User.objects.get(id=payload['user_id'])
			except jwt.ExpiredSignatureError:
				response = JsonResponse({'error': 'Token has expired. Please log in again.'}, status=401)
				response.delete_cookie('jwt_transcendence')
				return response
			except jwt.InvalidTokenError:
				response = JsonResponse({'error': 'Invalid token. Please log in again'}, status=401)
				response.delete_cookie('jwt_transcendence')
				return response
			except User.DoesNotExist:
				response = JsonResponse({'error': 'User does not exist. Please log in again.'}, status=401)
				response.delete_cookie('jwt_transcendence')
				return response
		else:
			request.user = None

		referer = request.META.get('HTTP_REFERER')
		if referer is None:
			return redirect('/')
		else:
			if request.user is None and not request.path.startswith('/landing/'):
				return JsonResponse({'error': 'User not authenticated. Please log in.'}, status=401)

		return self.get_response(request)
