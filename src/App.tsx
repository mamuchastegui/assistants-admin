
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Calendar from "./pages/Calendar";
import Assistant from "./pages/Assistant";
import Integrations from "./pages/Integrations";
import Orders from "./pages/Orders";
import Menu from "./pages/Menu";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./hooks/use-theme";

// Create a client with better defaults for mobile
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="condamind-theme">
      <BrowserRouter>
        <TooltipProvider>
          <div className="min-h-[100dvh] overflow-hidden">
            <Toaster />
            <Sonner position="top-center" closeButton />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/menu" element={<Menu />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </TooltipProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
