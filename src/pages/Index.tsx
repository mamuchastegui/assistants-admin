
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/LoginButton";
import { useAuth0 } from "@auth0/auth0-react";

const Index = () => {
  const { isAuthenticated } = useAuth0();
  
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="max-w-lg w-full px-6 py-8 space-y-8 rounded-lg shadow-lg bg-card">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to Condamind</h1>
          <p className="text-muted-foreground mt-2">Manage your business efficiently</p>
        </div>
        
        <div className="space-y-4">
          {isAuthenticated ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link to="/calendar">
                <Button className="w-full" variant="outline">Calendar</Button>
              </Link>
              <Link to="/orders">
                <Button className="w-full" variant="outline">Orders</Button>
              </Link>
              <Link to="/menu">
                <Button className="w-full" variant="outline">Menu</Button>
              </Link>
              <Link to="/products">
                <Button className="w-full" variant="outline">Products</Button>
              </Link>
              <Link to="/assistant">
                <Button className="w-full" variant="outline">Assistant</Button>
              </Link>
              <Link to="/auth" className="sm:col-span-2">
                <Button className="w-full" variant="default">User Profile</Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <LoginButton />
              <p className="text-sm text-muted-foreground">Login to access the dashboard</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
