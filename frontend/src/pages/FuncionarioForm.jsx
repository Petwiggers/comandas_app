import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Box, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageLayout from "../components/common/PageLayout";
import { useValidationRules } from '../hooks/useValidationRules';

const FuncionarioForm = () => {
    const { control, handleSubmit, formState: { errors } } = useForm();
    const validationRules = useValidationRules();
    const navigate = useNavigate();

    const onSubmit = (data) => {
        console.log("Dados do funcionário:", data);
    };

    const handleCancel = () => {
        navigate('/funcionarios');
    };

    // Grupos de exemplo para o Select
    const grupos = [
        { value: 1, label: 'Administrador' },
        { value: 2, label: 'Atendente' },
        { value: 3, label: 'Cozinha' }
    ];

    return (
        <PageLayout title="Dados Funcionário">
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <Controller
                    name="nome" control={control} defaultValue=""
                    rules={validationRules.nome}
                    render={({ field }) => (
                        <TextField
                            {...field} label="Nome" fullWidth margin="normal"
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
                            error={!!errors.cpf}
                            helperText={errors.cpf?.message}
                        />
                    )}
                />

                <Controller
                    name="telefone" control={control} defaultValue=""
                    rules={validationRules.telefone}
                    render={({ field }) => (
                        <TextField
                            {...field} label="Telefone" fullWidth margin="normal"
                            error={!!errors.telefone}
                            helperText={errors.telefone?.message}
                        />
                    )}
                />

                <Controller
                    name="grupo" control={control} defaultValue=""
                    rules={validationRules.grupo}
                    render={({ field }) => (
                        <TextField
                            {...field} select label="Grupo" fullWidth margin="normal"
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

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button sx={{ mr: 1 }} onClick={handleCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="contained">
                        Cadastrar
                    </Button>
                </Box>
            </Box>
        </PageLayout>
    );
};

export default FuncionarioForm;