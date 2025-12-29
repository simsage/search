// src/components/AutomaticLogin.tsx
import { useAuth } from 'react-oidc-context';
import { useEffect, ReactNode } from 'react';

export const OIDC_REDIRECT_STORAGE_KEY = 'search-oidc-query-string';

interface AutomaticLoginProps {
    children: ReactNode;
}

// This component will automatically redirect to the login page if the user is not authenticated.
export function AutomaticLogin({ children }: AutomaticLoginProps) {
    const auth = useAuth();

    useEffect(() => {
        // Check if the library is done loading and the user is not authenticated.
        // The `activeNavigator` check prevents a redirect loop during the login process.
        if (!auth.isLoading && !auth.isAuthenticated && !auth.activeNavigator) {
            auth.signinRedirect();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.isLoading, auth.isAuthenticated, auth.activeNavigator, auth.signinRedirect]);

    // While the authentication is loading or the user is not yet authenticated,
    // you can show a loading message or a splash screen.
    if (auth.isLoading || !auth.isAuthenticated) {
        return <div>Redirecting to login...</div>;
    }

    // Once authenticated, render the main application content.
    return <>{children}</>;
}