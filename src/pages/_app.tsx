import { AppProps } from 'next/app';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from '@/context/AuthContext';
import '../globals.css';
import { FeedProvider } from "@/context/FeedProvider";
import Layout from '@/components/layout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const theme = {
  colors: {
    primary: '#4CAF50',        // Darker mint green
    secondary: '#1B5E20',      // Very dark green
    accent: '#2196F3',         // Brighter blue
    background: '#121212',     // Dark background
    backgroundAlt: '#1E1E1E',  // Slightly lighter dark
    backgroundElevated: '#242424', // Elevated surfaces
    text: '#E0E0E0',          // Light text
    textLight: '#9E9E9E',     // Muted text
    border: '#333333',        // Dark borders
    buttonHover: '#388E3C',   // Button hover state
    error: '#CF6679',         // Error state
  },
  fontSizes: {
    small: '0.875rem',
    regular: '1rem',
    large: '1.25rem',
    xlarge: '1.5rem',
  },
};

function Toiter({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <FeedProvider>
          <Layout>
            <Component {...pageProps} />
            <ToastContainer />
          </Layout>
        </FeedProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default Toiter;
