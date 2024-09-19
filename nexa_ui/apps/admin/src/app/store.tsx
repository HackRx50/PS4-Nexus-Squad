import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Action, DocumentMetaData, User, Agent, TUserSliceInitialState, TDocumentMetaDataSliceInitialState, TActionSliceInitialState, TAgentSliceInitialState, TAppTitle, TAPIKeySliceInitialState, APIKey } from "./types";
import { E_TITLES } from "./constants";



const appTitlInitialState: TAppTitle ={
    title: E_TITLES.AGENTS_PAGE_TITLE
}

export const appTitleSlice = createSlice({
    initialState: appTitlInitialState,
    name: "appTitle",
    reducers: {
        setAppTitle(state, action: PayloadAction<E_TITLES>) {
            state.title = action.payload;
        }
    }
})


const userSliceInitialState: TUserSliceInitialState = {
    user: null
}

export const userSlice = createSlice({
    initialState: userSliceInitialState, 
    name: "user",
    reducers: {
        setUser(state, action: PayloadAction<User | null>) {
            state.user = action.payload
        },
        setUserLimits(state, action: PayloadAction<number>) {
            if (state.user) {
                state.user.availbaleLimits = action.payload
            }
        }
    }
});

const documentMetaDataSliceInitialState: TDocumentMetaDataSliceInitialState = {
    documentMetaData: {},
    loaded: false
}

export const documentMetaDataSlice = createSlice({
    initialState: documentMetaDataSliceInitialState,
    name: "documentMetaData",
    reducers: {
        addDocumentMetaData(state, action: PayloadAction<{agent_name: string, documents: DocumentMetaData[]}>) {
            state.documentMetaData[action.payload.agent_name] = action.payload.documents;
        }
    }
});


const actionSliceInitialState: TActionSliceInitialState = {
    actions: {},
    loaded: false
}

export const actionSlice = createSlice({
    initialState: actionSliceInitialState,
    name: "action",
    reducers: {
        addActions(state, action: PayloadAction<{agent_name: string, actions: Action[]}>) {
            state.actions[action.payload.agent_name] = action.payload.actions;
        }
    }
});

const agentSliceInitialState: TAgentSliceInitialState = {
    agents: [],
    loaded: false
}

export const agentSlice = createSlice({
    initialState: agentSliceInitialState,
    name: "agents",
    reducers: {
        setAgents(state, action: PayloadAction<Agent[]>) {
            state.agents = action.payload
        },
        clearActions(state) {
            state.agents = []
        },
        setAgentAccess(state, action: PayloadAction<string>) {
            const agentIndex = state.agents.findIndex(v => v.agid === action.payload);
            const agent = state.agents[agentIndex];
            if (agent.access === "PUBLIC") {
                agent.access = "PRIVATE";
            } else {
                agent.access = "PUBLIC"
            }
        }
    }
});

const apikeysSliceInitialState: TAPIKeySliceInitialState = {
    apikeys: [],
    loaded: false
}

export const apikeysSlice = createSlice({
    initialState: apikeysSliceInitialState,
    name: "apikeys",
    reducers: {
        setAPIkeys(state, action: PayloadAction<APIKey[]>) {
            state.apikeys = action.payload
        },
        addAPIKey(state, action: PayloadAction<APIKey>) {
            state.apikeys.unshift(action.payload);
        },
        removeAPIKey(state, action: PayloadAction<string>) {
            state.apikeys = state.apikeys.filter(apikey => apikey.uakid !== action.payload);
        },
        clearAPIKeys(state) {
            state.apikeys = []
        }
    }
});

export const { setUser, setUserLimits } = userSlice.actions;
export const { addActions } = actionSlice.actions;
export const { addDocumentMetaData } = documentMetaDataSlice.actions;
export const { setAgents, clearActions, setAgentAccess } = agentSlice.actions;
export const { setAppTitle } = appTitleSlice.actions;
export const { addAPIKey, clearAPIKeys, setAPIkeys, removeAPIKey } = apikeysSlice.actions;

export const store = configureStore({
    reducer: {
        userReducer: userSlice.reducer,
        actionsSlice: actionSlice.reducer,
        documentsSlice: documentMetaDataSlice.reducer,
        agentsSlice: agentSlice.reducer,
        appTitleSlice: appTitleSlice.reducer,
        apikeysSlice: apikeysSlice.reducer
    },
    devTools: process.env.NODE_ENV === "development"
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;