import React, { useState } from 'react';
import api from '../../services/api';
import { useRouter } from 'next/router';

const RegisterForm = () => {
    const [username, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', { username, email, password });
            alert('Cadastro bem-sucedido!');
            router.push('/auth/login');
        } catch (err: any) {
            const errorMessage = err.response?.data || 'Erro ao registrar';

            console.error('Erro ao registrar:', errorMessage);

            setError(errorMessage);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <input
                type="text"
                placeholder="Nome"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Registrar</button>
        </form>
    );
};

export default RegisterForm;