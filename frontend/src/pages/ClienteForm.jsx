import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { TextField, Button, Box, CircularProgress, Typography } from '@mui/material';
import PageLayout from "../components/common/PageLayout";
import { useValidationRules } from '../hooks/useValidationRules';
import useMasks from '../hooks/useMasks';
import { clienteService } from '../services/clienteService';
import showSnackbar from '../utils/snackbar';

const ClienteForm = () => {
    const { id, opr } = useParams();
    const navigate = useNavigate();

    const { applyCpfMask, cleanCpf, applyPhoneMask, cleanPhone } = useMasks();
    const { control, handleSubmit, formState: { errors, dirtyFields }, reset } = useForm();
    const validationRules = useValidationRules();

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    const isReadOnly = opr === 'view';
    const title = opr === 'view'
        ? `Visualizar Cliente: ${id}`
        : id
            ? `Editar Cliente: ${id}`
            : 'Novo Cliente';

    const handleCancel = () => navigate('/clientes');

    // Carrega dados para edição/visualização
    useEffect(() => {
        const loadCliente = async () => {
            if (id) {
                try {
                    setLoadingData(true);
                    const data = await clienteService.getById(id);
                    reset(data);
                } catch (error) {
                    showSnackbar('Erro ao carregar cliente', 'error');
                    navigate('/clientes');
                } finally {
                    setLoadingData(false);
                }
            } else {
                setLoadingData(false);
            }
        };
        loadCliente();
    }, [id, navigate]);

    const onSubmit = async (data) => {
        try {
            setLoading(true);

            let retorno;
            if (id) {
                // Envia apenas os campos alterados
                const changedData = {};
                Object.keys(dirtyFields).forEach(key => {
                    if (dirtyFields[key]) {
                        changedData[key] = data[key];
                    }
                });

                if (Object.keys(changedData).length === 0) {
                    showSnackbar('Nenhuma alteração detectada', 'info');
                    return;
                }

                retorno = await clienteService.update(id, changedData);
                showSnackbar('Cliente atualizado com sucesso!', 'success');
            } else {
                retorno = await clienteService.create(data);
                showSnackbar('Cliente criado com sucesso!', 'success');
            }

            if (!retorno?.id) {
                throw new Error(retorno?.detail || 'Erro ao salvar cliente.');
            }

            navigate('/clientes');
        } catch (error) {
            const mensagem = error.apiMessage || 'Erro ao salvar cliente';
            showSnackbar(mensagem, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageLayout title={title}>
            {loadingData ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    {isReadOnly && (
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Todos os campos estão em modo somente leitura.
                        </Typography>
                    )}

                    <Controller
                        name="nome" control={control} defaultValue=""
                        rules={validationRules.nome}
                        render={({ field }) => (
                            <TextField
                                {...field} label="Nome" fullWidth margin="normal"
                                disabled={isReadOnly}
                                error={!!errors.nome}
                                helperText={errors.nome?.message}
                            />
                        )}
                    />

                    <Controller
                        name="cpf" control={control} defaultValue=""
                        rules={validationRules.cpf}
                        render={({ field }) => (
                            <TextField
                                {...field} label="CPF" fullWidth margin="normal"
                                disabled={isReadOnly}
                                error={!!errors.cpf}
                                helperText={errors.cpf?.message}
                                onChange={(e) => {
                                    const value = cleanCpf(e.target.value);
                                    field.onChange(value);
                                }}
                                value={field.value ? applyCpfMask(field.value) : ''}
                                slotProps={{ htmlInput: { maxLength: 14 } }}
                            />
                        )}
                    />

                    <Controller
                        name="telefone" control={control} defaultValue=""
                        rules={validationRules.telefone}
                        render={({ field }) => (
                            <TextField
                                {...field} label="Telefone" fullWidth margin="normal"
                                disabled={isReadOnly}
                                error={!!errors.telefone}
                                helperText={errors.telefone?.message}
                                onChange={(e) => {
                                    const value = cleanPhone(e.target.value);
                                    field.onChange(value);
                                }}
                                value={field.value ? applyPhoneMask(field.value) : ''}
                                slotProps={{ htmlInput: { maxLength: 15 } }}
                            />
                        )}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                        <Button sx={{ mr: 1 }} onClick={handleCancel} disabled={loading}>
                            Cancelar
                        </Button>
                        {!isReadOnly && (
                            <Button type="submit" variant="contained" disabled={loading}>
                                {loading ? 'Salvando...' : (id ? 'Atualizar' : 'Cadastrar')}
                            </Button>
                        )}
                    </Box>
                </Box>
            )}
        </PageLayout>
    );
};

export default ClienteForm;