import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import time

class PongConsumer(AsyncWebsocketConsumer):

	matchmaking_user_count = 0

	async def connect(self):
		user = self.scope.get('user')
		await self.accept()
		await self.send(text_data=json.dumps({
			"type": "pong: new user connected",
			"username": user.username,
		}))

	async def disconnect(self, close_code):
		if hasattr(self, 'room_group_name'):
			if self.room_group_name == 'matchmaking_room':
				await self.update_user_count(-1)
			await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

	async def receive(self, text_data):
		data = json.loads(text_data)
		type = data['type']

		if type == 'matchmaking':
			if self.__class__.matchmaking_user_count >= 2:
				await self.send(text_data=json.dumps({
					'type': 'matchmaking_error',
					'message': 'Matchmaking room is full',
					'count': self.__class__.matchmaking_user_count
				}))
			else:
				self.room_group_name = 'matchmaking_room'
				await self.channel_layer.group_add(self.room_group_name, self.channel_name)
				await self.update_user_count(+1)

		elif type == 'leave_matchmaking':
			await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
			await self.update_user_count(-1)

		elif type == 'join_pong_room':
			room_name = data['room_name']
			await self.channel_layer.group_add(room_name, self.channel_name)
			# await self.channel_layer.group_send(
			# 	room_name,
			# 	{
			# 		'type': 'send_notification',
			# 		'action': 'Testing message',
			# 		'room_name': room_name
			# 	}
		# )

	async def update_user_count(self, diff):
		self.__class__.matchmaking_user_count += diff
		curr_count = self.__class__.matchmaking_user_count
		if curr_count == 2:
			room_name = str(int(time.time() * 1000))
			await self.channel_layer.group_send(
				'matchmaking_room',
				{
					'type': 'send_notification',
					'action': 'Create a new game',
					'room_name': room_name
				}
			)
		return curr_count

	async def send_notification(self, event):
		await self.send(text_data=json.dumps({
			'type': 'receive_notification',
			'action': event['action'],
			'room_name': event['room_name']
		}
		))
