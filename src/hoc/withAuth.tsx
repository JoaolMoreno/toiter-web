import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>): React.FC<P> => {
    const RequiresAuth: React.FC<P> = (props) => {
        const { isAuthenticated } = useAuth();
        const router = useRouter();

        React.useEffect(() => {
            console.log("Verificando autenticação no withAuth. Status:", isAuthenticated);
            if (isAuthenticated === false) {
                console.log("Usuário não autenticado. Redirecionando para login...");
                router.replace('/auth/login');
            }
        }, [isAuthenticated, router]);

        if (isAuthenticated === undefined) {
            console.log("Autenticação pendente...");
            return <div>Carregando...</div>;
        }

        if (isAuthenticated) {
            console.log("Usuário autenticado. Renderizando componente protegido.");
            return <WrappedComponent {...props} />;
        }

        return null;
    };

    RequiresAuth.displayName = `withAuth(${
        WrappedComponent.displayName || WrappedComponent.name || 'Component'
    })`;

    return RequiresAuth;
};

export default withAuth;
