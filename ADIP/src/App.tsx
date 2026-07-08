import { Suspense } from 'react';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { theme } from './theme/theme';
import { AppRoutes } from './routes';
import { SimulationProvider } from './context/SimulationContext';
import { ExplainabilityProvider } from './components/explainability/ExplainabilityProvider';
import { PersonaProvider } from './context/PersonaContext';
import { AbacProvider } from './context/AbacContext';
import { AuthenticationProvider } from './context/AuthContext';
import { WorkflowProvider } from './context/WorkflowContext';
import { NotificationProvider } from './context/NotificationContext';
import { StorageProvider } from './context/PersistenceContext';
import { EventProvider } from './context/EventContext';
import { CopilotProvider } from './context/CopilotContext';
import { ProductionIntelligenceProvider } from './context/ProductionIntelligenceContext';
import { KnowledgeCenterProvider } from './context/KnowledgeCenterContext';
import { ValueRealizationProvider } from './context/ValueRealizationContext';
import { PortfolioGovernanceProvider } from './context/PortfolioGovernanceContext';
import { ApplicationPortfolioProvider } from './context/ApplicationPortfolioContext';
import { ArchitectureRepositoryProvider } from './context/ArchitectureRepositoryContext';
import { TechnologyStrategyProvider } from './context/TechnologyStrategyContext';
import { TransformationPmoProvider } from './context/TransformationPmoContext';
import { EnterpriseRiskProvider } from './context/EnterpriseRiskContext';
import { ArtifactsProvider } from './context/ArtifactsContext';
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
              <CopilotProvider>
              <ProductionIntelligenceProvider>
              <KnowledgeCenterProvider>
              <ValueRealizationProvider>
              <PortfolioGovernanceProvider>
              <ApplicationPortfolioProvider>
              <ArchitectureRepositoryProvider>
              <TechnologyStrategyProvider>
              <TransformationPmoProvider>
              <EnterpriseRiskProvider>
              <ArtifactsProvider>
              <EventProvider>
                <WorkflowProvider>
                  <NotificationProvider>
                    <SimulationProvider>
                      <ExplainabilityProvider>
                        <BrowserRouter>
                          <Suspense
                            fallback={(
                              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
                                <CircularProgress size={32} />
                              </Box>
                            )}
                          >
                            <AppRoutes />
                          </Suspense>
                        </BrowserRouter>
                      </ExplainabilityProvider>
                    </SimulationProvider>
                  </NotificationProvider>
                </WorkflowProvider>
              </EventProvider>
              </ArtifactsProvider>
              </EnterpriseRiskProvider>
              </TransformationPmoProvider>
              </TechnologyStrategyProvider>
              </ArchitectureRepositoryProvider>
              </ApplicationPortfolioProvider>
              </PortfolioGovernanceProvider>
              </ValueRealizationProvider>
              </KnowledgeCenterProvider>
              </ProductionIntelligenceProvider>
              </CopilotProvider>
              </AbacProvider>
            </PersonaProvider>
          </StorageProvider>
        </AuthenticationProvider>
      </ThemeProvider>
    </RootErrorBoundary>
  );
}

export default App;
