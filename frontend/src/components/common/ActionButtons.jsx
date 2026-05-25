import { Box, IconButton } from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';
const ActionButtons = ({ item, onView, onEdit, onDelete, disabled, children }) => (
  <Box sx={{ display: 'flex', gap: 1 }}>
    {onView && (
      <IconButton
        size="small"
        color="primary"
        sx={{ width: 40, height: 40, '&:hover': { backgroundColor: 'primary.light', color: 'white' } }}
        title="Visualizar"
        onClick={() => onView(item)}
        disabled={disabled}
      >
        <Visibility fontSize="small" />
      </IconButton>
    )}
    {onEdit && (
      <IconButton
        size="small"
        color="secondary"
        sx={{ width: 40, height: 40, '&:hover': { backgroundColor: 'secondary.light', color: 'white' } }}
        title="Editar"
        onClick={() => onEdit(item)}
        disabled={disabled}
      >
        <Edit fontSize="small" />
      </IconButton>
    )}
    {onDelete && (
      <IconButton
        size="small"
        color="error"
        sx={{ width: 40, height: 40, '&:hover': { backgroundColor: 'error.light', color: 'white' } }}
        title="Excluir"
        onClick={() => onDelete(item)}
        disabled={disabled}
      >
        <Delete fontSize="small" />
      </IconButton>
    )}
    {children}
  </Box>
);
export default ActionButtons;