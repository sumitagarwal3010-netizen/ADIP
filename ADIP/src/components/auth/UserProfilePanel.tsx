import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePersona } from '../../context/PersonaContext';
import { PERMISSION_CATALOG } from '../../data/rbacCatalog';
import { AUTH_PROVIDERS } from '../../data/authProviders';
import { colors } from '../../theme/colors';

interface UserProfilePanelProps {
  open: boolean;
  onClose: () => void;
}

export function UserProfilePanel({ open, onClose }: UserProfilePanelProps) {
  const { currentUser, currentPermissions, session, sessionExpiresAt, logout, refreshSessionToken } = useAuth();
  const { persona } = usePersona();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const provider = AUTH_PROVIDERS.find((p) => p.id === session?.providerId);
  const expiresLabel = sessionExpiresAt
    ? new Date(sessionExpiresAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '—';

  const permissionLabels = currentPermissions.map(
    (p) => PERMISSION_CATALOG.find((c) => c.id === p)?.label ?? p,
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: 380, bgcolor: colors.bg.tertiary, borderLeft: `1px solid ${colors.border.subtle}` } } }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>User Profile</Typography>
          <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: colors.secondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.9rem',
            }}
          >
            {persona.initials}
          </Box>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>{currentUser.display_name}</Typography>
            <Typography variant="caption" color="text.secondary">{currentUser.email}</Typography>
          </Box>
        </Box>

        <Section title="Identity">
          <Field label="User ID" value={currentUser.user_id} />
          <Field label="Username" value={currentUser.username} />
          <Field label="Department" value={currentUser.department} />
          <Field label="Provider" value={provider?.label ?? '—'} />
          <Field label="Session expires" value={expiresLabel} />
        </Section>

        <Section title="Role & Persona">
          <Field label="Enterprise role" value={currentUser.role} />
          <Field label="RBAC role" value={currentUser.rbacRole} />
          <Field label="Persona" value={`${persona.label} — ${persona.title}`} />
        </Section>

        <Section title="Groups">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {currentUser.groups.map((g) => (
              <Chip key={g} label={g} size="small" sx={{ fontSize: '0.65rem', height: 22 }} />
            ))}
          </Box>
        </Section>

        <Section title="Permissions">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {permissionLabels.map((p) => (
              <Chip key={p} label={p} size="small" variant="outlined" sx={{ fontSize: '0.62rem', height: 22 }} />
            ))}
          </Box>
        </Section>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={refreshSessionToken}
            sx={{ flex: 1, textTransform: 'none', fontSize: '0.75rem' }}
          >
            Refresh Session
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<LogoutIcon />}
            onClick={() => { logout(); onClose(); navigate('/login'); }}
            sx={{ flex: 1, textTransform: 'none', fontSize: '0.75rem' }}
          >
            Sign Out
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.05em', color: colors.text.muted, display: 'block', mb: 0.75 }}>
        {title.toUpperCase()}
      </Typography>
      {children}
    </Box>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <List dense disablePadding>
      <ListItem disablePadding sx={{ py: 0.25 }}>
        <ListItemText
          primary={label}
          secondary={value}
          sx={{
            '& .MuiListItemText-primary': { fontSize: '0.62rem', color: colors.text.muted },
            '& .MuiListItemText-secondary': { fontSize: '0.78rem', color: colors.text.primary },
          }}
        />
      </ListItem>
    </List>
  );
}
