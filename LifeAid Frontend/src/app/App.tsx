import { RouterProvider } from "react-router";
import { router } from "./routes";
import ErrorBoundary from "./components/ErrorBoundary";
import ChatbotWidget from "./components/ChatbotWidget";

export default function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <ChatbotWidget />
    </ErrorBoundary>
  );
}