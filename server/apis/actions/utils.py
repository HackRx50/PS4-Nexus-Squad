import os
import cuid
import types
import inspect
import importlib

from apis.storage.models import Action

def create_action_file(code: str):
    temporary_file = f"{cuid.cuid()}.py"
    with open(f"temp/{temporary_file}", "w") as f:
        f.write(code)
    return temporary_file

def store_actions(module_name: str, title: str, language: str, agent_id, uid=None):
    module = importlib.import_module(f"temp.{module_name[:-3]}")
    function_name_id = cuid.cuid()
    actions = []
    for attribute_name in dir(module):
        attribute = getattr(module, attribute_name)
        if isinstance(attribute, types.FunctionType):
            code = inspect.getsource(attribute)
            function_id = f'{function_name_id}_{attribute_name}'
            action = Action.create(title, function_id, attribute.__doc__, code, language, agent_id)
            actions.append(action.__dict__)
    os.remove(f"temp/{module_name}")
    return actions
