from django.urls import re_path
from myapp.consumers.chat_consumers import ChatConsumer
from myapp.consumers.pong_consumers import PongConsumer

websocket_urlpatterns = [
	re_path(r'ws/chat/$', ChatConsumer.as_asgi()),
	re_path(r'ws/pong/$', PongConsumer.as_asgi()),
]
