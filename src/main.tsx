import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ReadAloudProvider } from "./contexts/ReadAloudContext";
import { router } from "./router";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <ReadAloudProvider>
        <RouterProvider router={router} />
      </ReadAloudProvider>
    </AuthProvider>
  </React.StrictMode>,
);
