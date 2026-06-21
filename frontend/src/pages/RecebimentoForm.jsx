import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { TextField, Button, Box, MenuItem } from '@mui/material';
import PageLayout from '../components/common/PageLayout';
import { recebimentoService } from '../services/recebimentoService';
import { clienteService } from '../services/clienteService';
import showSnackbar from '../utils/snackbar';

function RecebimentoForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const recebimento = location.state?.recebimento;

    const { control, handleSubmit, watch, formState: { errors } } = useForm({
        mode: 'onBlur',
        defaultValues: {
            cliente_id: recebimento?.cliente_id ?? '',
            desconto_total: recebimento?.desconto_total ?? 0,
            acrescimo_total: recebimento?.acrescimo_total ?? 0,
        },
    });

    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(false);

    const desconto = watch('desconto_total', recebimento?.desconto_total ?? 0);
    const acrescimo = watch('acrescimo_total', recebimento?.acrescimo_total ?? 0);
    const subtotal = recebimento?.subtotal_geral ?? 0;
    const valorFinal = subtotal - Number(desconto) + Number(acrescimo);

    useEffect(() => {
        if (!recebimento) {
            showSnackbar('Dados do recebimento não encontrados. Acesse pela listagem.', 'error');
            navigate('/recebimentos');
            return;
        }
        clienteService.list({ limit: 1000 })
            .then(data => setClientes(data))
            .catch(() => showSnackbar('Erro ao carregar clientes', 'error'));
    }, []);

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            await recebimentoService.update(id, {
                cliente_id: data.cliente_id !== '' ? Number(data.cliente_id) : null,
                desconto_total: Number(data.desconto_total),
                acrescimo_total: Number(data.acrescimo_total),
            });
            showSnackbar('Recebimento atualizado com sucesso!', 'success');
            navigate('/recebimentos');
        } catch (error) {
            showSnackbar(error.apiMessage || 'Erro ao atualizar recebimento', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!recebimento) return null;

    return (
        <PageLayout title={`Editar Recebimento #${id}`}>
            <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{ maxWidth: 560, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}
            >
                {/* Campos somente leitura */}
                <TextField
                    label="Data/Hora"
                    value={new Date(recebimento.data_hora).toLocaleString('pt-BR')}
                    disabled
                    fullWidth
                />
                <TextField
                    label="Funcionário"
                    value={recebimento.funcionario_nome}
                    disabled
                    fullWidth
                />
                <TextField
                    label="Subtotal Geral (R$)"
                    value={Number(subtotal).toFixed(2)}
                    disabled
                    fullWidth
                />

                {/* Seleção de cliente */}
                <Controller
                    name="cliente_id"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            select
                            label="Cliente (opcional)"
                            fullWidth
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value)}
                        >
                            <MenuItem value="">Nenhum cliente</MenuItem>
                            {clientes.map(c => (
                                <MenuItem key={c.id} value={c.id}>
                                    {c.nome}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                />

                {/* Desconto */}
                <Controller
                    name="desconto_total"
                    control={control}
                    rules={{ min: { value: 0, message: 'Desconto não pode ser negativo' } }}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Desconto (R$)"
                            type="number"
                            fullWidth
                            inputProps={{ step: '0.01', min: '0' }}
                            error={!!errors.desconto_total}
                            helperText={errors.desconto_total?.message}
                        />
                    )}
                />

                {/* Acréscimo */}
                <Controller
                    name="acrescimo_total"
                    control={control}
                    rules={{ min: { value: 0, message: 'Acréscimo não pode ser negativo' } }}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Acréscimo (R$)"
                            type="number"
                            fullWidth
                            inputProps={{ step: '0.01', min: '0' }}
                            error={!!errors.acrescimo_total}
                            helperText={errors.acrescimo_total?.message}
                        />
                    )}
                />

                {/* Valor final calculado */}
                <TextField
                    label="Valor Final (R$)"
                    value={valorFinal.toFixed(2)}
                    disabled
                    fullWidth
                    InputProps={{ sx: { fontWeight: 700 } }}
                />

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 1 }}>
                    <Button variant="outlined" onClick={() => navigate('/recebimentos')}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar'}
                    </Button>
                </Box>
            </Box>
        </PageLayout>
    );
}

export default RecebimentoForm;
