from langchain_core.messages import AIMessage, ToolMessage

resp = [
    {
        "content": "",
        "additional_kwargs": {
            "tool_calls": [
                {
                    "id": "DN1MbT5MK",
                    "function": {
                        "name": "get_geocoding",
                        "arguments": '{"city": "Indore"}',
                    },
                }
            ]
        },
        "response_metadata": {
            "token_usage": {
                "prompt_tokens": 587,
                "total_tokens": 611,
                "completion_tokens": 24,
            },
            "model": "mistral-large-latest",
            "finish_reason": "tool_calls",
        },
        "type": "ai",
        "name": None,
        "id": "run-77c2af44-8d96-43a9-a07e-ee30d24507b0-0",
        "example": False,
        "tool_calls": [
            {
                "name": "get_geocoding",
                "args": {"city": "Indore"},
                "id": "DN1MbT5MK",
                "type": "tool_call",
            }
        ],
        "invalid_tool_calls": [],
        "usage_metadata": {
            "input_tokens": 587,
            "output_tokens": 24,
            "total_tokens": 611,
        },
    },
    {
        "content": "[]",
        "additional_kwargs": {},
        "response_metadata": {},
        "type": "tool",
        "name": "get_geocoding",
        "id": "f9b090d1-c8d1-4df7-b544-c657ff44ade9",
        "tool_call_id": "DN1MbT5MK",
        "artifact": None,
        "status": "success",
    },
    {
        "content": "[-1.0, -1.0]",
        "additional_kwargs": {},
        "response_metadata": {
            "token_usage": {
                "prompt_tokens": 637,
                "total_tokens": 647,
                "completion_tokens": 10,
            },
            "model": "mistral-large-latest",
            "finish_reason": "stop",
        },
        "type": "ai",
        "name": None,
        "id": "run-676b4e7e-4c23-40b0-9421-fea9070e9e60-0",
        "example": False,
        "tool_calls": [],
        "invalid_tool_calls": [],
        "usage_metadata": {
            "input_tokens": 637,
            "output_tokens": 10,
            "total_tokens": 647,
        },
    },
]
def sampleInvoke():
    last_three_response = []
    for message in resp:
        if message["type"] == "ai":
            last_three_response.append(AIMessage.parse_obj(message))
        elif message["type"] == "tool":
            last_three_response.append(ToolMessage.parse_obj(message))
    return last_three_response
