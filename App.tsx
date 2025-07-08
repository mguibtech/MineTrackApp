import { Router } from '@routes';
import { ThemeProvider } from '@shopify/restyle';
import { theme } from '@theme';



function App() {

  return (
    <ThemeProvider theme={theme}>
      <Router />
    </ThemeProvider>
  );
}


export default App;
