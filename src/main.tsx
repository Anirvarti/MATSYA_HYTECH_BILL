import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css"; // MUST MATCH YOUR CSS FILE

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);