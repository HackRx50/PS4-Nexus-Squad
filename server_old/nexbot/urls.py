from django.urls import path
from . import views

urlpatterns = [
    path('boot_agent/<str:agent_id>/', views.boot_agent, name='boot_agent'),
    path('conversation/<str:agent_id>', views.conversation, name='conversation')
]