# Generated by Django 3.2.19 on 2024-10-17 12:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0006_rename_checkbox_user_check2fa'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='isLogged',
            field=models.BooleanField(default=False),
        ),
    ]