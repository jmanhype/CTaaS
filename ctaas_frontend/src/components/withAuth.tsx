"use client";
import React, { ComponentType, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";

interface WithAuthProps {
  // You can add any props that your HOC might pass down
}

const withAuth = <P extends object>(
  WrappedComponent: ComponentType<P>,
  allowedRoles?: string[] // Optional: Specify roles allowed to access this component
) => {
  const ComponentWithAuth = (props: P & WithAuthProps) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.replace("/login"); // Redirect to login if not authenticated
        } else if (allowedRoles && allowedRoles.length > 0 && user) {
          // Check roles if specified
          const userHasRequiredRole = user.roles.some(role => allowedRoles.includes(role));
          if (!userHasRequiredRole) {
            // Redirect to an unauthorized page or dashboard if role not permitted
            // For simplicity, redirecting to home. In a real app, show an "Unauthorized" message or page.
            console.warn(`User ${user.username} does not have required roles: ${allowedRoles.join(", ")}. Current roles: ${user.roles.join(", ")}`);
            router.replace("/"); 
          }
        }
      }
    }, [isAuthenticated, user, isLoading, router, allowedRoles]);

    // Show a loading state while auth status is being determined
    if (isLoading || (!isAuthenticated && pathname !== "/login")) { // Use pathname from usePathname
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <p className="text-gray-700 dark:text-gray-300">Loading authentication status...</p>
          {/* You can add a spinner component here */}
        </div>
      );
    }

    // If authenticated and (no roles specified OR user has required role), render the component
    if (isAuthenticated) {
        if (!allowedRoles || allowedRoles.length === 0 || (user && user.roles.some(role => allowedRoles.includes(role)))) {
            return <WrappedComponent {...props} />;
        }
        // If roles are specified but user doesn't have them, they would have been redirected.
        // This return is a fallback, ideally the redirect handles it.
        return null; 
    }
    
    // If not authenticated and not loading, user will be redirected by useEffect.
    // Return null or a loading indicator to prevent rendering the wrapped component prematurely.
    return null;
  };

  // Set a display name for easier debugging
  const displayName = WrappedComponent.displayName || WrappedComponent.name || "Component";
  ComponentWithAuth.displayName = `withAuth(${displayName})`;

  return ComponentWithAuth;
};

export default withAuth;

