from django.shortcuts import render

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from .models import User
import json
import jwt
import datetime

def index(request):
	return render(request, 'myapp/index.html')

# GET ALL USERS IN THE DATABASE (FOR TESTING PURPOSES) -----------------------------------------------------------

@csrf_exempt
def users(request):
	if request.method == 'GET':
		users = User.objects.all().values('id', 'username', 'password')
		user_list = list(users)
		return JsonResponse(user_list, safe=False)
	
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
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			username_input = data['username']
			password_input = data['password']

			if not User.objects.filter(username=username_input).exists():
				return JsonResponse({'error': 'Username doesn\'t exist. Please register.'}, status=400)
			
			user = User.objects.get(username=username_input)
			if user.password != password_input:
				return JsonResponse({'error': 'Incorrect password. Please try again.'}, status=400)
			
			return JsonResponse({'username': user.username, 'password': user.password}, status=200)

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

			user = User.objects.create(username=data['username'], password=data['password'])
			return JsonResponse({'id': user.id, 'username': user.username, 'password': user.password}, status=201)
		
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
