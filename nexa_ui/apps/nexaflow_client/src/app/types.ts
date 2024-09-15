export interface Message {
    content: string;
    additional_kwargs: {
        tool_calls?: {
            id: string;
            function?: {
                name: string;
                arguments: string;
            };
        }[];
    };
    response_metadata: {
        token_usage?: {
            prompt_tokens: number;
            total_tokens: number;
            completion_tokens: number;
        };
        model?: string;
        finish_reason?: string;
    };
    type: "ai" | "tool" | "human";
    name: string | null;
    id: string | null;
    example: boolean;
}

export type ToolMessage = {
    content: string;
    additional_kwargs: {};
    response_metadata: {};
    type: "tool";
    name: string;
    id: string;
    tool_call_id: string;
    artifact: null;
    status: string;
}


export type AIMessage = {
    content: string;
    additional_kwargs: {
        tool_calls: {
            id: string;
            function: {
                name: string;
                arguments: string;
            };
        }[];
    };
    response_metadata: {
        token_usage: {
            prompt_tokens: number;
            total_tokens: number;
            completion_tokens: number;
        };
        model: string;
        finish_reason: string;
    };
    type: "ai";
    name: null;
    id: string;
    example: boolean;
    tool_calls: {
        name: string;
        args: {
            city: string;
        };
        id: string;
        type: string;
    }[];
    invalid_tool_calls: [];
    usage_metadata: {
        input_tokens: number;
        output_tokens: number;
        total_tokens: number;
    };
}