
import React from "react";
import { Menu, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center">
          {children}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="ml-2 md:ml-0 md:hidden lg:flex lg:items-center">
            <span className="text-lg font-semibold">CONDAMIND Assistants</span>
          </div>
        </div>
        
        <div className="hidden md:flex md:flex-1 md:justify-center md:px-6">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Buscar..." 
              className="w-full pl-9 bg-gray-50 border border-gray-300 focus:border-primary focus:ring-primary"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <span className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
            UD
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
