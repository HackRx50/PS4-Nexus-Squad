import { E_TITLES } from "./constants";

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


export type Agent =  {
    owner: string;
    name: string;
    access: string;
    description?: string;
    agid: string;
    created_at: string;
    update_at: string;
}

export interface User {
    email: string,
    displayName: string,
    emailVerified: boolean,
    uid: string,
    photoURL: string | null,
    isAnonymous: boolean,
    actions?: Action[];
    agents?: Agent[]
    documents?: DocumentMetaData[];
    accessToken?: string,
    availbaleLimits?: number
}


export type APIKey = {
    uakid: string,
    key: string,
    user_id: string,
    agent: string,
    description?: string
    use_count: number,
    created_at: string
    expires_at: string
    updated_at: string
}

export type TUserSliceInitialState = {
    user: User | null
}

export type TDocumentMetaDataSliceInitialState = {
    documentMetaData: Record<string, DocumentMetaData[]>
    loaded: boolean
}


export type TActionSliceInitialState = {
    actions: Record<string, Action[]>,
    loaded: boolean
}


export type TAgentSliceInitialState = {
    agents: Agent[]
    loaded: boolean
}

export type TAPIKeySliceInitialState = {
    apikeys: APIKey[]
    loaded: boolean
}

export type TAppTitle = {
    title: E_TITLES
}
