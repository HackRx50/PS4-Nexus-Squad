import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Action, DocumentMetaData, User, Agent, TUserSliceInitialState, TDocumentMetaDataSliceInitialState, TActionSliceInitialState, TAgentSliceInitialState, TAppTitle } from "./types";
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
        }
    }
});

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
export const { setAppTitle } = appTitleSlice.actions;

export const store = configureStore({
    reducer: {
        userReducer: userSlice.reducer,
        actionsSlice: actionSlice.reducer,
        documentsSlice: documentMetaDataSlice.reducer,
        agentsSlice: agentSlice.reducer,
        appTitleSlice: appTitleSlice.reducer
    },
    devTools: process.env.NODE_ENV === "development"
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;