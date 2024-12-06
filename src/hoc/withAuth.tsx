import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

const withAuth = (WrappedComponent: React.FC) => {
    const RequiresAuth = (props: any) => {
        const { isAuthenticated } = useAuth();
        const router = useRouter();

        React.useEffect(() => {
            if (!isAuthenticated) {
                router.replace('/auth/login');
            }
        }, [isAuthenticated]);

        if (!isAuthenticated) {
            return null; // Enquanto verifica a autenticação, evita renderizar
        }

        return <WrappedComponent {...props} />;
    };

    return RequiresAuth;
};

export default withAuth;
