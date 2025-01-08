import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styled from 'styled-components';
import PasswordInput from './PasswordImput';
import { motion } from 'framer-motion';

const LoginForm = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(email, password);
        } catch (error) {
            console.error('Erro ao fazer login:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Input
                type="text"
                placeholder="Email ou Username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
            />
            <Button
                type="submit"
                as={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={isLoading ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
                disabled={isLoading}
                isLoading={isLoading}
            >
                {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
        </Form>
    );
};

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

const Button = styled(motion.button)<{ isLoading: boolean }>`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: none;
  background-color: ${({ theme, isLoading }) => isLoading ? theme.colors.secondary : theme.colors.primary};
  color: white;
  font-size: ${({ theme }) => theme.fontSizes.regular};
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

export default LoginForm;