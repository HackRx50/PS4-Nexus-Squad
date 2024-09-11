from django.http import JsonResponse
import importlib
import inspect
import types
import json
import os

from .models import Action
from nexbot.views import agents
import cuid

def create_action_file(code: str):
    temporary_file = f"{cuid.cuid()}.py"
    with open(f"actions/{temporary_file}", "w") as f:
        f.write(code)
    return temporary_file

def store_actions(module_name: str, title: str, language: str):
    module = importlib.import_module(f"actions.{module_name[:-3]}")
    function_name_id = cuid.cuid()
    actions = []
    for attribute_name in dir(module):
        attribute = getattr(module, attribute_name)
        if isinstance(attribute, types.FunctionType):
            code = inspect.getsource(attribute)
            function_id = f'{function_name_id}_{attribute_name}'
            action = Action(title=function_id, description=attribute.__doc__, code=code, language=language)
            action.save()
            actions.append(action.__dict__)  # Store the Action instance itself
    os.remove(f"actions/{module_name}")
    return actions_to_json(actions)

def actions_to_json(actions):
    return [{ "id": str(action["id"]), "title": action["title"], "description": action["description"], "code": action["code"], "language": action["language"], "created_at": action["created_at"], "updated_at": action["updated_at"] } for action in actions]

def create_action(request):
    if request.method == "GET":
        return JsonResponse({
            "actions": get_actions()
        })
    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            title = data.get("title")
            code = data.get("code")
            language = data.get("language")

            if not all([title, code, language]):
                return JsonResponse({"error": "Missing required fields"}, status=400)

            temporary_file = create_action_file(code)
            actions = store_actions(temporary_file, title, language)
            agents['default'].__boot__()
            return JsonResponse({
                "message": "Action created successfully",
                "actions": actions
            })
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)
    return JsonResponse({"error": "Invalid request method"}, status=405)

def delete_action(request, action_id):
    if request.method == "DELETE":
        action = Action.objects.get(id=action_id)
        action.delete()
        return JsonResponse({"message": "Action deleted successfully", "action": {
            "id": action_id,
            "title": action.title,
            "description": action.description,
            "code": action.code,
            "language": action.language,
            "created_at": action.created_at,
            "updated_at": action.updated_at
        }})
    return JsonResponse({"error": "Invalid request method"}, status=405)

def get_actions():
    actions = Action.objects.all()
    return [action_to_json(action) for action in actions]

def action_to_json(action):
    return {
        "id": str(action.id),
        "title": action.title,
        "description": action.description,
        "code": action.code,
        "language": action.language,
        "created_at": action.created_at,
        "updated_at": action.updated_at
    }
