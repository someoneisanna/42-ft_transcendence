from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from myapp.models import Message, User
import json

class ChatConsumer(AsyncWebsocketConsumer):

	# Triggered when a new websocket connection is established. 
	async def connect(self):
		await self.accept()

	# Triggered when a websocket connection is closed. Here we remove the user from any chat room they joined.
	async def disconnect(self, close_code):
		if hasattr(self, 'room_group_name'):
			await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

	# Triggered when a message is received from the websocket connection. Here we broadcast the message to all users in the chat room.
	async def receive(self, text_data):
		data = json.loads(text_data)
		type = data['type']
		room_name = data['room_name']
		username = data['username']

		if type == 'join_room':
			self.room_group_name = room_name
			await self.channel_layer.group_add(self.room_group_name, self.channel_name)
			messages = await self.get_messages(room_name)
			for message in messages:
				await self.send(text_data=json.dumps({
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
				self.room_group_name,
				{
					'type': 'chat_message',
					'room_name': room_name,
					'username': username,
					'message': message,
					'sent_at': sent_at
				}
			)

	@sync_to_async
	def store_message(self, room_name, username, message):
		Message.objects.create(room_name=room_name, sender=username, message=message)

	@sync_to_async
	def get_messages(self, room_name):
		messages = Message.objects.filter(room_name=room_name).order_by('sent_at').all()
		return list(messages)

	# Triggered when the group_send message of type chat_message is received. Here we send the message to the websocket connection.
	async def chat_message(self, event):
		await self.send(text_data=json.dumps({
			'room_name': event['room_name'],
			'username': event['username'],
			'message': event['message'],
			'sent_at': event['sent_at']
		}
		))


# Timeline Summary

# 1. The connect method is called when a new websocket connection is established (when a user opens the website).
# 2. UserA clicks on the button to open the chat with UserB. 
# 3. When UserA clicks on the send button, 'chatSocket.send' is called, which triggers the receive method.
# 4. The receive method is called, parsing the message and sending it to all users in the chat room.
# 5. UserA's and UserB's chat_message method is called, which receives the message and sends it to the frontend.
# 6. The 'chatSocket.onmessage' is then triggered, puttting the messages in the chat box.
