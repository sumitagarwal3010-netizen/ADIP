import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { theme } from './theme/theme';
import { AppRoutes } from './routes';
import { SimulationProvider } from './context/SimulationContext';
import { RootErrorBoundary } from './components/common/RootErrorBoundary';

function App() {
  return (
    <RootErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SimulationProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </SimulationProvider>
      </ThemeProvider>
    </RootErrorBoundary>
  );
}

export default App;
