import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import PasswordInput from './PasswordImput';
import api from '@/services/api';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 300px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.regular};
  margin: 0;
  height: 44px;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: none;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: ${({ theme }) => theme.fontSizes.regular};
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.small};
  text-align: center;
`;

const RegisterForm = () => {
    const router = useRouter();
    const [username, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

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
        <Form onSubmit={handleSubmit}>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <Input
                type="text"
                placeholder="Nome"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
            />
            <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
            />
            <Button type="submit">Registrar</Button>
        </Form>
    );
};

export default RegisterForm;