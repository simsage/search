// src/components/SessionManager.tsx
import { useEffect, ReactNode } from 'react';
import { useAuth } from 'react-oidc-context';
import { useDispatch } from 'react-redux';
import { simsage_sign_in } from "./reducers/authSlice";
import { AppDispatch } from './store';

interface SessionManagerProps {
    children: ReactNode;
}

export function SessionManager({ children }: SessionManagerProps) {
    const auth = useAuth();
    const dispatch = useDispatch<AppDispatch>(); // Typed dispatch

    useEffect(() => {
        if (auth.isAuthenticated && auth.user && auth.user.access_token) {
            // When an OIDC user is loaded, dispatch the sign-in action to Redux
            console.log('SimSage Signing in');
            dispatch(simsage_sign_in({
                id_token: auth.user?.access_token
            }));
        }
    }, [auth.isAuthenticated, auth.user, dispatch]); // Dependency array

    return <>{children}</>;
}
