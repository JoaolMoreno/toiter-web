import { useRouter } from 'next/router';
import { useEffect } from 'react';

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/feed'); // Redireciona para a página do feed
  }, [router]);

  return null; // Não exibe nada, apenas redireciona
};

export default Home;
