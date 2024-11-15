from django.db import models

class User(models.Model):
	username = models.CharField(max_length=20)
	password = models.CharField(max_length=64)
	check2FA = models.BooleanField(default=False)
	skey_2FA = models.CharField(max_length=32)

	profile_pic = models.ImageField(upload_to='profile_pics/', default='default.jpg')
	motto = models.CharField(max_length=100, default='')
	comments_policy = models.CharField(max_length=10, default='anyone')

	blocked_users = models.ManyToManyField("self", symmetrical=False, related_name="blocked_by")

	def __str__(self):
		return self.username

class Invitation(models.Model):
	from_user = models.ForeignKey(User, related_name='invitations_sent', on_delete=models.CASCADE)
	to_user = models.ForeignKey(User, related_name='invitation_requests', on_delete=models.CASCADE)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		constraints = [
			models.UniqueConstraint(fields=['from_user', 'to_user'], name='unique_invitation')
		]

	def __str__(self):
		return f"{self.from_user.username} sent {self.to_user.username} a friend invitation"

class Friendship(models.Model):
	user1 = models.ForeignKey(User, related_name='friends_with', on_delete=models.CASCADE)
	user2 = models.ForeignKey(User, related_name='friends_with_user', on_delete=models.CASCADE)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		constraints = [
			models.UniqueConstraint(fields=['user1', 'user2'], name='unique_friendship'),
			models.CheckConstraint(check=~models.Q(user1=models.F('user2')), name='cannot_friend_self')
		]

	def __str__(self):
		return f"{self.user1.username} is friends with {self.user2.username}"

class Message(models.Model):
	room_name = models.CharField(max_length=255)
	sender = models.CharField(max_length=20)
	message = models.TextField()
	sent_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.sender.username} sent a message in room {self.room_name}"
