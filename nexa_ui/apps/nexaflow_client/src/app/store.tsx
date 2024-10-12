import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthDetails, Message, Session } from './types';

const sessionsInitialState: { sessions: Session[] } = {
  sessions: [],
};

const sessionsSlice = createSlice({
  initialState: sessionsInitialState,
  name: 'session',
  reducers: {
    setSessions(state, action: PayloadAction<Session[]>) {
      state.sessions = action.payload;
    },
    addSession(state, action: PayloadAction<Session>) {
      state.sessions.unshift(action.payload);
    },
    setSessionMessages(
      state,
      action: PayloadAction<{ sessionId: string; messages: Message[] }>
    ) {
      const index = state.sessions.findIndex(
        (value) => action.payload.sessionId === value.cid
      );
      if (index > -1) {
        state.sessions[index].messages = action.payload.messages;
      }
    },
    setSessionDocuments(
      state,
      action: PayloadAction<{ sessionId: string; documents: string[] }>
    ) {
      const index = state.sessions.findIndex(
        (value) => action.payload.sessionId === value.cid
      );
      if (index > -1) {
        state.sessions[index].documents = action.payload.documents;
      }
    },
    setSessionMessage(
      state,
      action: PayloadAction<{ sessionId: string; message: Message }>
    ) {
      const index = state.sessions.findIndex(
        (value) => action.payload.sessionId === value.cid
      );
      if (index > -1) {
        if (!state.sessions[index].messages) {
          state.sessions[index].messages = []
        }
        state.sessions[index].messages.push(action.payload.message);
      }
    },
    removeSession(state, action: PayloadAction<string>) {
      state.sessions = state.sessions.filter(
        (value) => value.cid !== action.payload
      );
    },
    setSessionTitle(state, action: PayloadAction<{sessionId: string, title: string}>) {
      const index = state.sessions.findIndex(
        (value) => action.payload.sessionId === value.cid
      );
      if (index > -1) {
        state.sessions[index].title = "" + action.payload.title
      }
    }
  },
});

const authDetailsInitialState: AuthDetails = {
  accessToken: null,
};

const authSlice = createSlice({
  initialState: authDetailsInitialState,
  name: 'auth',
  reducers: {
    setAccessToken(state, payload: PayloadAction<AuthDetails>) {
      state.accessToken = payload.payload.accessToken;
    },
  },
});

export const { setAccessToken } = authSlice.actions;
export const {
  setSessions,
  addSession,
  removeSession,
  setSessionMessage,
  setSessionMessages,
  setSessionTitle,
  setSessionDocuments
} = sessionsSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    sessionsSlice: sessionsSlice.reducer,
  },
  devTools: process.env.NODE_ENV === "development"
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
