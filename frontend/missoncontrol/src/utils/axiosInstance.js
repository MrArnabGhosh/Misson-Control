import axios from "axios";
// Assuming BASE_URL is correctly defined, e.g., in apiPaths.js
import { BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// A simple global flag to prevent multiple redirects
let isRedirecting = false;
// A timestamp to allow redirect after a certain delay if needed
let lastRedirectTime = 0;
const REDIRECT_COOLDOWN_MS = 2000; // 2 seconds cooldown before another redirect

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
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // console.error("Response error:", error.response || error); // Log full error response for debugging

    // Handle common errors globally
    if (error.response) {
      if (error.response.status === 401) {
        // Handle Unauthorized errors (e.g., token expired or invalid)
        console.warn("Unauthorized request (401). Redirecting to login...");

        // Prevent multiple redirects within a short period
        const now = Date.now();
        if (!isRedirecting || (now - lastRedirectTime > REDIRECT_COOLDOWN_MS)) {
          isRedirecting = true;
          lastRedirectTime = now;

          // Clear potentially invalid token
          localStorage.removeItem("token");
          // Optionally, clear other user-related data
          // localStorage.removeItem("user");

          // Redirect to login page
          window.location.href = "/login";

          // You might want to display a message to the user before redirecting
          // For example, using a custom modal or toast notification.
          // Example: showToast('Your session has expired. Please log in again.');
        } else {
            console.log("Already redirecting or too soon for another redirect. Suppressing duplicate redirect.");
        }
      } else if (error.response.status === 403) {
          // Handle Forbidden errors (e.g., user doesn't have permission)
          console.error("Forbidden (403): You don't have permission to access this resource.");
          // Optionally redirect to an access denied page or show a specific message
          // window.location.href = "/access-denied";
      } else if (error.response.status === 500) {
        // Handle Server errors
        console.error("Server error (500). Please try again later.", error.response.data);
      } else {
        // Handle other HTTP errors
        console.error(`HTTP Error ${error.response.status}:`, error.response.data);
      }
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an http.ClientRequest in node.js
      console.error("No response received from server. Network error or CORS issue.", error.request);
    } else if (error.code === "ECONNABORTED") {
      // Handle request timeout
      console.error("Request timeout. Please try again.");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error setting up request:", error.message);
    }
    return Promise.reject(error); // Re-throw the error so downstream code can handle it
  }
);

export default axiosInstance;