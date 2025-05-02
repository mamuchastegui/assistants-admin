
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

// Create an axios instance with base URL from environment variable
const createApiClient = () => {
  const baseURL = import.meta.env.VITE_API_URL || "https://api.condamind.com";
  
  const apiClient = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      "assistant-id": "asst_OS4bPZIMBpvpYo2GMkG0ast5"
    }
  });
  
  return apiClient;
};

// Create a basic client (without auth) that can be used directly
export const apiClient = createApiClient();

// Custom hook for authenticated API requests
export const useAuthApi = () => {
  const { getAccessTokenSilently } = useAuth0();
  
  const authApiClient = createApiClient();
  
  // Add an interceptor to include the authentication token in all requests
  authApiClient.interceptors.request.use(async (config) => {
    try {
      const token = await getAccessTokenSilently();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting access token:", error);
      // Continue with request without authentication header
    }
    return config;
  });
  
  return authApiClient;
};
