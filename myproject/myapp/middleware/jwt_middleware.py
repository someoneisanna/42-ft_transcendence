import jwt
from django.http import JsonResponse, HttpResponseRedirect
from django.conf import settings
from myapp.models import User
from django.shortcuts import redirect

import logging

class JWTMiddleware:
	def __init__(self, get_response):
		self.get_response = get_response

	def __call__(self, request):
		# Paths that do not require a jwt token
		untokenized_paths = ['favicon.ico', '/', '/api/login/', '/api/register/', '/users/' ,'/delete/']
		if request.path in untokenized_paths:
			return self.get_response(request)
		
		# For all other paths, check if the jwt token is valid
		token = request.COOKIES.get('jwt_transcendence')
		if token:
			try:
				payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
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
