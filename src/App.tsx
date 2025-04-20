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
import OrderDetails from "./pages/OrderDetails";
import Menu from "./pages/Menu";
import RestaurantMenu from "./pages/RestaurantMenu";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./hooks/use-theme";
import React from "react";
import Success from "./pages/payments/mercadopago/Success";
import Failure from "./pages/payments/mercadopago/Failure";
import Pending from "./pages/payments/mercadopago/Pending";

// Immediately apply theme before React hydration
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('condamind-theme') || 'dark';
  document.documentElement.classList.add(savedTheme);
}

function App() {
  // Create a client with better defaults for mobile
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1
      }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="condamind-theme">
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
                <Route path="/orders/:orderId" element={<OrderDetails />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/restaurant-menu" element={<RestaurantMenu />} />
                
                {/* MercadoPago payment response routes */}
                <Route path="/payments/mercadopago/success" element={<Success />} />
                <Route path="/payments/mercadopago/failure" element={<Failure />} />
                <Route path="/payments/mercadopago/pending" element={<Pending />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </TooltipProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
