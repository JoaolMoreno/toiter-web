import React from 'react';
import styled from 'styled-components';
import LoginForm from '../../components/auth/LoginForm';

const LoginPage = () => {
    return (
        <Container>
            <head>
                <meta charSet="UTF-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <title>Login</title>
            </head>
            <Title>Toiter</Title>
            <Subtitle>Faça login na sua conta</Subtitle>
            <LoginForm/>
            <Redirect>
                Não tem uma conta? <a href="/auth/register">Registre-se</a>
            </Redirect>
        </Container>
    );
};

export default LoginPage;

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
