import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { theme } from './theme/theme';
import { AppRoutes } from './routes';
import { SimulationProvider } from './context/SimulationContext';
import { PersonaProvider } from './context/PersonaContext';
import { AbacProvider } from './context/AbacContext';
import { AuthenticationProvider } from './context/AuthContext';
import { WorkflowProvider } from './context/WorkflowContext';
import { NotificationProvider } from './context/NotificationContext';
import { StorageProvider } from './context/PersistenceContext';
import { EventProvider } from './context/EventContext';
import { RootErrorBoundary } from './components/common/RootErrorBoundary';

function App() {
  return (
    <RootErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthenticationProvider>
          <StorageProvider>
            <PersonaProvider>
              <AbacProvider>
              <EventProvider>
                <WorkflowProvider>
                  <NotificationProvider>
                    <SimulationProvider>
                      <BrowserRouter>
                        <AppRoutes />
                      </BrowserRouter>
                    </SimulationProvider>
                  </NotificationProvider>
                </WorkflowProvider>
              </EventProvider>
              </AbacProvider>
            </PersonaProvider>
          </StorageProvider>
        </AuthenticationProvider>
      </ThemeProvider>
    </RootErrorBoundary>
  );
}

export default App;
