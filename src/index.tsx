import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from "react-redux";
import store from "./store";
import reportWebVitals from './reportWebVitals';
import './index.css';
import "./styles/generalStyles.css";
import "./styles/responsive.css";
import { ThemeContextProvider } from './context/themeContext';
import { AuthProvider } from './context/authContext';
import App from './App/App';
import './i18n';
import './styles/index.css';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css';
import './styles/vendors.css';
import { SpinnerProvider } from './context/spinnerContext';
import { Modal2Provider } from './context/modal2Context';
import { StreamChatProvider } from './context/streamChatContext';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
	// <React.StrictMode>
	<StreamChatProvider>
		<Modal2Provider>
			<SpinnerProvider>
				<ThemeContextProvider>
					<Provider store={store}>
						<BrowserRouter>
							<AuthProvider>
								<App />
							</AuthProvider>
						</BrowserRouter>
					</Provider>
				</ThemeContextProvider>
			</SpinnerProvider>
		</Modal2Provider>
	</StreamChatProvider>
	// </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
