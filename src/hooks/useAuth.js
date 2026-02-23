import { useUser } from "@clerk/clerk-react";

/**
 * Custom hook to access authenticated user data
 * Returns the Clerk user object and helper functions
 */
export const useAuth = () => {
  const { isLoaded, isSignedIn, user } = useUser();

  return {
    isLoaded,
    isSignedIn,
    user,
    userId: user?.id || null,
    userEmail: user?.primaryEmailAddress?.emailAddress || null,
    userName: user?.fullName || user?.firstName || "User",
    userAvatar: user?.imageUrl || null,
    regionId: user?.publicMetadata?.regionId || null,
    role: user?.publicMetadata?.role || "user", // "user", "admin", "super_admin"
  };
};
