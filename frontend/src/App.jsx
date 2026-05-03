import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routes";
import { Toaster } from "sonner";

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
      <Toaster richColors position="bottom-right"/>
    </BrowserRouter>
  );
}