from django.shortcuts import render

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from .models import User
import json

def index(request):
    return render(request, 'myapp/index.html')  # Render the HTML file

# Get all items (GET) and create a new item (POST)
# @csrf_exempt  # Disable CSRF for API purposes
# def item_list(request):
#     if request.method == 'GET':
#         items = Item.objects.all().values('id', 'name', 'description')  # Query the items
#         items_list = list(items)  # Convert QuerySet to list of dicts
#         return JsonResponse(items_list, safe=False)  # Return JSON response

#     elif request.method == 'POST':
#         try:
#             data = json.loads(request.body)  # Load the incoming JSON request
#             item = Item.objects.create(name=data['name'], description=data['description'])
#             return JsonResponse({'id': item.id, 'name': item.name, 'description': item.description}, status=201)
#         except KeyError:
#             return JsonResponse({'error': 'Invalid data'}, status=400)

# # Get, update, or delete a single item
# @csrf_exempt
# def item_detail(request, item_id):
#     item = get_object_or_404(Item, id=item_id)

#     if request.method == 'GET':
#         return JsonResponse({'id': item.id, 'name': item.name, 'description': item.description})

#     elif request.method == 'PUT':
#         try:
#             data = json.loads(request.body)
#             item.name = data.get('name', item.name)
#             item.description = data.get('description', item.description)
#             item.save()
#             return JsonResponse({'id': item.id, 'name': item.name, 'description': item.description})
#         except KeyError:
#             return JsonResponse({'error': 'Invalid data'}, status=400)

#     elif request.method == 'DELETE':
#         item.delete()
#         return JsonResponse({'message': 'Item deleted'}, status=204)

# Get all items (GET) and create a new item (POST)
@csrf_exempt  # Disable CSRF for API purposes
def user_list(request):
    if request.method == 'GET':
        users = User.objects.all().values('id', 'username', 'password')  # Query the items
        user_list = list(users)  # Convert QuerySet to list of dicts
        return JsonResponse(user_list, safe=False)  # Return JSON response

    elif request.method == 'POST':
        try:
            data = json.loads(request.body)  # Load the incoming JSON request
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
