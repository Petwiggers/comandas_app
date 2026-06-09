import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { TextField, Button, Box, CircularProgress, Autocomplete } from '@mui/material';
import PageLayout from "../components/common/PageLayout";
import { useValidationRules } from '../hooks/useValidationRules';
import comandaService from '../services/comandaService';
import clienteService from '../services/clienteService';
import showSnackbar from '../utils/snackbar';
import { useAuth } from '../context/AuthContext';
import ComandaValidator, { useComandaValidation } from '../components/common/ComandaValidador'; 
// Definição do componente ComandaForm
const ComandaForm = () => {
    // Hooks de navegação e parâmetros
    const { id, opr } = useParams(); // Parâmetros da URL: id e operação (edit/view)
    const navigate = useNavigate(); // Navegação entre páginas
    // Hook de autenticação
    const { user } = useAuth(); // Dados do funcionário logado
    // Hook de formulário
    const { control, handleSubmit, formState: { errors, dirtyFields }, reset, setError, clearErrors, setValue } = useForm({
        defaultValues: {
            comanda: '',
            data_hora: new Date().toISOString().slice(0, 16),
            cliente_id: '',
            funcionario_id: user?.id || ''
        }
    });
    // Estados do componente
    const [loading, setLoading] = useState(false); // Estado de carregamento durante salvamento
    const [loadingData, setLoadingData] = useState(true); // Estado de carregamento de dados iniciais
    const [clienteOptions, setClienteOptions] = useState([]);
    const [clienteInput, setClienteInput] = useState('');
    const [loadingClientes, setLoadingClientes] = useState(false);
    const [selectedCliente, setSelectedCliente] = useState(null);
    // Configurações e validações
    const validationRules = useValidationRules(); // Regras de validação dos campos
    const isReadOnly = opr === 'view'; // Modo somente leitura para visualização
    const title = opr === 'view' ? `Visualizar Comanda: ${id}` : id ? `Editar Comanda: ${id}` : 'Nova Comanda'; // Título dinâmico

    // Hook de validação de comanda
    const { dialog: comandaDialog, validateComanda, closeDialog, clearField } = useComandaValidation(comandaService, id);

    // Buscar clientes conforme usuário digita (debounce curto)
    useEffect(() => {
        let active = true;
        const handler = setTimeout(async () => {
            if (!clienteInput || clienteInput.trim() === '') {
                setClienteOptions(selectedCliente ? [selectedCliente] : []);
                setLoadingClientes(false);
                return;
            }
            setLoadingClientes(true);
            try {
                const response = await clienteService.list({ nome: clienteInput, limit: 10 });
                const items = Array.isArray(response) ? response : (response?.items || []);
                if (active) {
                    const merged = selectedCliente
                        ? [selectedCliente, ...items.filter(item => item.id !== selectedCliente.id)]
                        : items;
                    setClienteOptions(merged);
                }
            } catch (error) {
                console.error('Erro ao buscar clientes:', error);
            } finally {
                if (active) setLoadingClientes(false);
            }
        }, 200);
        return () => {
            active = false;
            clearTimeout(handler);
        };
    }, [clienteInput, selectedCliente]);

    // Funções de tratamento do diálogo de comanda em uso
    const handleDialogCancel = () => {
        closeDialog();
        clearField();
        // Limpa o campo comanda
        reset(prev => ({ ...prev, comanda: '' }));
    };
    const handleDialogView = (comanda) => {
        closeDialog();
        navigate(`/comanda/view/${comanda.id}`);
    };
    const handleDialogEdit = (comanda) => {
        closeDialog();
        navigate(`/comanda/edit/${comanda.id}`);
    };
    const handleCancel = () => {
        navigate('/comandas');
    };

    // Carregar dados da comanda para edição/visualização
    useEffect(() => {
        const loadComanda = async () => {
            if (id && id !== 'new') {
                try {
                    const data = await comandaService.getById(id);
                    // Formatar data e hora para o formato do input datetime-local
                    if (data.data_hora) {
                        const dataAbertura = new Date(data.data_hora);
                        data.data_hora = dataAbertura.toISOString().slice(0, 16);
                    }
                    reset(data);
                    if (data.cliente) {
                        setSelectedCliente(data.cliente);
                        setClienteOptions([data.cliente]);
                        setClienteInput(data.cliente.nome || '');
                        setValue('cliente_id', data.cliente.id);
                    }
                } catch (error) {
                    const mensagem = error.apiMessage || 'Erro ao carregar comanda';
                    showSnackbar(mensagem, 'error');
                } finally {
                    setLoadingData(false);
                }
            } else {
                // Nova comanda - apenas limpar campos
                reset({
                    comanda: '',
                    cliente_id: ''
                });
                setLoadingData(false);
            }
        };
        loadComanda();
    }, [id, reset]);

    // Função de salvamento
    const onSubmit = async (data) => {
        setLoading(true);     
        try {
            // Definir status padrão como aberta (0)
            const comandaData = {
                comanda: data.comanda,
                data_hora: id && id !== 'new' ? data.data_hora : new Date().toISOString().slice(0, 16), // Usar data atual para novas comandas
                cliente_id: data.cliente_id || null, // Enviar null em vez de string vazia
                funcionario_id: id && id !== 'new' ? data.funcionario_id : user?.id || '', // Usar usuário logado para novas comandas
                status: 0 // Status: aberta
            };
            
            let savedComanda;
            if (id && id !== 'new') {
                // Atualizar comanda existente
                savedComanda = await comandaService.update(id, comandaData);
                showSnackbar('Comanda atualizada com sucesso!', 'success');
            } else {
                // Criar nova comanda
                savedComanda = await comandaService.create(comandaData);
                showSnackbar('Comanda aberta com sucesso!', 'success');
            }
            // Navegar para a lista de comandas
            navigate('/comandas');
        } catch (error) {
            const mensagem = error.apiMessage || 'Erro ao salvar comanda';
            console.error('Erro ao salvar comanda:', error);
            showSnackbar(mensagem, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Renderizar loading de dados
    if (loadingData) {
        return (
            <PageLayout title={title}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress />
                </Box>
            </PageLayout>
        );
    }

    // renderizar formulário - return
    return (
        <PageLayout title={title}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 600, mx: 'auto' }}>
                {/* Campo Número da Comanda */}
                <Controller
                    name="comanda"
                    control={control}
                    rules={{ required: validationRules.required, pattern: { value: /^[0-9]+$/, message: 'A comanda deve conter apenas números' } }}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            value={field.value || ''}
                            fullWidth
                            label="Comanda"
                            margin="normal"
                            error={!!errors.comanda}
                            helperText={errors.comanda?.message || 'Número da comanda deve ser único e estar disponível'}
                            disabled={loading || isReadOnly}
                            type="number"
                            onBlur={() => {
                                if (!isReadOnly) {
                                    // Só validar se for nova comanda ou se o valor foi alterado
                                    const isNovaComanda = !id || id === 'new';
                                    // Se não foi alterado, não validar
                                    if (isNovaComanda || dirtyFields.comanda) {
                                        validateComanda(field.value);
                                    }
                                }
                            }}
                        />
                    )}
                />
                {/* Campo Data e Hora (apenas visualização) */}
                {isReadOnly && (
                    <Controller
                        name="data_hora"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                value={field.value ? new Date(field.value).toLocaleString('pt-BR') : ''}
                                fullWidth
                                label="Data e Hora de Abertura"
                                margin="normal"
                                disabled={true}
                            />
                        )}
                    />
                )}
                {/* Campo Funcionário (apenas visualização) */}
                {isReadOnly && (
                    <Controller
                        name="funcionario_id"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                value={`ID: ${field.value || 'N/A'} - ${user?.nome || 'Funcionário'}`}
                                fullWidth
                                label="Funcionário Responsável"
                                margin="normal"
                                disabled={true}
                            />
                        )}
                    />
                )}
                {/* Campo Identificação do Cliente (opcional) */}
                <Controller
                    name="cliente_id"
                    control={control}
                    render={({ field }) => (
                        isReadOnly ? (
                            <TextField
                                fullWidth
                                label="Identificação do Cliente (opcional)"
                                margin="normal"
                                value={selectedCliente?.nome || clienteOptions.find(o => String(o.id) === String(field.value))?.nome || ''}
                                disabled
                            />
                        ) : (
                            <Autocomplete
                                options={clienteOptions}
                                getOptionLabel={(option) => option?.nome || ''}
                                loading={loadingClientes}
                                inputValue={clienteInput}
                                onInputChange={(event, newInputValue) => {
                                    setClienteInput(newInputValue);
                                    if (selectedCliente && newInputValue !== selectedCliente.nome) {
                                        setSelectedCliente(null);
                                    }
                                }}
                                value={clienteOptions.find(o => String(o.id) === String(field.value)) || null}
                                onChange={(_, selected) => {
                                    const id = selected ? selected.id : '';
                                    field.onChange(id);
                                    setValue('cliente_id', id);
                                    setSelectedCliente(selected || null);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        label="Identificação do Cliente (opcional)"
                                        margin="normal"
                                        placeholder="Nome do cliente ou observações"
                                        error={!!errors.cliente_id}
                                        helperText={errors.cliente_id?.message}
                                        disabled={loading || isReadOnly}
                                    />
                                )}
                            />
                        )
                    )}
                />

                {/* Botões de ação */}
                {!isReadOnly && (
                    <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button variant="outlined" onClick={handleCancel} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? 'Salvando...' : (id ? 'Atualizar' : 'Abrir Comanda')}
                        </Button>
                    </Box>
                )}
                {/* Botão voltar para modo visualização */}
                {isReadOnly && (
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="outlined" onClick={handleCancel} disabled={loading}>
                            Voltar
                        </Button>
                    </Box>
                )}
            </Box>
            {/* Diálogo de comanda em uso - Componente Exclusivo */}
            <ComandaValidator
                open={comandaDialog.open}
                onClose={handleDialogCancel}
                existingRecord={comandaDialog.record}
                recordType="comanda"
                onView={handleDialogView}
                onEdit={handleDialogEdit}
            />
        </PageLayout>
    );
};
export default ComandaForm;