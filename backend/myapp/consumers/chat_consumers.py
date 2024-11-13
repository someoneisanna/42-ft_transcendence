import json
from channels.generic.websocket import AsyncWebsocketConsumer
from myapp.models import Message, User
from asgiref.sync import sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):

	# Triggered when a new websocket connection is established. 
	async def connect(self):
		user = self.scope.get('user')
		if user is not None:
			await self.accept()
			await self.send(text_data=json.dumps({
				"type": "authenticated",
				"username": user.username,
			}))
			self.user_group_name = f"wsUser_{user.username}"
			await self.channel_layer.group_add(self.user_group_name, self.channel_name)
		else:
			await self.close()

	# Triggered when a websocket connection is closed. Here we remove the user from any chat room they joined.
	async def disconnect(self, close_code):
		if hasattr(self, 'room_group_name'):
			await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
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
					'room_name': last_message.room_name,
					'username': last_message.sender,
					'message': last_message.message,
					'sent_at': last_message.sent_at.isoformat()
				})
				)
			else:
				await self.send(text_data=json.dumps({
					'room_name': room_name,
					'message': ''
				})
			)

		elif type == 'get_stored_messages':
			messages = await self.get_messages(room_name)
			for message in messages:
				await self.send(text_data=json.dumps({
					'type': 'add_stored_message',
					'room_name': message.room_name,
					'username': message.sender,
					'message': message.message,
					'sent_at': message.sent_at.isoformat()
				}))

		elif type == 'chat_message':
			message = data['message']
			sent_at = data['sent_at']
			await self.store_message(room_name, username, message)
			await self.channel_layer.group_send(
				room_name,
				{
					'type': 'send_message',
					'room_name': room_name,
					'username': username,
					'message': message,
					'sent_at': sent_at
				}
			)

		elif type == 'update_html':
			action = data['action']
			await self.channel_layer.group_send(
				self.room_group_name,
			{
				'type': 'update_html',
				'room_name': room_name,
				'action': action
			})

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
	def store_message(self, room_name, username, message):
		if Message.objects.filter(room_name=room_name).count() >= 100:
			oldest_message = Message.objects.filter(room_name=room_name).order_by('sent_at').first()
			if oldest_message:
				oldest_message.delete()
		Message.objects.create(room_name=room_name, sender=username, message=message)

	@sync_to_async
	def get_messages(self, room_name):
		messages = Message.objects.filter(room_name=room_name).order_by('-sent_at')[:100]
		messages = reversed(messages)
		return list(messages)
	
	@sync_to_async
	def get_last_message(self, room_name):
		last_message = Message.objects.filter(room_name=room_name).order_by('-sent_at').first()
		return last_message

	# Triggered when the group_send message of type chat_message is received. Here we send the message to the websocket connection.
	async def send_message(self, event):
		await self.send(text_data=json.dumps({
			'type': 'chat_message',
			'room_name': event['room_name'],
			'username': event['username'],
			'message': event['message'],
			'sent_at': event['sent_at']
		}
		))

	async def update_html(self, event):
		await self.send(text_data=json.dumps({
			'type': 'update_html',
			'room_name': event['room_name'],
			'action': event['action']
		}
		))

	async def send_notification(self, event):
		await self.send(text_data=json.dumps({
			'type': 'receive_notification',
			'from': event['from'],
			'notification': event['notification'],
			'new_relationship': event['new_relationship']
		}
		))


# Timeline Summary

# 1. The connect method is called when a new websocket connection is established (when a user opens the website).
# 2. UserA clicks on the button to open the chat with UserB. 
# 3. When UserA clicks on the send button, 'chatSocket.send' is called, which triggers the receive method.
# 4. The receive method is called, parsing the message and sending it to all users in the chat room.
# 5. UserA's and UserB's chat_message method is called, which receives the message and sends it to the frontend.
# 6. The 'chatSocket.onmessage' is then triggered, puttting the messages in the chat box.
