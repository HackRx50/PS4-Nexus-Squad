import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import App from './app/app';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { appFetch } from './app/utility';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

(window as any).appFetch = appFetch

root.render(
  <Provider store={store}>
    <StrictMode>
      <App />
    </StrictMode>
  </Provider>
);
