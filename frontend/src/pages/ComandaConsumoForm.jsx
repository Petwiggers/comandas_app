import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { TextField, Button, Box, CircularProgress, Typography, MenuItem, FormControl, InputLabel, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import PageLayout from "../components/common/PageLayout";
import ActionButtons from '../components/common/ActionButtons';
import { useValidationRules } from '../hooks/useValidationRules';
import comandaService from '../services/comandaService';
import produtoService from '../services/produtoService';
import showSnackbar from '../utils/snackbar';
import showConfirm from '../utils/confirm';
import { useAuth } from '../context/AuthContext';
// Definição do componente ComandaConsumoForm
const ComandaConsumoForm = () => {
    // Hooks de navegação e parâmetros
    const { id } = useParams(); // ID da comanda
    const navigate = useNavigate(); // Navegação entre páginas
    // Hook de autenticação
    const { user } = useAuth(); // Dados do funcionário logado
    // Hook de formulário para adicionar itens
    const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm({
        defaultValues: {
            produto_id: '',
            quantidade: 1,
            funcionario_id: user?.id || ''
        }
    });
    // Estados do componente
    const [loading, setLoading] = useState(false); // Estado de carregamento durante salvamento
    const [loadingData, setLoadingData] = useState(true); // Estado de carregamento de dados iniciais
    const [comanda, setComanda] = useState(null); // Dados da comanda
    const [itens, setItens] = useState([]); // Lista de itens de consumo
    const [produtos, setProdutos] = useState([]); // Lista de produtos disponíveis
    const [loadingProdutos, setLoadingProdutos] = useState(false); // Estado de carregamento de produtos
    const [editingItemId, setEditingItemId] = useState(null); // ID do item em edição
    // Configurações e validações
    const validationRules = useValidationRules(); // Regras de validação dos campos

    // Carregar dados da comanda e produtos
    useEffect(() => {
        const loadData = async () => {
            try {
                // Carregar dados da comanda
                const comandaData = await comandaService.getById(id);
                setComanda(comandaData);
                // Carregar itens de consumo
                const itensData = await comandaService.listItems(id);
                setItens(itensData);
                // Carregar produtos disponíveis
                setLoadingProdutos(true);
                const response = await produtoService.list({ limit: 1000 });
                // produtoService.list() usually returns the array directly or inside data
                const produtosData = response.data || response;
                setProdutos(produtosData);
            } catch (error) {
                const mensagem = error.apiMessage || 'Erro ao carregar dados da comanda';
                showSnackbar(mensagem, 'error');
            } finally {
                setLoadingData(false);
                setLoadingProdutos(false);
            }
        };
        if (id) {
            loadData();
        }
    }, [id]);

    // Função de adicionar item de consumo
    const onSubmit = async (data) => {
        setLoading(true);
        try {
            // Preparar dados para envio
            const itemData = {
                produto_id: parseInt(data.produto_id),
                quantidade: parseInt(data.quantidade),
                funcionario_id: user?.id || data.funcionario_id, // Usar funcionário logado
                valor_unitario: produtos.find(p => p.id === parseInt(data.produto_id))?.valor_unitario || 0
            };
            if (editingItemId) {
                await comandaService.updateItem(editingItemId, itemData);
                showSnackbar('Item atualizado com sucesso!', 'success');
                setEditingItemId(null);
            } else {
                await comandaService.addItem(id, itemData);
                showSnackbar('Item adicionado com sucesso!', 'success');
            }
            // Limpar formulário mantendo funcionario_id
            reset({
                produto_id: '',
                quantidade: 1,
                funcionario_id: user?.id || ''
            });
            // Recarregar lista de itens
            const itensData = await comandaService.listItems(id);
            setItens(itensData);
        } catch (error) {
            const mensagem = error.apiMessage || 'Erro ao adicionar item';
            showSnackbar(mensagem, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Função para iniciar edição de um item
    const handleEditItem = (item) => {
        setEditingItemId(item.id);
        setValue('produto_id', item.produto_id);
        setValue('quantidade', item.quantidade);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Função para cancelar a edição
    const handleCancelEdit = () => {
        setEditingItemId(null);
        reset({
            produto_id: '',
            quantidade: 1,
            funcionario_id: user?.id || ''
        });
    };

    // Função de remover item de consumo
    const handleRemoveItem = (item) => {
        const pNome = item.produto?.nome || produtos.find(p => p.id === item.produto_id)?.nome || 'Produto';
        showConfirm('Remover Item', `Tem certeza que deseja remover "${pNome}", quantidade ${item.quantidade}?`,
            async () => {
                try {
                    await comandaService.removeItem(item.id);
                    showSnackbar('Item removido com sucesso!', 'success');
                    // Recarregar lista de itens
                    const itensData = await comandaService.listItems(id);
                    setItens(itensData);
                } catch (error) {
                    const mensagem = error.apiMessage || 'Erro ao remover item';
                    showSnackbar(mensagem, 'error');
                }
            }
        );
    };

    // Funções de navegação
    const handleCancel = () => {
        navigate('/comandas');
    };

    // Renderizar loading de dados
    if (loadingData) {
        return (
            <PageLayout title={`Consumo - Comanda ${id}`}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress />
                </Box>
            </PageLayout>
        );
    }

    // renderizar formulário - return
    return (
        <PageLayout title={`Consumo - Comanda ${comanda?.comanda}`}>
            {/* Informações da Comanda */}
            {comanda && (
                <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Comanda {comanda.comanda}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Cliente: {comanda.cliente_id || 'Não identificado'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Abertura: {new Date(comanda.data_hora).toLocaleString('pt-BR')}
                    </Typography>
                </Box>
            )}
            {/* Formulário para adicionar itens */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Adicionar Item de Consumo</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    {/* Campo Produto */}
                    <Controller name="produto_id" control={control} rules={{ required: validationRules.required }}
                        render={({ field }) => (
                            <FormControl fullWidth>
                                <InputLabel id="produto-label">Produto</InputLabel>
                                <Select {...field} labelId="produto-label" label="Produto"
                                    disabled={loading || loadingProdutos || !!editingItemId}
                                    value={field.value || ''}
                                >
                                    <MenuItem value="" disabled>Selecione um produto</MenuItem>
                                    {produtos.map((produto) => (
                                        <MenuItem key={produto.id} value={produto.id}>
                                            {produto.nome} - R$ {Number(produto.valor_unitario).toFixed(2)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    />
                    {/* Campo Quantidade */}
                    <Controller name="quantidade" control={control} rules={{
                        required: validationRules.required, min: {
                            value: 1, message: 'Quantidade deve ser maior que 0'
                        }
                    }}
                        render={({ field }) => (
                            <TextField {...field} label="Quantidade" type="number" sx={{ width: 150 }}
                                error={!!errors.quantidade}
                                helperText={errors.quantidade?.message}
                                disabled={loading}
                            />
                        )}
                    />
                </Box>
                {/* Campo Funcionário (oculto - preenchido automaticamente) */}
                <Controller name="funcionario_id" control={control} rules={{ required: validationRules.required }}
                    render={({ field }) => (
                        <input {...field} type="hidden"
                            value={field.value || user?.id || ''}
                        />
                    )}
                />
                {/* Botões de ação do formulário */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Button type="submit" variant="contained" disabled={loading || loadingProdutos} startIcon={editingItemId ? <EditIcon /> : <AddIcon />}>
                        {loading ? 'Processando...' : (editingItemId ? 'Atualizar Item' : 'Adicionar Item')}
                    </Button>
                    {editingItemId && (
                        <Button variant="outlined" onClick={handleCancelEdit} disabled={loading}>Cancelar Edição</Button>
                    )}
                </Box>
            </Box>
            {/* Lista de itens de consumo */}
            <Typography variant="h6" sx={{ mb: 2 }}>
                Itens de Consumo
            </Typography>
            {itens.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                    Nenhum item de consumo registrado
                </Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Produto</TableCell>
                                <TableCell>Quantidade</TableCell>
                                <TableCell>Valor Unitário</TableCell>
                                <TableCell>Valor Total</TableCell>
                                <TableCell>Funcionário</TableCell>
                                <TableCell>Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {itens.map((item, index) => {
                                const pNome = item.produto?.nome || produtos.find(p => p.id === item.produto_id)?.nome || 'Produto não encontrado';
                                const fNome = item.funcionario?.nome || '-';
                                return (
                                    <TableRow key={index}>
                                        <TableCell>{pNome}</TableCell>
                                        <TableCell>{item.quantidade}</TableCell>
                                        <TableCell>R$ {Number(item.valor_unitario).toFixed(2)}</TableCell>
                                        <TableCell>R$ {(Number(item.valor_unitario) * Number(item.quantidade)).toFixed(2)}</TableCell>
                                        <TableCell>{fNome}</TableCell>
                                        <TableCell><ActionButtons item={item} onEdit={handleEditItem} onDelete={handleRemoveItem} disabled={editingItemId === item.id} /></TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            {/* Botões de ação */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={handleCancel} disabled={loading}>Voltar</Button>
            </Box>
        </PageLayout>
    );
};

export default ComandaConsumoForm;