import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Action, DocumentMetaData, User, Agent } from "./types";

type TUserSliceInitialState = {
    user: User | null
}

const userSliceInitialState: TUserSliceInitialState = {
    user: null
}

export const userSlice = createSlice({
    initialState: userSliceInitialState, 
    name: "user",
    reducers: {
        setUser(state, action: PayloadAction<User | null>) {
            state.user = action.payload
        }
    }
});

type TDocumentMetaDataSliceInitialState = {
    documentMetaData: Record<string, DocumentMetaData[]>
}

const documentMetaDataSliceInitialState: TDocumentMetaDataSliceInitialState = {
    documentMetaData: {}
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

type TActionSliceInitialState = {
    actions: Record<string, Action[]>
}

const actionSliceInitialState: TActionSliceInitialState = {
    actions: {}
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


type TAgentSliceInitialState = {
    agents: Agent[]
}

const agentSliceInitialState: TAgentSliceInitialState = {
    agents: []
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
        }
    }
});

export const { setUser } = userSlice.actions;
export const { addActions } = actionSlice.actions;
export const { addDocumentMetaData } = documentMetaDataSlice.actions;
export const { setAgents, clearActions } = agentSlice.actions;

export const store = configureStore({
    reducer: {
        userReducer: userSlice.reducer,
        actionsSlice: actionSlice.reducer,
        documentsSlice: documentMetaDataSlice.reducer,
        agentsSlice: agentSlice.reducer
    },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;