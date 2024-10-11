from django.db import models

class User(models.Model):
    username = models.CharField(max_length=20)
    password = models.CharField(max_length=64)
    checkbox = models.BooleanField(default=False)
    skey_2FA = models.CharField(max_length=32)

    def __str__(self):
        return self.username
