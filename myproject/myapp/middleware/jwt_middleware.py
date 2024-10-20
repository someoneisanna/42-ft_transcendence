import jwt
from django.http import JsonResponse, HttpResponseRedirect
from django.conf import settings
from myapp.models import User

import logging

class JWTMiddleware:
	def __init__(self, get_response):
		self.get_response = get_response

	def __call__(self, request):
		
		# Paths that do not require a jwt token
		untokenized_paths = ['favicon.ico', '/', '/login/', '/register/', '/users/' ,'/delete/']
		if request.path in untokenized_paths:
			return self.get_response(request)
		
		# For all other paths, check if the jwt token is valid
		token = request.COOKIES.get('jwt_transcendence')
		if token:
			try:
				payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
				request.user = User.objects.get(id=payload['user_id'])
			except jwt.ExpiredSignatureError:
				return JsonResponse({'error': 'Token has expired. Please log in again.'}, status=401)
			except jwt.InvalidTokenError:
				return JsonResponse({'error': 'Invalid token. Please log in again.'}, status=401)
			except User.DoesNotExist:
				return JsonResponse({'error': 'User does not exist. Please log in again.'}, status=401)
		else:
			request.user = None

		# If the request does not have a user_id attribute, redirect to the landing page
		if request.user is None and not request.path.startswith('/landing/'):
			return HttpResponseRedirect('/landing/')
		
		return self.get_response(request)
