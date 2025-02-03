import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import time
import redis

class PongConsumer(AsyncWebsocketConsumer):

	matchmaking_user_count = 0
	tournament_matchmaking_user_count = 0
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
		if hasattr(self, 'tournament_matchmaking_room'):
			await self.update_tournament_matchmaking_user_count(-1)
			await self.channel_layer.group_discard(self.tournament_matchmaking_room, self.channel_name)
		if hasattr(self, 'pong_game_room'):
			user = self.scope.get('user')
			await self.channel_layer.group_send(
					self.pong_game_room,
					{
						'type': 'send_game_notification',
						'action': 'User left',
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
				'user_count': self.__class__.matchmaking_user_count
			}
			))

		elif type == 'join_tournament_matchmaking_room':
			if self.__class__.tournament_matchmaking_user_count < 4:
				self.tournament_matchmaking_room = 'tournament_matchmaking_room'
				await self.channel_layer.group_add(self.tournament_matchmaking_room, self.channel_name)
				await self.update_tournament_matchmaking_user_count(+1)
			await self.send(text_data=json.dumps(
			{
				'type': 'receive_notification',
				'action': 'Joined tournament matchmaking room',
				'user_count': self.__class__.tournament_matchmaking_user_count
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

		elif type == 'join_tournament_pong_room':
			self.pong_game_room = data['room_name']
			username = data['username']
			tournament_player_count = await self.redis_client.rpush(self.pong_game_room, username)
			await self.channel_layer.group_add(self.pong_game_room, self.channel_name)
			# DEBUGGING PRINT
			await self.send(text_data=json.dumps(
			{
				'type': 'receive_notification',
				'action': 'Joined tournament pong room',
				'tournament_player_count': tournament_player_count
			}
			))
			if tournament_player_count > 4:
				await self.redis_client.lrem(self.tournament_game_room, 0, username)
				return

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

		elif type == 'start_tournament_game':
			player1, player2, player3, player4 = None, None, None, None
			while not player1 or not player2 or not player3 or not player4:
				player1 = await self.redis_client.lindex(self.pong_game_room, 0)
				player2 = await self.redis_client.lindex(self.pong_game_room, 1)
				player3 = await self.redis_client.lindex(self.pong_game_room, 2)
				player4 = await self.redis_client.lindex(self.pong_game_room, 3)
			await self.channel_layer.group_send(
				self.pong_game_room,
				{
					'type': 'send_game_notification',
					'action': 'User is ready for tournament',
					'room_name': self.pong_game_room,
					'username': data['username'],
					'player1': player1,
					'player2': player2,
					'player3': player3,
					'player4': player4
				}
			)

		elif type == 'send_pad_state':
			await self.channel_layer.group_send(
				self.pong_game_room,
				{
					'type': 'send_game_update',
					'action': 'Update pad state',
					'pad_name': data['pad_name'],
					'pad_side': data['pad_side'],
					'pos_x': data['pos_x'],
					'pos_y': data['pos_y'],
					'request_up': data['request_up'],
					'request_down': data['request_down'],
				}
			)

		elif type == 'send_ball_state':
			await self.channel_layer.group_send(
				self.pong_game_room,
				{
					'type': 'send_game_update',
					'action': 'Update ball state',
					'pad_name': data['pad_name'],
					'pos_x': data['pos_x'],
					'pos_y': data['pos_y'],
					'move_dir_x': data['move_dir_x'],
					'move_dir_y': data['move_dir_y'],
					'move_speed': data['move_speed']
				}
			)
		
		elif type == 'send_mod_spawn':
			await self.channel_layer.group_send(
				self.pong_game_room,
				{
					'type': 'send_game_update',
					'action': 'Modifier spawn',
					'pos_x': data['pos_x'],
					'pos_y': data['pos_y'],
					'radius': data['radius'],
					'mod_type': data['mod_type'],
					'strength': data['strength'],
					'color': data['color'],
					'duration': data['duration']
				}
			)

		elif type == 'notify_score':
			await self.channel_layer.group_send(
				self.pong_game_room,
				{
					'type': 'send_game_update',
					'action': 'Score notification',
					'scorer': data['scorer']
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

		elif type == 'leave_tournament_matchmaking_room':
			await self.send(text_data=json.dumps(
				{
					'type': 'receive_notification',
					'action': 'Left tournament room',
					'user_count':self.__class__.tournament_matchmaking_user_count - 1
				}
			))
			await self.channel_layer.group_discard(self.tournament_matchmaking_room, self.channel_name)
			await self.update_tournament_matchmaking_user_count(-1)
			del self.tournament_matchmaking_room

		elif type == 'leave_pong_room':
			# send message saying user left the room
			await self.channel_layer.group_send(
					self.pong_game_room,
					{
						'type': 'send_game_notification',
						'action': 'User left',
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

	async def update_tournament_matchmaking_user_count(self, diff):
		self.__class__.tournament_matchmaking_user_count += diff
		curr_count = self.__class__.tournament_matchmaking_user_count
		if curr_count == 4:
			room_name = str(int(time.time() * 1000)) + '_tournament'
			await self.channel_layer.group_send(
				self.tournament_matchmaking_room,
				{
					'type': 'send_game_notification',
					'action': 'Create a new tournament game',
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
				'player2': event.get('player2', ''),
				'player3': event.get('player3', ''),
				'player4': event.get('player4', '')
			}
		))

	async def send_game_update(self, event):
		if event['action'] == 'Update pad state':
			await self.send(text_data=json.dumps(
				{
					'type': 'receive_pad_state',
					'pad_name': event['pad_name'],
					'pad_side': event['pad_side'],
					'pos_x': event['pos_x'],
					'pos_y': event['pos_y'],
					'request_up': event['request_up'],
					'request_down': event['request_down'],
				}
			))
		elif event['action'] == 'Update ball state':
			await self.send(text_data=json.dumps(
				{
					'type': 'receive_ball_state',
					'pad_name': event['pad_name'],
					'pos_x': event['pos_x'],
					'pos_y': event['pos_y'],
					'move_dir_x': event['move_dir_x'],
					'move_dir_y': event['move_dir_y'],
					'move_speed': event['move_speed']
				}
			))
		elif event['action'] == 'Score notification':
			await self.send(text_data=json.dumps(
				{
					'type': 'receive_score_notification',
					'scorer': event['scorer']
				}
			))
		elif event['action'] == 'Modifier spawn':
			await self.send(text_data=json.dumps(
				{
					'type': 'receive_mod_spawn',
					'pos_x': event['pos_x'],
					'pos_y': event['pos_y'],
					'radius': event['radius'],
					'mod_type': event['mod_type'],
					'strength': event['strength'],
					'color': event['color'],
					'duration': event['duration']
				}
			))

	async def get_redis_connection(self):
		return redis.asyncio.StrictRedis(host='redis', port=6379, db=0, decode_responses=True)
