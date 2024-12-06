import React from 'react';
import styled from 'styled-components';
import RegisterForm from '../../components/auth/RegisterForm';

const RegisterPage = () => {
    return (
        <Container>
            <Title>Toiter</Title>
            <Subtitle>Crie sua conta</Subtitle>
            <RegisterForm />
            <Redirect>
                Já tem uma conta? <a href="/auth/login">Faça login</a>
            </Redirect>
        </Container>
    );
};

export default RegisterPage;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
`;

const Subtitle = styled.p`
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors.text};
`;

const Redirect = styled.p`
  margin-top: 20px;
  color: ${({ theme }) => theme.colors.text};
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    font-weight: bold;
  }
`;
