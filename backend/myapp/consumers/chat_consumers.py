import json
from channels.generic.websocket import AsyncWebsocketConsumer
from myapp.models import User, Message, Friendship
from asgiref.sync import sync_to_async
import redis
import time

redis_client = redis.asyncio.StrictRedis(host='redis', port=6379, db=0, decode_responses=True)

class ChatConsumer(AsyncWebsocketConsumer):

	session = 0

	# Triggered when a new websocket connection is established. 
	async def connect(self):
		
		# Get the user from the scope of the websocket connection (ws_middleware.py)
		self.user = self.scope.get('user')
		
		if self.user is not None:
			# Accept the websocket connection
			await self.accept()

			# Create a group for the user's own chat room (this way other users can send notifications to the user)
			self.user_group_name = f"wsUser_{self.user.username}"
			await self.channel_layer.group_add(self.user_group_name, self.channel_name)

			# Check if the user is already online and send a message if they are - this is needed so that only one session is active at a time
			is_online = await redis_client.sismember("online_users", self.user.username)
			await redis_client.sadd("online_users", self.user.username)
			await self.send(text_data=json.dumps({
				"type": "check_if_user_is_logged_in",
				"username": self.user.username,
				"logged_in": is_online
			}))
			if is_online:
				self.__class__.session += 1
			else:
				# Notify friends that the user is online
				self.friends_list = await self.get_friends()
				for friend in self.friends_list:
					await self.channel_layer.group_send(
						f"wsUser_{friend['username']}",
						{
							'type': 'send_notification',
							'from': self.user.username,
							'notification': 'user_is_online',
						}
					)
				# Initialize the online users list
				self.online_users_list = []
				online_users = await redis_client.smembers("online_users")
				self.online_users_list = list(online_users)
		
		else:
			await self.close()

	# Triggered when a websocket connection is closed. Here we remove the user from any chat room they joined.
	async def disconnect(self, close_code):
		
		if self.__class__.session > 0:
			self.__class__.session -= 1
			return
		
		# Remove the user from the online users list
		await redis_client.srem("online_users", self.user.username)

		# Notify friends that the user is offline
		self.friends_list = await self.get_friends()
		for friend in self.friends_list:
			await self.channel_layer.group_send(
				f"wsUser_{friend['username']}",
				{
					'type': 'send_notification',
					'from': self.user.username,
					'notification': 'user_is_offline',
				}
			)
		
		# Remove the user from any chat room they joined
		if hasattr(self, 'room_group_name'):
			await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
		
		# Remove the user from their own message group
		if hasattr(self, 'user_group_name'):
			await self.channel_layer.group_discard(self.user_group_name, self.channel_name)

	# Triggered when a message is received from the websocket connection. Here we broadcast the message to all users in the chat room.
	async def receive(self, text_data):
		data = json.loads(text_data)
		type = data['type']
		room_name = data['room_name']
		username = data['username']

		if type == 'join_room':
			self.room_group_name = room_name
			await self.channel_layer.group_add(self.room_group_name, self.channel_name)

		elif type == 'get_last_messages':
			last_message = await self.get_last_message(room_name)
			if last_message is not None:
				await self.send(text_data=json.dumps({
					'type': 'chat_message',
					'room_name': last_message['room_name'],
					'sender': last_message['sender'],
					'receiver': last_message['receiver'],
					'message': last_message['message'],
					'sent_at': last_message['sent_at']
				})
				)
			else:
				await self.send(text_data=json.dumps({
					'room_name': room_name,
					'message': ''
				})
			)

		elif type == 'get_online_status':
			target_user = data['username']
			online_users = await redis_client.smembers("online_users")
			self.online_users_list = list(online_users)
			if target_user in self.online_users_list:
				await self.send(text_data=json.dumps({
					'type': 'online_status',
					'username': target_user,
					'online': True
				}))

		elif type == 'get_stored_messages':
			messages = await self.get_messages(room_name)
			for message in messages:
				await self.send(text_data=json.dumps({
					'type': 'add_stored_message',
					'room_name': message['room_name'],
					'username': message['sender'],
					'friend': message['receiver'],
					'message': message['message'],
					'sent_at': message['sent_at']
				}))

		elif type == 'chat_message':
			friend = data['friend']
			message = data['message']
			sent_at = data['sent_at']
			await self.store_message(room_name, username, friend, message)
			await self.channel_layer.group_send(
				room_name,
				{
					'type': 'send_message',
					'room_name': room_name,
					'username': username,
					'friend': friend,
					'message': message,
					'sent_at': sent_at
				}
			)

		elif type == 'invite_to_match':
			friend = data['friend']
			action = data['action']
			status = 'offline'
			online_users = await redis_client.smembers("online_users")
			self.online_users_list = list(online_users)
			if friend in self.online_users_list:
				status = 'online'
			await self.channel_layer.group_send(
				room_name,
				{
					'type': 'send_invitation',
					'action': action,
					'room_name': room_name,
					'from': username,
					'to': friend,
					'status': status
				}
			)

		elif type == 'invite_to_match_answer':
			username = data['username']
			friend = data['friend']
			answer = data['answer']
			await self.channel_layer.group_send(
				f"wsUser_{friend}",
				{
					'type': 'invite_to_match_answer',
					'from': username,
					'answer': answer
				}
			)

		elif type == 'start_pong_match':
			friend = data['friend']
			role = data['role']
			pong_room_name = str(int(time.time() * 1000))
			await self.channel_layer.group_send(
				room_name,
				{
					'type': 'start_pong_match',
					'room_name': pong_room_name,
					'from': username,
					'to': friend,
					'role': role
				}
			)

		elif type == 'cancel_start_pong_match':
			friend = data['friend']
			role = data['role']
			await self.channel_layer.group_send(
				f"wsUser_{friend}",
				{
					'type': 'cancel_start_pong_match',
					'from': username,
					'to': friend,
					'role': role
				}
			)

		elif type == 'account_deletion':
			if (data['step'] == 1):
				self.friends_list = await self.get_friends()
			elif (data['step'] == 2):
				for friend in self.friends_list:
					await self.channel_layer.group_send(
						f"wsUser_{friend['username']}",
						{
							'type': 'send_notification',
							'from': username,
							'notification': 'user_deleted_account',
						}
					)

		elif type == 'send_notification':
			target_user = data['room_name']
			notification = data['notification']
			new_relationship = data['new_relationship']
			await self.channel_layer.group_send(
				f"wsUser_{target_user}",
				{
					'type': 'send_notification',
					'from': username,
					'notification': notification,
					'new_relationship': new_relationship
				}
			)

	@sync_to_async
	def store_message(self, room_name, sender, receiver, message):
		if Message.objects.filter(room_name=room_name).count() >= 100:
			oldest_message = Message.objects.filter(room_name=room_name).order_by('sent_at').first()
			if oldest_message:
				oldest_message.delete()
		senderUser = User.objects.get(username=sender)
		receiverUser = User.objects.get(username=receiver)
		Message.objects.create(room_name=room_name, sender=senderUser, receiver=receiverUser, message=message)

	@sync_to_async
	def get_messages(self, room_name):
		messages = Message.objects.filter(room_name=room_name).order_by('-sent_at')[:100]
		messages = reversed(messages)
		messages_list = []
		for message in messages:
			message_content = {
				'room_name': message.room_name,
				'sender': message.sender.username,
				'receiver': message.receiver.username,
				'message': message.message,
				'sent_at': message.sent_at.isoformat()
			}
			messages_list.append(message_content)
		return messages_list
	
	@sync_to_async
	def get_last_message(self, room_name):
		last_message = Message.objects.filter(room_name=room_name).order_by('-sent_at').first()
		last_message_content = None
		if last_message:
			last_message_content = {
				'room_name': last_message.room_name,
				'sender': last_message.sender.username,
				'receiver': last_message.receiver.username,
				'message': last_message.message,
				'sent_at': last_message.sent_at.isoformat()
			}
		return last_message_content
	
	@sync_to_async
	def get_friends(self):
		friends = []
		friendships = Friendship.objects.filter(user1=self.user) | Friendship.objects.filter(user2=self.user)
		for friendship in friendships:
			if friendship.user1 == self.user:
				friends.append({'username': friendship.user2.username})
			else:
				friends.append({'username': friendship.user1.username})
		return friends

	# Triggered when the group_send message of type chat_message is received. Here we send the message to the websocket connection.
	async def send_message(self, event):
		await self.send(text_data=json.dumps({
			'type': 'chat_message',
			'room_name': event['room_name'],
			'username': event['username'],
			'friend': event['friend'],
			'message': event['message'],
			'sent_at': event['sent_at']
		}
		))

	async def send_invitation(self, event):
		await self.send(text_data=json.dumps({
			'type': 'match_invitation',
			'action': event['action'],
			'room_name': event['room_name'],
			'from': event['from'],
			'to': event['to'],
			'status': event['status']
		}
		))

	async def invite_to_match_answer(self, event):
		await self.send(text_data=json.dumps({
			'type': 'invite_to_match_answer',
			'from': event['from'],
			'answer': event['answer']
		}
		))

	async def send_notification(self, event):
		await self.send(text_data=json.dumps({
			'type': 'receive_notification',
			'from': event['from'],
			'notification': event['notification'],
			'new_relationship': event.get('new_relationship', None)
		}
		))

	async def start_pong_match(self, event):
		await self.send(text_data=json.dumps({
			'type': 'start_pong_match',
			'room_name': event['room_name'],
			'from': event['from'],
			'to': event['to'],
			'role': event['role']
		}
		))

	async def cancel_start_pong_match(self, event):
		await self.send(text_data=json.dumps({
			'type': 'cancel_start_pong_match',
			'from': event['from'],
			'to': event['to'],
			'role': event['role']
		}
		))

# Timeline Summary

# 1. The connect method is called when a new websocket connection is established (when a user opens the website).
# 2. UserA clicks on the button to open the chat with UserB. 
# 3. When UserA clicks on the send button, 'chatSocket.send' is called, which triggers the receive method.
# 4. The receive method is called, parsing the message and sending it to all users in the chat room.
# 5. UserA's and UserB's chat_message method is called, which receives the message and sends it to the frontend.
# 6. The 'chatSocket.onmessage' is then triggered, puttting the messages in the chat box.
