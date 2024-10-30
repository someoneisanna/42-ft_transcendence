from channels.generic.websocket import AsyncWebsocketConsumer
import json

class ChatConsumer(AsyncWebsocketConsumer):

	# Triggered when a new websocket connection is established. 
	async def connect(self):
		await self.accept()

	# Triggered when a websocket connection is closed. Here we remove the user from any chat room they joined.
	async def disconnect(self):
		if hasattr(self, 'room_group_name'):
			await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

	# Triggered when a message is received from the websocket connection. Here we broadcast the message to all users in the chat room.
	async def receive(self, text_data):
		data = json.loads(text_data)
		type = data['type']
		room_name = data['room_name']
		user = data['user']

		if type == 'join_room':
			self.room_group_name = room_name
			await self.channel_layer.group_add(self.room_group_name, self.channel_name)
		
		elif type == 'chat_message':
			message = data['message']
			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'chat_message',
					'room_name': room_name,
					'message': message,
					'user': user
				}
			)

	# Triggered when the group_send message of type chat_message is received. Here we send the message to the websocket connection.
	async def chat_message(self, event):
		await self.send(text_data=json.dumps({
			'room_name': event['room_name'],
			'message': event['message'],
			'user': event['user']
		}
		))


# Timeline Summary

# 1. The connect method is called when a new websocket connection is established (when a user opens the website).
# 2. UserA clicks on the button to open the chat with UserB. 
# 3. When UserA clicks on the send button, 'chatSocket.send' is called, which triggers the receive method.
# 4. The receive method is called, parsing the message and sending it to all users in the chat room.
# 5. UserA's and UserB's chat_message method is called, which receives the message and sends it to the frontend.
# 6. The 'chatSocket.onmessage' is then triggered, puttting the messages in the chat box.
