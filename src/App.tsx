
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import { PrivateRoute } from "./components/PrivateRoute";
import { TenantProvider } from "./context/TenantContext";
import { NotificationsProvider } from "./providers/NotificationsProvider";
import Index from "./pages/Index";
import Calendar from "./pages/Calendar";
import Assistant from "./pages/Assistant";
import Integrations from "./pages/Integrations";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Menu from "./pages/Menu";
import RestaurantMenu from "./pages/RestaurantMenu";
import Notifications from "./pages/Notifications";
import Products from "./pages/Products"; // Importar la página de Products
import TiendaNubeProducts from "./pages/TiendaNubeProducts";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Callback from "./pages/Callback";
import AuthError from "./pages/AuthError";
import Login from "./pages/Login";
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
      <BrowserRouter>
        <TenantProvider>
          <AuthProvider>
            <ThemeProvider defaultTheme="dark" storageKey="condamind-theme">
              <TooltipProvider>
                <NotificationsProvider>
                  <div className="min-h-[100dvh] overflow-hidden">
                    <Toaster />
                    <Sonner position="top-center" closeButton />
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/callback" element={<Callback />} />
                      <Route path="/auth-error" element={<AuthError />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/calendar" element={
                        <PrivateRoute>
                          <Calendar />
                        </PrivateRoute>
                      } />
                      <Route path="/assistant" element={
                        <PrivateRoute>
                          <Assistant />
                        </PrivateRoute>
                      } />
                      <Route path="/integrations" element={
                        <PrivateRoute>
                          <Integrations />
                        </PrivateRoute>
                      } />
                      <Route path="/orders" element={
                        <PrivateRoute>
                          <Orders />
                        </PrivateRoute>
                      } />
                      <Route path="/orders/:orderId" element={
                        <PrivateRoute>
                          <OrderDetails />
                        </PrivateRoute>
                      } />
                      <Route path="/menu" element={
                        <PrivateRoute>
                          <Menu />
                        </PrivateRoute>
                      } />
                      <Route path="/restaurant-menu" element={
                        <PrivateRoute>
                          <RestaurantMenu />
                        </PrivateRoute>
                      } />
                      <Route path="/notifications" element={
                        <PrivateRoute>
                          <Notifications />
                        </PrivateRoute>
                      } />
                      <Route path="/products" element={
                        <PrivateRoute>
                          <Products />
                        </PrivateRoute>
                      } />
                      <Route path="/tiendanube-products" element={
                        <PrivateRoute>
                          <TiendaNubeProducts />
                        </PrivateRoute>
                      } />
                      
                      {/* MercadoPago payment response routes */}
                      <Route path="/payments/mercadopago/success" element={<Success />} />
                      <Route path="/payments/mercadopago/failure" element={<Failure />} />
                      <Route path="/payments/mercadopago/pending" element={<Pending />} />
                      
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </NotificationsProvider>
              </TooltipProvider>
            </ThemeProvider>
          </AuthProvider>
        </TenantProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
