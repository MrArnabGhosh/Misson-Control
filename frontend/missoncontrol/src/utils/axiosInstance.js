import axios from "axios";
import { BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor: Attaches authentication token to outgoing requests
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    // Do something with request error
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Handles global responses and errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    console.error("Response error:", error.response || error); // Log full error response for debugging

    // Handle common errors globally
    if (error.response) {
      if (error.response.status === 401) {
        // Handle Unauthorized errors (e.g., token expired or invalid)
        console.warn("Unauthorized request (401). Allowing UserContext to handle redirection.");

        // IMPORTANT: DO NOT redirect with window.location.href here.
        // Let the component (UserProvider's fetchUser) handle the state update
        // and React Router's Navigate component will manage the redirection.

        // a global side-effect of any 401, regardless of the component.
        localStorage.removeItem("token");
        // No need for isRedirecting or cooldown flags here, as React Router's
        // Navigate component handles history and prevents duplicate pushes automatically.

      } else if (error.response.status === 403) {
        // Handle Forbidden errors (e.g., user doesn't have permission)
        console.error("Forbidden (403): You don't have permission to access this resource.");
        // Optionally redirect to an access denied page or show a specific message
        // by throwing the error as done below.
      } else if (error.response.status === 500) {
        // Handle Server errors
        console.error("Server error (500). Please try again later.", error.response.data);
      } else {
        // Handle other HTTP errors
        console.error(`HTTP Error ${error.response.status}:`, error.response.data);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received from server. Network error or CORS issue.", error.request);
    } else if (error.code === "ECONNABORTED") {
      // Handle request timeout
      console.error("Request timeout. Please try again.");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error setting up request:", error.message);
    }
    // Re-throw the error so downstream code (e.g., UserContext's fetchUser) can handle it
    return Promise.reject(error);
  }
);

export default axiosInstance;
