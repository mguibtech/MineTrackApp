import { Router } from '@routes';
import { ThemeProvider } from '@shopify/restyle';
import { theme } from '@theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SplashScreenProvider } from '@components';

const queryClient = new QueryClient();

function App() {
  return (
    <SplashScreenProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <Router />
        </ThemeProvider>
      </QueryClientProvider>
    </SplashScreenProvider>
  );
}

export default App;