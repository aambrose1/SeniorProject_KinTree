import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '../../CurrentUserProvider';

function ProtectedRoute({ children }) {
    const { supabaseUser, loading } = useCurrentUser();

    if (loading) {
        return <div>Loading...</div>;
    }

    // redirect to login
    if (!supabaseUser) {
        return <Navigate to="/login" replace />;
    }

    // if logged in, render the protected page
    return children;
}

export default ProtectedRoute;