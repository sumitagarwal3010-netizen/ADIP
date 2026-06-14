import { useEffect, useState, type ReactNode } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MicrosoftIcon from '@mui/icons-material/Microsoft';
import SecurityIcon from '@mui/icons-material/Security';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AUTH_PROVIDERS, MOCK_USERS } from '../data/authProviders';
import type { AuthProviderId } from '../types/auth';
import { colors } from '../theme/colors';
import { PERSONA_MAP } from '../config/personaConfig';

const PROVIDER_ICONS: Record<AuthProviderId, ReactNode> = {
  'azure-ad': <MicrosoftIcon sx={{ fontSize: 28 }} />,
  okta: <SecurityIcon sx={{ fontSize: 28 }} />,
  ping: <VpnKeyIcon sx={{ fontSize: 28 }} />,
};

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [providerId, setProviderId] = useState<AuthProviderId>('azure-ad');
  const [selectedUsername, setSelectedUsername] = useState(MOCK_USERS[0]?.username ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, from, navigate]);

  if (isAuthenticated) return null;

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await login(providerId, selectedUsername);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const selectedProvider = AUTH_PROVIDERS.find((p) => p.id === providerId);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `radial-gradient(ellipse at 20% 20%, ${colors.primary}18 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, ${colors.secondary}12 0%, transparent 50%), ${colors.bg.primary}`,
        p: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 920 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: colors.secondary,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1.5,
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 28, color: '#fff' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
            ADIP Enterprise Sign-In
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Mock OIDC providers — prepared for Azure AD Entra ID integration
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.06em', color: colors.text.muted, mb: 1, display: 'block' }}>
              IDENTITY PROVIDER
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {AUTH_PROVIDERS.map((provider) => (
                <Card
                  key={provider.id}
                  sx={{
                    bgcolor: providerId === provider.id ? `${colors.primary}12` : colors.bg.glass,
                    border: `1px solid ${providerId === provider.id ? colors.primary : colors.border.subtle}`,
                  }}
                >
                  <CardActionArea onClick={() => setProviderId(provider.id)}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5 }}>
                      <Box sx={{ color: providerId === provider.id ? colors.primary : colors.text.secondary }}>
                        {PROVIDER_ICONS[provider.id]}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{provider.label}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                          {provider.issuer}
                        </Typography>
                      </Box>
                      {provider.id === 'azure-ad' && (
                        <Chip label="Production path" size="small" sx={{ height: 20, fontSize: '0.58rem', bgcolor: `${colors.success}18`, color: colors.success }} />
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </Box>
            {selectedProvider && (
              <Alert severity="info" sx={{ mt: 1.5, fontSize: '0.75rem' }}>
                {selectedProvider.futureReady}
              </Alert>
            )}
          </Box>

          <Box
            sx={{
              bgcolor: colors.bg.glass,
              border: `1px solid ${colors.border.subtle}`,
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.06em', color: colors.text.muted, mb: 1, display: 'block' }}>
              MOCK DIRECTORY USER
            </Typography>
            <List dense sx={{ maxHeight: 320, overflow: 'auto', mb: 2 }}>
              {MOCK_USERS.map((user) => {
                const persona = PERSONA_MAP[user.persona];
                return (
                  <ListItemButton
                    key={user.user_id}
                    selected={selectedUsername === user.username}
                    onClick={() => setSelectedUsername(user.username)}
                    sx={{ borderRadius: 1, mb: 0.5 }}
                  >
                    <Avatar sx={{ width: 28, height: 28, mr: 1.5, bgcolor: colors.secondary, fontSize: '0.6rem' }}>
                      {persona.initials}
                    </Avatar>
                    <ListItemText
                      primary={`${user.display_name} (${user.username})`}
                      secondary={`${user.role} · ${user.department}`}
                      sx={{
                        '& .MuiListItemText-primary': { fontSize: '0.78rem', fontWeight: 600 },
                        '& .MuiListItemText-secondary': { fontSize: '0.65rem' },
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
            <Divider sx={{ mb: 2 }} />
            {error && <Alert severity="error" sx={{ mb: 1.5, fontSize: '0.75rem' }}>{error}</Alert>}
            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !selectedUsername}
              onClick={handleLogin}
              sx={{ fontWeight: 700, textTransform: 'none' }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : `Sign in with ${selectedProvider?.label}`}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
