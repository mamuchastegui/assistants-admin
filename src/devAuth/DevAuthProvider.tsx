import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { attachDevAuthInterceptor } from './interceptor.js';
import { apiClient } from '@/api/client';

interface DevAuthContextValue {
  token: string | null;
  getAccessTokenSilently: () => Promise<string>;
  loginWithRedirect: () => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  promptToken: () => void;
}

const DevAuthContext = createContext<DevAuthContextValue | null>(null);

export const useDevAuth = () => {
  const ctx = useContext(DevAuthContext);
  if (!ctx) throw new Error('useDevAuth must be used within DevAuthProvider');
  return ctx;
};

const shouldBypass =
  import.meta.env.DEV &&
  import.meta.env.VITE_SKIP_AUTH === 'true' &&
  (typeof window === 'undefined' ? false :
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'));

export const DevAuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  if (!shouldBypass) {
    throw new Error('DevAuthProvider should not be used when skip auth is disabled');
  }
  if (import.meta.env.PROD) {
    throw new Error('DevAuthProvider must never run in production');
  }

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('devAuthToken'));
  const [showPrompt, setShowPrompt] = useState(!token);
  const [inputValue, setInputValue] = useState('');

  const saveToken = (val: string) => {
    if (!val.trim()) return;
    localStorage.setItem('devAuthToken', val.trim());
    setToken(val.trim());
    setInputValue('');
    setShowPrompt(false);
  };

  const clearToken = () => {
    localStorage.removeItem('devAuthToken');
    setToken(null);
    setShowPrompt(true);
  };

  const getAccessTokenSilently = async () => {
    if (!token) {
      setShowPrompt(true);
      return '';
    }
    return token;
  };

  const loginWithRedirect = () => setShowPrompt(true);
  const logout = clearToken;
  const promptToken = () => setShowPrompt(true);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
      const t = localStorage.getItem('devAuthToken');
      if (!t) {
        setShowPrompt(true);
        return originalFetch(input, init);
      }
      const headers = new Headers(init.headers || {});
      headers.set('Authorization', `Bearer ${t}`);
      return originalFetch(input, { ...init, headers });
    };

    const id1 = attachDevAuthInterceptor(axios, () => localStorage.getItem('devAuthToken'), () => setShowPrompt(true));
    const id2 = attachDevAuthInterceptor(apiClient, () => localStorage.getItem('devAuthToken'), () => setShowPrompt(true));

    return () => {
      window.fetch = originalFetch;
      axios.interceptors.request.eject(id1);
      apiClient.interceptors.request.eject(id2);
    };
  }, []);

  return (
    <DevAuthContext.Provider value={{ token, getAccessTokenSilently, loginWithRedirect, logout, isAuthenticated: !!token, isLoading: false, promptToken }}>
      {children}
      <Dialog open={showPrompt} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Paste your JWT access token</DialogTitle>
          </DialogHeader>
          <Input value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Bearer token" />
          <div className="flex justify-end">
            <Button onClick={() => saveToken(inputValue)} disabled={!inputValue.trim()}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="fixed bottom-2 left-2 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">Dev Auth</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={promptToken}>Change token</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => { clearToken(); window.location.reload(); }}>Disable bypass</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </DevAuthContext.Provider>
  );
};
