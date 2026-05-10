import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageLayout from "../components/common/PageLayout";
import { useValidationRules } from '../hooks/useValidationRules';
import useMasks  from '../hooks/useMasks';

const ClienteForm = () => {
    const { applyCpfMask, cleanCpf, applyPhoneMask, cleanPhone } = useMasks();
    const { control, handleSubmit, formState: { errors } } = useForm();
    const validationRules = useValidationRules();
    const navigate = useNavigate();

    const onSubmit = (data) => {
        console.log("Dados do cliente:", data);
    };

    const handleCancel = () => {
        navigate('/clientes');
    };

    return (
        <PageLayout title="Dados Cliente">
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
                    name="cpf" control={control} defaultValue=""
                    rules={validationRules.cpf}
                    render={({ field }) => (
                        <TextField
                            {...field} label="CPF" fullWidth margin="normal"
                            error={!!errors.cpf}
                            helperText={errors.cpf?.message}
                            onChange={(e) => {
                                const value = cleanCpf(e.target.value);
                                field.onChange(value);
                            }}
                            value={field.value ? applyCpfMask(field.value) : ''}
                            inputprops={{ maxLength: 14 }} 
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
                            onChange={(e) => {
                                const value = cleanPhone(e.target.value);
                                field.onChange(value);
                            }}
                            value={field.value ? applyPhoneMask(field.value) : ''}
                            inputprops={{ maxLength: 18 }}
                        />
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

export default ClienteForm;