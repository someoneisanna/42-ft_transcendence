import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import time
import redis

class PongConsumer(AsyncWebsocketConsumer):

	matchmaking_user_count = 0
	redis_client = None

	async def connect(self):
		user = self.scope.get('user')
		await self.accept()
		if self.redis_client is None:
			self.redis_client = await self.get_redis_connection()

	async def disconnect(self, close_code):
		if hasattr(self, 'matchmaking_room'):
			await self.update_user_count(-1)
			await self.channel_layer.group_discard(self.matchmaking_room, self.channel_name)
		if hasattr(self, 'pong_game_room'):
			user = self.scope.get('user')
			await self.channel_layer.group_send(
					self.pong_game_room,
					{
						'type': 'send_game_notification',
						'action': 'End game - User left',
						'room_name': self.pong_game_room,
						'player1': user.username
					}
				)
			await self.channel_layer.group_discard(self.pong_game_room, self.channel_name)

	async def receive(self, text_data):
		data = json.loads(text_data)
		type = data['type']

		if type == 'join_matchmaking_room':
			
			if self.__class__.matchmaking_user_count < 2:
				self.matchmaking_room = 'pong_matchmaking_room'
				await self.channel_layer.group_add(self.matchmaking_room, self.channel_name)
				await self.update_user_count(+1)
				await self.send(text_data=json.dumps(
				{
					'type': 'receive_notification',
					'action': 'Joined matchmaking room',
					'user_count':self.__class__.matchmaking_user_count
				}
			))

		elif type == 'join_pong_room':
			self.pong_game_room = data['room_name']
			username = data['username']
			player_count = await self.redis_client.rpush(self.pong_game_room, username)
			if player_count > 2:
				await self.redis_client.lrem(self.pong_game_room, 0, username)
				return
			await self.channel_layer.group_add(self.pong_game_room, self.channel_name)

		elif type == 'start_game':
			player1, player2 = None, None
			while not player1 or not player2:
				player1 = await self.redis_client.lindex(self.pong_game_room, 0)
				player2 = await self.redis_client.lindex(self.pong_game_room, 1)
			await self.channel_layer.group_send(
				self.pong_game_room,
				{
					'type': 'send_game_notification',
					'action': 'User is ready',
					'room_name': self.pong_game_room,
					'username': data['username'],
					'player1': player1,
					'player2': player2
				}
			)

		elif type == 'leave_matchmaking_room':
			await self.send(text_data=json.dumps(
				{
					'type': 'receive_notification',
					'action': 'Left matchmaking room',
					'user_count':self.__class__.matchmaking_user_count - 1
				}
			))
			await self.channel_layer.group_discard(self.matchmaking_room, self.channel_name)
			await self.update_user_count(-1)
			del self.matchmaking_room

		elif type == 'leave_pong_room':
			# send message saying user left the room
			await self.channel_layer.group_send(
					self.pong_game_room,
					{
						'type': 'send_game_notification',
						'action': 'End game - User left',
						'room_name': self.pong_game_room,
						'player1': data['username']
					}
				)
			await self.channel_layer.group_discard(self.pong_game_room, self.channel_name)
			del self.pong_game_room

	async def update_user_count(self, diff):
		self.__class__.matchmaking_user_count += diff
		curr_count = self.__class__.matchmaking_user_count
		if curr_count == 2:
			room_name = str(int(time.time() * 1000))
			await self.channel_layer.group_send(
				self.matchmaking_room,
				{
					'type': 'send_game_notification',
					'action': 'Create a new game',
					'room_name': room_name
				}
			)
		return curr_count

	async def send_game_notification(self, event):
		await self.send(text_data=json.dumps(
			{
				'type': 'receive_notification',
				'action': event['action'],
				'room_name': event['room_name'],
				'username': event.get('username', ''),
				'player1': event.get('player1', ''),
				'player2': event.get('player2', '')
			}
		))

	async def get_redis_connection(self):
		return redis.asyncio.StrictRedis(host='redis', port=6379, db=0, decode_responses=True)
