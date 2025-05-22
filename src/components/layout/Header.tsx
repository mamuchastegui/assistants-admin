
import React from "react";
import { Bell, LogOut, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";
import { useAuth0 } from "@auth0/auth0-react";
import { LogoutButton } from "@/components/LogoutButton";
import NotificationCounter from "@/components/notifications/NotificationCounter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const { openMobile } = useSidebar();
  const [showSearch, setShowSearch] = React.useState(false);
  const { isAuthenticated, user } = useAuth0();
  
  // Get user initials for the avatar
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name.split(' ')
      .map(name => name[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };
  
  return (
    <motion.header 
      layout
      className="bg-card border-b border-border sticky top-0 z-30"
    >
      <div className="px-2 sm:px-3 lg:px-6 flex h-14 sm:h-16 items-center justify-between">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {children}
          <div className="flex items-center">
            <motion.span 
              layout
              className="text-sm sm:text-base md:text-lg font-semibold truncate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {isMobile ? "Admin" : "CONDAMIND Assistants"}
            </motion.span>
          </div>
        </div>
        
        {/* Desktop search */}
        <div className="hidden md:flex md:flex-1 md:justify-center md:px-6 max-w-md mx-auto">
          <motion.div 
            className="relative w-full"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar..." 
              className="w-full pl-9 bg-muted border border-input focus:border-primary focus:ring-primary transition-all"
            />
          </motion.div>
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Mobile search trigger */}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 sm:h-8 sm:w-8"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          )}
          {/* Dark mode toggle */}
          <DarkModeToggle />
          
          {/* Notification Counter */}
          {isAuthenticated && (
            <NotificationCounter className="h-7 w-7 sm:h-8 sm:w-8" />
          )}
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.span 
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-xs sm:text-sm cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {getUserInitials()}
                </motion.span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user && (
                  <>
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <a href="/auth">
                    Mi Perfil
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <div>
                    <LogoutButton />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <motion.span 
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-xs sm:text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              UD
            </motion.span>
          )}
        </div>
      </div>

      {/* Mobile search panel */}
      <AnimatePresence>
        {isMobile && showSearch && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-2 sm:px-3 pb-2 sm:pb-3 overflow-hidden"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar..." 
                className="w-full pl-8 sm:pl-9 bg-muted border border-input focus:border-primary focus:ring-primary h-8 text-xs sm:text-sm"
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
