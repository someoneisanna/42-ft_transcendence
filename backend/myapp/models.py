from django.db import models
from django.contrib.postgres.fields import ArrayField

class User(models.Model):
	username = models.CharField(max_length=20)
	email = models.EmailField(max_length=50, default='')
	password = models.CharField(max_length=64)
	check2FA = models.BooleanField(default=False)
	skey_2FA = models.CharField(max_length=32)
	verification_code = models.CharField(max_length=6, default='')
	default_language = models.PositiveIntegerField(default=0)

	profile_pic = models.ImageField(upload_to='profile_pics/', default='default.jpg')
	motto = models.CharField(max_length=100, default='')
	comments_policy = models.CharField(max_length=10, default='anyone')
	allow_game_invitations = models.BooleanField(default=True)

	blocked_users = models.ManyToManyField("self", symmetrical=False, related_name="blocked_by")

	joined = models.DateTimeField(auto_now_add=True)
	pong_game_wins = ArrayField(models.PositiveIntegerField(), size=4, default=list)
	pong_game_losses = ArrayField(models.PositiveIntegerField(), size=4, default=list)
	pong_tournament_wins = ArrayField(models.PositiveIntegerField(), size=2, default=list)
	pong_tournament_losses = ArrayField(models.PositiveIntegerField(), size=2, default=list)
	pong_n_tournaments_won = models.PositiveIntegerField(default=0)

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
	sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE, default=None)
	receiver = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE, default=None)
	message = models.TextField()
	sent_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.sender.username} sent a message in room {self.room_name}"

class PongGame(models.Model):
	game_type = models.CharField(max_length=20, default='local')
	room_name = models.CharField(max_length=255, unique=True)
	player1 = models.ForeignKey(User, related_name='player1', on_delete=models.CASCADE, null=True, blank=True)
	player2 = models.ForeignKey(User, related_name='player2', on_delete=models.CASCADE, null=True, blank=True)
	player1_score = models.IntegerField(default=0)
	player2_score = models.IntegerField(default=0)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.player1.username} is playing against {self.player2.username}"

class Comment(models.Model):
	author = models.ForeignKey(User, related_name="comments", on_delete=models.CASCADE, default=None)
	recipient = models.ForeignKey(User, related_name="profile_comments", on_delete=models.CASCADE, default=None)
	message = models.TextField(default='')
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"Comment by {self.author.username} on {self.recipient.username}"
