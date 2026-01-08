import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "./style/reset.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { pdfjs } from "react-pdf";
import { Toaster } from "react-hot-toast";

const root = createRoot(document.getElementById("root"));

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

root.render(
    <StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <App />
                <Toaster
                    position="top-right"
                    reverseOrder={false}
                    containerStyle={{
                        zIndex: 999999,
                        top: 20,
                        right: 20,
                    }}
                    toastOptions={{
                        className: "",
                        style: {
                            border: "1px solid #713200",
                            padding: "16px",
                            color: "#713200",
                            zIndex: 999999,
                        },
                    }}
                />
            </BrowserRouter>
        </AuthProvider>
    </StrictMode>
);
