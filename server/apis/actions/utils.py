import os
import cuid
import types
import inspect
import importlib

from storage.models import Action


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
            function_id = f"{function_name_id}_{attribute_name}"
            action = Action.create(
                title=title,
                function_name=attribute_name,
                description=attribute.__doc__,
                code=code,
                language=language,
                agent_id=agent_id,
                owner_id=uid,
            )
            actions.append(action.__dict__)
    os.remove(f"temp/{module_name}")
    return actions
