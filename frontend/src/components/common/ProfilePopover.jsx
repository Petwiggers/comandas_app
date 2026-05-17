import { Box, Typography, Popover, Avatar, Divider, Button, Stack, Chip } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';

const ProfilePopover = ({ anchorEl, onClose, user, onLogout }) => {
    const open = Boolean(anchorEl);
    const id = open ? 'profile-popover' : undefined;
    const displayName = user?.nome || user?.name || 'Usuário';
    const cpf = user?.cpf || user?.documento || '';
    const matricula = user?.matricula || user?.registration || '';
    const role = user?.perfil || user?.role || user?.tipo || '';

    const initials = displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'U';

    const avatarSrc = user?.foto || user?.avatar || user?.imagem || '';

    return (
        <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ sx: { p: 2, width: 340, minWidth: 300, borderRadius: 2, boxShadow: 6, bgcolor: 'background.paper'} }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, pr: 1, pl: 1 , mt:1}}>
                <Avatar sx={{ bgcolor: '#f59e0b', width: 56, height: 56 }} src={avatarSrc}>
                    {!avatarSrc && initials}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1 }}>
                        {displayName}
                    </Typography>
                    {role && (
                        <Chip
                            label={role}
                            size="small"
                            sx={{ mt: 0.5, px: 1, fontWeight: 700, bgcolor: 'primary.dark', color: 'common.white', height: 26 }}
                        />
                    )}
                </Box>
            </Box>

            <Divider sx={{ my: 1 }} />

            <Stack spacing={1} sx={{ mb: 1, pr: 1, pl: 1, '& > div': { pr: 1, py: 0.5 } }}>
                {cpf && (
                    <Box>
                        <Typography variant="caption" color="text.secondary">
                            CPF
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {cpf}
                        </Typography>
                    </Box>
                )}
                {matricula && (
                    <Box>
                        <Typography variant="caption" color="text.secondary">
                            Matrícula
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {matricula}
                        </Typography>
                    </Box>
                )}
            </Stack>

            <Button
                fullWidth
                variant="outlined"
                color="error"
                onClick={() => {
                    if (onLogout) onLogout();
                    onClose();
                }}
                sx={{ mt: 1, borderWidth: 1, textTransform: 'none', fontWeight: 700, py: 1.1 }}
            >
                Sair
            </Button>
        </Popover>
    );
};

export default ProfilePopover;
