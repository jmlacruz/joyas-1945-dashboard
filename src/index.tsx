import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { SpinnerProvider } from "./context/spinnerContext";
import { Provider } from "react-redux";
import store from "./store";
import { StreamChatProvider } from "./context/streamChatContext";

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);
root.render(
    // <React.StrictMode>
    <Provider store={store}>
        <StreamChatProvider>
            <SpinnerProvider>
                <App />
            </SpinnerProvider>
        </StreamChatProvider>
    </Provider>
    //</React.StrictMode> 
);
