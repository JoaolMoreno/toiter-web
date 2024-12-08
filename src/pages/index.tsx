import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import withAuth from "@/hoc/withAuth";

const Home = () => {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/feed');
        } else {
            router.replace('/auth/login');
        }
    }, [isAuthenticated]);

    return <div>Carregando...</div>;
};

export default withAuth(Home);
