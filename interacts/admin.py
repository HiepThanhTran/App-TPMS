# from django.contrib import admin
from core.admin import my_admin_site
from interacts.models import Comment, Like

my_admin_site.register(Comment)
my_admin_site.register(Like)
