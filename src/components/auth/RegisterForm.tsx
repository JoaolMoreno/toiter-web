import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import PasswordInput from './PasswordImput';
import api from '@/services/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

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

const RegisterForm = () => {
  const router = useRouter();
  const [username, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await api.post('/auth/register', { username, email, password });
      toast.success('Cadastro bem-sucedido!');
      router.push('/auth/login');
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.response) {
          if (error.response.status === 400) {
              toast.error(error.response.data || 'Erro ao fazer login');
          } else if (error.response.status >= 500 && error.response.status < 600) {
              toast.error('Servidor Indisponível, por favor tente mais tarde');
          } else {
              toast.error('Erro ao fazer login');
          }
      } else {
          toast.error('Erro ao fazer login');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
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
        {isLoading ? 'Registrando...' : 'Registrar'}
      </Button>
    </Form>
  );
};

export default RegisterForm;