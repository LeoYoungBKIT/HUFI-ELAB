import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { store } from "./store";
import { Provider } from "react-redux";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { viVN } from "@mui/material/locale";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
	<React.StrictMode>
		<Provider store={store}>
			<ThemeProvider
				theme={createTheme(
					{
						typography: {
							fontFamily: [
								'-apple-system',
								'BlinkMacSystemFont',
								'"Segoe UI"',
								'Roboto',
								'"Helvetica Neue"',
								'Arial',
								'"Apple Color Emoji"',
								'"Segoe UI Emoji"',
								'"Segoe UI Symbol"',
								'sans-serif',
							].join(','),
						},
					},
					viVN,
				)}
			>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</ThemeProvider>
		</Provider>
	</React.StrictMode>,
)

reportWebVitals();
