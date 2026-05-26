import { useState } from 'react';
import { Dialog, DialogContent, DialogActions, DialogTitle, Typography, Box } from '@mui/material';
import { Button } from '@mui/material';
const UniqueValidator = ({ open, onClose, existingRecord, recordType = '', onView, onEdit }) => {
    const handleCancel = () => {
        onClose();
        if (onClose.clearField) {
            onClose.clearField();
        }
    };
    const handleView = () => {
        onClose();
        if (onView && existingRecord) {
            onView(existingRecord);
        }
    };
    const handleEdit = () => {
        onClose();
        if (onEdit && existingRecord) {
            onEdit(existingRecord);
        }
    };

    // Renderizar o diálogo
    return (
        <Dialog open={open} onClose={handleCancel} aria-labelledby="unique-dialog-title" aria-describedby="unique-dialog-description" maxWidth="sm" fullWidth >
            <DialogTitle id="unique-dialog-title" sx={{ fontWeight: 600, color: 'white', backgroundColor: 'error.main', mb: 2 }}>Registro já existente em {recordType}</DialogTitle>
            <DialogContent id="unique-dialog-description">
                {existingRecord && (
                    <Box sx={{ p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
                        {existingRecord.id && (
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>ID: {existingRecord.id}</Typography>
                        )}
                        {existingRecord.nome && (
                            <Typography variant="subtitle2" sx={{ fontWeight: 500, mt: 1 }}>Nome: {existingRecord.nome}</Typography>
                        )}
                        {existingRecord.cpf && (
                            <Typography variant="body2" color="text.secondary">CPF: {existingRecord.cpf}</Typography>
                        )}
                        {existingRecord.matricula && (
                            <Typography variant="body2" color="text.secondary">Matrícula: {existingRecord.matricula}</Typography>
                        )}
                        {existingRecord.telefone && (
                            <Typography variant="body2" color="text.secondary">Telefone: {existingRecord.telefone}</Typography>
                        )}
                        {existingRecord.grupo && (
                            <Typography variant="body2" color="text.secondary">Grupo: {existingRecord.grupo}</Typography>
                        )}
                        {existingRecord.descricao && (
                            <Typography variant="body2" color="text.secondary">Descrição: {existingRecord.descricao}</Typography>
                        )}
                        {existingRecord.valor_unitario && (
                            <Typography variant="body2" color="text.secondary">Valor Unitário: R$ {Number(existingRecord.valor_unitario).toFixed(2)}</Typography>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel}>
                    Cancelar
                </Button>
                <Button onClick={handleView} variant="outlined">
                    Visualizar Dados
                </Button>
                <Button onClick={handleEdit} variant="contained">
                    Editar Dados
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Hook para validação de campo genérico reutilizável

export const useFieldValidation = (service, currentId = null, validationMethod = 'checkCpfExists') => {
    const [dialog, setDialog] = useState({ open: false, record: null });
    const validateField = async (fieldValue) => {
        if (!fieldValue) return; // Não validar se campo estiver vazio
        try {
            const existingRecord = await service[validationMethod](fieldValue, currentId);
            if (existingRecord) {
                // Campo já existe e não é do registro atual
                if (existingRecord.id.toString() !== currentId?.toString()) {
                    // Remover foco do elemento ativo antes de abrir diálogo
                    const activeElement = document.activeElement;
                    if (activeElement && activeElement.blur) {
                        activeElement.blur();
                    }
                    setDialog({
                        open: true,
                        record: existingRecord
                    });
                    // Mover foco para o primeiro botão do diálogo quando abrir
                    setTimeout(() => {
                        const firstButton = document.querySelector('[role="dialog"] button');
                        if (firstButton) {
                            firstButton.focus();
                        }
                    }, 100);
                }
            }
        } catch (error) {
            // Erro na validação, mas não bloquear o usuário
            console.error('Erro ao validar campo:', error);
        }
    };
    const closeDialog = () => {
        setDialog({ open: false, record: null });
    };
    const clearField = () => {
        // Será implementado no componente que usar o hook
        setDialog({ open: false, record: null });
    };
    return { dialog, validateField, closeDialog, clearField };
};

export default UniqueValidator;