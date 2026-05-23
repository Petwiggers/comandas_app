import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { TextField, Button, Box, MenuItem, CircularProgress, Typography } from '@mui/material';
import PageLayout from "../components/common/PageLayout";
import { useValidationRules } from '../hooks/useValidationRules';
import useMasks from '../hooks/useMasks';
import { funcionarioService } from '../services/funcionarioService';
import showSnackbar from '../utils/snackbar';
import { InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const FuncionarioForm = () => {

    const [showPassword, setShowPassword] = useState(false);
    const { id, opr } = useParams();
    const navigate = useNavigate();

    const { applyCpfMask, cleanCpf, applyPhoneMask, cleanPhone } = useMasks();
    const { control, handleSubmit, formState: { errors, dirtyFields }, reset } = useForm();
    const validationRules = useValidationRules();

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    const isReadOnly = opr === 'view';
    const title = opr === 'view'
        ? `Visualizar Funcionário: ${id}`
        : id
            ? `Editar Funcionário: ${id}`
            : 'Novo Funcionário';

    const grupos = [
        { value: 1, label: 'Administrador' },
        { value: 2, label: 'Balcão' },
        { value: 3, label: 'Caixa' },
    ];

    const handleCancel = () => navigate('/funcionarios');

    // Carrega dados para edição/visualização
    useEffect(() => {
        const loadFuncionario = async () => {
            if (id) {
                try {
                    setLoadingData(true);
                    const data = await funcionarioService.getById(id);
                    reset(data);
                } catch (error) {
                    showSnackbar('Erro ao carregar funcionário', 'error');
                    navigate('/funcionarios');
                } finally {
                    setLoadingData(false);
                }
            } else {
                setLoadingData(false);
            }
        };
        loadFuncionario();
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

                retorno = await funcionarioService.update(id, changedData);
                showSnackbar('Funcionário atualizado com sucesso!', 'success');
            } else {
                retorno = await funcionarioService.create(data);
                showSnackbar('Funcionário criado com sucesso!', 'success');
            }

            if (!retorno?.id) {
                throw new Error(retorno?.detail || 'Erro ao salvar funcionário.');
            }

            navigate('/funcionarios');
        } catch (error) {
            const mensagem = error.apiMessage || 'Erro ao salvar funcionário';
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
                        name="matricula" control={control} defaultValue=""
                        rules={validationRules.matricula}
                        render={({ field }) => (
                            <TextField
                                {...field} label="Matrícula" fullWidth margin="normal"
                                disabled={isReadOnly}
                                error={!!errors.matricula}
                                helperText={errors.matricula?.message}
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
                                slotProps={{ maxLength: 14 }}
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
                                slotProps={{ maxLength: 18 }}
                            />
                        )}
                    />

                    <Controller
                        name="grupo" control={control} defaultValue=""
                        rules={validationRules.grupo}
                        render={({ field }) => (
                            <TextField
                                {...field} select label="Grupo" fullWidth margin="normal"
                                disabled={isReadOnly}
                                error={!!errors.grupo}
                                helperText={errors.grupo?.message}
                            >
                                {grupos.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                    />

                    <Controller
                        name="senha" control={control} defaultValue=""
                        rules={validationRules.senha}
                        render={({ field }) => (
                            <TextField
                                {...field} label="Senha" fullWidth margin="normal"
                                type={showPassword ? "text" : "password"}
                                disabled={isReadOnly}
                                error={!!errors.senha}
                                helperText={errors.senha?.message}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPassword(prev => !prev)} edge="end">
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }
                                }}
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

export default FuncionarioForm;