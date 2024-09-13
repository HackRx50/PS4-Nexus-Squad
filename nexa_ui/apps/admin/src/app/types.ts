export type Action = {
    aid: string;
    title: string;
    description: string;
    language: string;
    agent: string;
    created_at: string;
    code: string;
    function_name: string;
    requirements: string | null;
    owner: string;
    updated_at: string;
}

export type DocumentMetaData =  {
    owner: string;
    name: string;
    type: string;
    created_at: string;
    agent: string;
    did: string;
    vector_ids: string[];
    updated_at: string;
}
