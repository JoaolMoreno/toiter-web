import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

const withAuth = (WrappedComponent: React.FC) => {
    const RequiresAuth = (props: any) => {
        const { isAuthenticated } = useAuth();
        const router = useRouter();

        React.useEffect(() => {
            console.log("Verificando autenticação no withAuth. Status:", isAuthenticated);
            if (isAuthenticated === false) {
                console.log("Usuário não autenticado. Redirecionando para login...");
                router.replace('/auth/login');
            }
        }, [isAuthenticated]);

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

    return RequiresAuth;
};

export default withAuth;

