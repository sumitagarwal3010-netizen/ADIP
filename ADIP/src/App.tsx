import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { theme } from './theme/theme';
import { AppRoutes } from './routes';
import { SimulationProvider } from './context/SimulationContext';
import { PersonaProvider } from './context/PersonaContext';
import { AuthenticationProvider } from './context/AuthContext';
import { RootErrorBoundary } from './components/common/RootErrorBoundary';

function App() {
  return (
    <RootErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthenticationProvider>
          <PersonaProvider>
            <SimulationProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </SimulationProvider>
          </PersonaProvider>
        </AuthenticationProvider>
      </ThemeProvider>
    </RootErrorBoundary>
  );
}

export default App;
