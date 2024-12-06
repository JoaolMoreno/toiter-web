import { AppProps } from 'next/app';
import { ThemeProvider } from 'styled-components';
import {AuthProvider} from '@/context/AuthContext';
import '../globals.css';

// Defina o tema global
const theme = {
    colors: {
        primary: '#2ecc71',
        secondary: '#27ae60',
        background: '#ecf0f1',
        text: '#2c3e50',
    },
};

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <AuthProvider>
            <ThemeProvider theme={theme}>
                <Component {...pageProps} />
            </ThemeProvider>
        </AuthProvider>
    );
}

export default MyApp;