import jwt
from django.http import JsonResponse
from django.conf import settings

import logging

class JWTMiddleware:
	def __init__(self, get_response):
		self.get_response = get_response

	def __call__(self, request):
		
		# Paths that do not require a token
		untokenized_paths = ['favicon.ico', '/landing/', '/login/', '/register/', '/', '/delete/']
		if request.path in untokenized_paths:
			return self.get_response(request)
		
		# Check if token exists in cookies
		token = request.COOKIES.get('jwt')
		if token:
			try:
				payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
				request.user_id = payload['user_id']
			except jwt.ExpiredSignatureError:
				return JsonResponse({'error': 'Token has expired. Please log in again.'}, status=401)
			except jwt.InvalidTokenError:
				return JsonResponse({'error': 'Invalid token. Please log in again.'}, status=401)
		
		# If token does not exist in cookies, return error
		if not hasattr(request, 'user_id'):
			return JsonResponse({'error': 'Please log in.'}, status=401)
		return self.get_response(request)
