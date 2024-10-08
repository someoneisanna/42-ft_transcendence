from django.shortcuts import render

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from .models import User
import json

def index(request):
    return render(request, 'myapp/index.html')  # Render the HTML file

# Get all items (GET) and create a new item (POST)
@csrf_exempt  # Disable CSRF for API purposes
def user_list(request):
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)  # Load the incoming JSON request
            username_input = data['username']
            password_input = data['password']

            if User.objects.filter(username=username_input).exists() == False:
                return JsonResponse({'error': 'Username doesn\'t exist. Please register.'}, status=400)
            
            user = User.objects.get(username=username_input)
            if user.password != password_input:
                return JsonResponse({'error': 'Incorrect password. Please try again.'}, status=400)
            
            return JsonResponse({'username': user.username, 'password': user.password}, status=200)

        except KeyError:
            return JsonResponse({'error': 'Invalid data'}, status=400)

        # users = User.objects.all().values('id', 'username', 'password')  # Query the items
        # user_list = list(users)  # Convert QuerySet to list of dicts
        # return JsonResponse(user_list, safe=False)  # Return JSON response

    elif request.method == 'POST':
        try:
            data = json.loads(request.body)  # Load the incoming JSON request
            username_input = data['username']
            password_input = data['password']

            if User.objects.filter(username=username_input).exists():
                return JsonResponse({'error': 'Username already exists. Please login.'}, status=400)

            user = User.objects.create(username=data['username'], password=data['password'])
            return JsonResponse({'id': user.id, 'username': user.username, 'password': user.password}, status=201)
        
        except KeyError:
            return JsonResponse({'error': 'Invalid data'}, status=400)

# Get, update, or delete a single item
@csrf_exempt
def user_detail(request, username):
    user = get_object_or_404(User, username=username)

    if request.method == 'GET':
        return JsonResponse({'id': user.id, 'username': user.username, 'password': user.password})

    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            user.username = data.get('username', user.username)
            user.password = data.get('password', user.password)
            user.save()
            return JsonResponse({'id': user.id, 'username': user.username, 'password': user.password})
        except KeyError:
            return JsonResponse({'error': 'Invalid data'}, status=400)

    elif request.method == 'DELETE':
        user.delete()
        return JsonResponse({'message': 'Item deleted'}, status=204)
