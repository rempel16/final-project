import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./app/providers/AuthProvider";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { themeLight } from "./app/theme/theme";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themeLight}>
        <CssBaseline />
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  </React.StrictMode>,
);
