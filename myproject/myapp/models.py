from django.db import models

class User(models.Model):
    username = models.CharField(max_length=20)
    password = models.CharField(max_length=64)
    check2FA = models.BooleanField(default=False)
    skey_2FA = models.CharField(max_length=32)
    profile_pic = models.ImageField(upload_to='profile_pics/', default='profile_pics/default.jpg')

    def __str__(self):
        return self.username
