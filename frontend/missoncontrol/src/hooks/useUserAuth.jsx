import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/userContext"; // Assuming the path to your UserContext

export const useUserAuth = () => {
  const { user, loading, clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    // If still loading user data, do nothing yet
    if (loading) return;

    // If user data is present (user is authenticated), do nothing
    if (user) return;

    // If no user is found and loading is complete, clear user data (if any stale)
    // and redirect to the login page
    if (!user) {
      clearUser(); // Ensures any partial or stale user state is cleared
      navigate("/login"); // Redirects to the login page
    }
  }, [user, loading, clearUser, navigate]); // Dependencies for useEffect
};