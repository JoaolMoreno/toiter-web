import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styled from 'styled-components';
import PasswordInput from './PasswordImput';

const LoginForm = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(email, password);
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
            <Button type="submit">Entrar</Button>
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
export default LoginForm;
