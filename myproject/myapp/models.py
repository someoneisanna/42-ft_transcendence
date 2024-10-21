from django.db import models

class User(models.Model):
	username = models.CharField(max_length=20)
	password = models.CharField(max_length=64)
	check2FA = models.BooleanField(default=False)
	skey_2FA = models.CharField(max_length=32)
	profile_pic = models.ImageField(upload_to='profile_pics/', default='profile_pics/default.jpg')

	def __str__(self):
		return self.username


class Friendship(models.Model):
	from_user = models.ForeignKey(User, related_name='friendships', on_delete=models.CASCADE)
	to_user = models.ForeignKey(User, related_name='friend_of', on_delete=models.CASCADE)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		unique_together = ('from_user', 'to_user')

	def __str__(self):
		return f"{self.from_user.username} is friends with {self.to_user.username}"
