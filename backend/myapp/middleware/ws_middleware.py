from channels.middleware import BaseMiddleware
import jwt
from django.conf import settings
from myapp.models import User
from asgiref.sync import sync_to_async

class WebSocketMiddleware(BaseMiddleware):
	async def __call__(self, scope, receive, send):

		jwt_token = None
		headers = dict(scope["headers"])
		
		if b"cookie" in headers:
			cookies = headers[b"cookie"].decode().split("; ")
			for cookie in cookies:
				key, value = cookie.split("=")
				if key == "jwt_transcendence":
					jwt_token = value

		if jwt_token:
			try:
				payload = jwt.decode(jwt_token, settings.SECRET_KEY, algorithms=["HS256"])
				user = await sync_to_async(User.objects.get)(id=payload["user_id"])
				scope["user"] = user
			except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist):
				scope["user"] = None
		else:
			scope["user"] = None

		return await super().__call__(scope, receive, send)
