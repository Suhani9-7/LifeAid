
import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./styles/index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  document.body.innerHTML = "<h1>Error: Root element not found!</h1>";
} else {
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
  } catch (error) {
    console.error("Error rendering app:", error);
    rootElement.innerHTML = `<pre style="color: red;">Error: ${String(error)}</pre>`;
  }
}
  