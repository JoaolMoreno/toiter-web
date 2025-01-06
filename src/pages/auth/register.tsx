import React from 'react';
import styled from 'styled-components';
import RegisterForm from '../../components/auth/RegisterForm';
import Head from 'next/head';

const RegisterPage = () => {
    return (
        <Container>
            <Head>
                <title>Crie sua Conta</title>
            </Head>
            <Title>Toiter</Title>
            <Subtitle>Crie sua conta</Subtitle>
            <RegisterForm/>
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
  font-size: ${({ theme }) => theme.fontSizes.large};
  margin-bottom: 16px;
`;

const Subtitle = styled.p`
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.regular};
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
