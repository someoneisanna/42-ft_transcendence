import json
from channels.generic.websocket import AsyncWebsocketConsumer

class PongConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		user = self.scope.get('user')
		await self.accept()
		await self.send(text_data=json.dumps({
				"type": "pong: new user connected",
				"username": user.username,
			}))

	async def disconnect(self, close_code):
		if hasattr(self, 'room_group_name'):
			await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
	
	async def receive(self, text_data):
		data = json.loads(text_data)
		type = data['type']
		username = data['username']

		if type == 'matchmaking':
			self.room_group_name = 'matchmaking_room'
			await self.channel_layer.group_add(self.room_group_name, self.channel_name)
			await self.channel_layer.group_send(
				'matchmaking_room',
				{
					'type': 'send_message',
					'username': username
				}
			)

	async def send_message(self, event):
		await self.send(text_data=json.dumps({
			'type': 'user_joined',
			'username': event['username'],
			'room_name': self.room_group_name
		}
		))
