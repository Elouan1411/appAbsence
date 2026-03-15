import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "./style/reset.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { pdfjs } from "react-pdf";
import { Toaster } from "react-hot-toast";
import { UnsavedProvider } from "./context/UnsavedContext.jsx";
import ScrollToTop from "./components/common/ScrollToTop.jsx";

const root = createRoot(document.getElementById("root"));

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

if ("serviceWorker" in navigator) {
    import("virtual:pwa-register").then(({ registerSW }) => {
        registerSW({ immediate: true });
    });
}

root.render(
    <StrictMode>
        <AuthProvider>
            <UnsavedProvider>
                <BrowserRouter>
                    <ScrollToTop />
                    <App />
                </BrowserRouter>
            </UnsavedProvider>
        </AuthProvider>
    </StrictMode>,
);
