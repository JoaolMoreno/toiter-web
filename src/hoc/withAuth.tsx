import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Head from 'next/head';

type WithAuthProps = {
    host?: string;
};

export async function getServerSideProps() {
    return {
        props: {
            host: process.env.NEXT_PUBLIC_HOST || '',
        },
    };
}

const withAuth = <P extends object>(
    WrappedComponent: React.ComponentType<P>
): React.FC<P & WithAuthProps> => {
    const RequiresAuth: React.FC<P & WithAuthProps> = (props) => {
        const { isAuthenticated } = useAuth();
        const router = useRouter();
        const isRootPath = router.pathname === '/';
        const host = props.host || process.env.NEXT_PUBLIC_HOST || '';

        React.useEffect(() => {
            console.log("Verificando autenticação no withAuth. Status:", isAuthenticated);

            if (isAuthenticated === false) {
                console.log("Usuário não autenticado. Redirecionando para login...");
                router.replace('/auth/login');
            } else if (isAuthenticated && isRootPath) {
                console.log("Usuário autenticado na rota raiz. Redirecionando para feed...");
                router.replace('/feed');
            }
        }, [isAuthenticated, router, isRootPath]);

        if (isAuthenticated === undefined) {
            console.log("Usuário não autenticado. Renderizando tela de carregamento.");
            return (
                <>
                    <Head>
                        <title>Toiter - Sua rede social</title>
                        <meta name="description" content="Compartilhe seus pensamentos em 280 caracteres" />
                        <meta property="og:title" content="Sua plataforma para compartilhar ideias, conectar com pessoas e fazer parte de uma comunidade única" />
                        <meta property="og:description" content="Compartilhe seus pensamentos em 280 caracteres" />
                        <meta property="og:type" content="website" />
                        <meta property="og:url" content={host} />
                        <meta property="og:site_name" content="Toiter" />
                        <meta property="og:locale" content="pt_BR" />
                        <meta property="og:image" content={`${host}/favicon.ico`} />
                        <meta property="og:image:width" content="200" />
                        <meta property="og:image:height" content="200" />
                    </Head>
                    <div>Carregando...</div>
                </>
            );
        }

        if (isAuthenticated && !isRootPath) {
            console.log("Usuário autenticado. Renderizando componente protegido.");
            return <WrappedComponent {...props} />;
        }

        return null;
    };

    RequiresAuth.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return RequiresAuth;
};

export default withAuth;
