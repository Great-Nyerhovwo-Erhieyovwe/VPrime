import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";          // <-- our Tailwind entry
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);