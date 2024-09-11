from django.shortcuts import render
import importlib
import types
import inspect
from functools import wraps

actions = {}

actions_name = []

def border_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        # Create a border with asterisks around the result
        border = '*' * (len(result) + 4)
        return f"{border}\n* {result} *\n{border}"
    return wrapper

def write_function(prompt:str):
    with open("actions/action.py", "w") as f:
        f.write(prompt)
    load_actions()

def load_actions():
    module = importlib.import_module(f"actions.action")
    for attribute_name in dir(module):
        attribute = getattr(module, attribute_name)
        if isinstance(attribute, types.FunctionType):
            actions[attribute_name] = border_decorator(attribute)
            actions_name.append(attribute_name)

load_actions()

def index(request):
    return render(request, "nexaflow/index.html")

def create_action(request):
    if request.method == "POST":
        prompt = request.POST.get("prompt")
        write_function(prompt)
        return render(request, "nexaflow/actions_call.html", {"actions": actions_name})
    return render(request, "nexaflow/404.html")

def call_action(request):
    if request.method == "GET":
        return render(request, "nexaflow/actions_call.html", {"actions": actions_name})
    elif request.method == "POST":
        action = request.POST.get("action")
        execution_type = request.POST.get("execution_type")
        result = None
        if execution_type == "call":
            print("Executing Call")
            result = actions[action]()
        elif execution_type == "print":
            print("Executing print")
            result = inspect.getsource(actions[action])
        if action in actions:
            return render(request, "nexaflow/actions_call_result.html", {
                "actions": actions_name,
                "result": result
            })
