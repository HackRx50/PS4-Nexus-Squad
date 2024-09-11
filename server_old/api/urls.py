from django.urls import path, include
from . import views

urlpatterns = [
    path("actions", views.create_action, name="create_action"),
    path("actions/<str:action_id>", views.delete_action, name="delete_action"),
    path("nexbot/", include("nexbot.urls")),
]