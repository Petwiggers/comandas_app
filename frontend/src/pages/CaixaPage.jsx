import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Checkbox,
    Typography,
    Divider,
    CircularProgress,
    Grid,
    TextField,
} from '@mui/material';
import { Payment } from '@mui/icons-material';
import PageLayout from '../components/common/PageLayout';
import { recebimentoService } from '../services/recebimentoService';
import { useAuth } from '../context/AuthContext';
import showSnackbar from '../utils/snackbar';
import showConfirm from '../utils/confirm';

function CaixaPage() {
    const { user } = useAuth();

    // Estado para lista de comandas abertas
    const [comandasAbertas, setConandasAbertas] = useState([]);
    const [loadingDashboard, setLoadingDashboard] = useState(true);

    // Estado para seleção de comandas
    const [selectedIds, setSelectedIds] = useState([]);

    // Estado para detalhes das comandas selecionadas
    const [detalhesComandas, setDetalhesComandas] = useState(null);
    const [loadingDetalhes, setLoadingDetalhes] = useState(false);

    // Estado para aplicar desconto/acréscimo
    const [desconto, setDesconto] = useState(0);
    const [acrescimo, setAcrescimo] = useState(0);
    const [processandoPagamento, setProcessandoPagamento] = useState(false);

    // Carregar dashboard ao montar
    useEffect(() => {
        carregarDashboard();
    }, []);

    // Quando mudar a seleção, buscar detalhes
    useEffect(() => {
        if (selectedIds.length > 0) {
            buscarDetalhesComandas();
        } else {
            setDetalhesComandas(null);
        }
    }, [selectedIds]);

    // Carregar lista de comandas abertas
    const carregarDashboard = async () => {
        try {
            setLoadingDashboard(true);
            const response = await recebimentoService.getDashboard({
                skip: 0,
                limit: 100,
            });
            setConandasAbertas(response);
        } catch (error) {
            showSnackbar('Erro ao carregar comandas abertas', 'error');
            console.error(error);
        } finally {
            setLoadingDashboard(false);
        }
    };

    // Buscar detalhes das comandas selecionadas
    const buscarDetalhesComandas = async () => {
        try {
            setLoadingDetalhes(true);
            const response = await recebimentoService.getComandasDetalhe(selectedIds);
            setDetalhesComandas(response);
        } catch (error) {
            showSnackbar('Erro ao carregar detalhes das comandas', 'error');
            console.error(error);
        } finally {
            setLoadingDetalhes(false);
        }
    };

    // Lidar com seleção de checkbox
    const handleSelectComanda = (id) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Selecionar todas as comandas
    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedIds(comandasAbertas.map(comanda => comanda.id));
        } else {
            setSelectedIds([]);
        }
    };

    // Processar pagamento
    const handlePagar = async () => {
        if (!user) {
            showSnackbar('Usuário não autenticado', 'error');
            return;
        }

        const confirmado = await showConfirm(
            'Confirmar Pagamento',
            `Deseja confirmar o pagamento de ${selectedIds.length} comanda(s)?`
        );
        console.log(confirmado);
        

        if (!confirmado) return;

        try {
            setProcessandoPagamento(true);

            const desconto_valor = desconto ? Number(desconto) : null;
            const acrescimo_valor = acrescimo ? Number(acrescimo) : null;

            const primeiroClienteId = detalhesComandas?.comandas?.[0]?.cliente_id ?? null;
            const mesmoCliente = detalhesComandas?.comandas?.every(
                (comanda) => comanda.cliente_id === primeiroClienteId
            );

            const recebimentoData = {
                funcionario_id: user.id,
                cliente_id: mesmoCliente ? primeiroClienteId : null,
                comandas_ids: selectedIds,
                desconto_valor,
                acrescimo_valor,
            };

            const response = await recebimentoService.postComplete(recebimentoData);

            if (!response?.sucesso) {
                throw new Error(response?.mensagem || 'Erro ao confirmar pagamento');
            }

            showSnackbar(response.mensagem || 'Pagamento realizado com sucesso!', 'success');

            // Limpar seleção e recarregar dashboard
            setSelectedIds([]);
            setDesconto(0);
            setAcrescimo(0);
            await carregarDashboard();
        } catch (error) {
            showSnackbar(error?.message || 'Erro ao processar pagamento', 'error');
            console.error(error);
        } finally {
            setProcessandoPagamento(false);
        }
    };

    // Calcular valor total com desconto e acréscimo
    const calcularValorFinal = () => {
        if (!detalhesComandas) return 0;
        const subtotal = detalhesComandas.total_geral || 0;
        return subtotal - Number(desconto) + Number(acrescimo);
    };

    return (
        <PageLayout title="Caixa - Fechamento de Comandas">
            <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
                {/* PAINEL ESQUERDO - Lista de Comandas */}
                <Grid xs={12} md={6} lg={7}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                Comandas Abertas ({comandasAbertas.length})
                            </Typography>

                            {loadingDashboard ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                    <CircularProgress />
                                </Box>
                            ) : comandasAbertas.length > 0 ? (
                                <TableContainer component={Paper}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                                <TableCell width={50} align="center">
                                                    <Checkbox
                                                        indeterminate={
                                                            selectedIds.length > 0 &&
                                                            selectedIds.length < comandasAbertas.length
                                                        }
                                                        checked={
                                                            comandasAbertas.length > 0 &&
                                                            selectedIds.length === comandasAbertas.length
                                                        }
                                                        onChange={handleSelectAll}
                                                    />
                                                </TableCell>
                                                <TableCell>Comanda</TableCell>
                                                <TableCell>Cliente</TableCell>
                                                <TableCell align="right">Total</TableCell>
                                                <TableCell align="center">Itens</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {comandasAbertas.map(comanda => (
                                                <TableRow
                                                    key={comanda.id}
                                                    sx={{
                                                        backgroundColor: selectedIds.includes(comanda.id)
                                                            ? '#e3f2fd'
                                                            : 'inherit',
                                                        '&:hover': { backgroundColor: '#f9f9f9' },
                                                    }}
                                                >
                                                    <TableCell align="center">
                                                        <Checkbox
                                                            checked={selectedIds.includes(comanda.id)}
                                                            onChange={() => handleSelectComanda(comanda.id)}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                                        #{comanda.comanda}
                                                    </TableCell>
                                                    <TableCell>{comanda.cliente || '-'}</TableCell>
                                                    <TableCell align="right">
                                                        R$ {comanda.total?.toFixed(2) || '0.00'}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {comanda.quantidade_produtos}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
                                    Nenhuma comanda aberta
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* PAINEL DIREITO - Detalhes e Pagamento */}
                <Grid xs={12} md={6} lg={5}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                Detalhes do Recebimento
                            </Typography>

                            {selectedIds.length === 0 ? (
                                <Typography color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
                                    Selecione uma ou mais comandas
                                </Typography>
                            ) : loadingDetalhes ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                    <CircularProgress />
                                </Box>
                            ) : detalhesComandas ? (
                                <>
                                    {/* Lista de Comandas Selecionadas */}
                                    {detalhesComandas.comandas?.map(comanda => (
                                        <Box key={comanda.id} sx={{ mb: 3 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                Comanda #{comanda.comanda}
                                            </Typography>
                                            <TableContainer component={Paper} variant="outlined">
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                                            <TableCell>Produto</TableCell>
                                                            <TableCell align="center">Qtd</TableCell>
                                                            <TableCell align="right">Unit</TableCell>
                                                            <TableCell align="right">Total</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {comanda.itens?.map(item => (
                                                            <TableRow key={item.id}>
                                                                <TableCell sx={{ fontSize: '0.85rem' }}>
                                                                    {item.produto}
                                                                </TableCell>
                                                                <TableCell align="center" sx={{ fontSize: '0.85rem' }}>
                                                                    {item.quantidade}
                                                                </TableCell>
                                                                <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                                                                    R$ {item.valor_unitario?.toFixed(2)}
                                                                </TableCell>
                                                                <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                                                                    R$ {item.total_item?.toFixed(2)}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                    Subtotal: R$ {comanda.subtotal?.toFixed(2)}
                                                </Typography>
                                            </Box>
                                            <Divider sx={{ mt: 2 }} />
                                        </Box>
                                    ))}

                                    {/* Resumo de Valores */}
                                    <Box sx={{ mt: 1, p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            <strong>Subtotal Geral:</strong> R${' '}
                                            {detalhesComandas.total_geral?.toFixed(2) || '0.00'}
                                        </Typography>

                                        <TextField
                                            label="Desconto (R$)"
                                            type="number"
                                            size="small"
                                            value={desconto}
                                            onChange={e => setDesconto(e.target.value)}
                                            sx={{ width: '100%', my: 1 }}
                                            inputProps={{ step: '0.01', min: '0' }}
                                        />

                                        <TextField
                                            label="Acréscimo (R$)"
                                            type="number"
                                            size="small"
                                            value={acrescimo}
                                            onChange={e => setAcrescimo(e.target.value)}
                                            sx={{ width: '100%', my: 1 }}
                                            inputProps={{ step: '0.01', min: '0' }}
                                        />

                                        <Divider sx={{ my: 2 }} />

                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                            TOTAL: R$ {calcularValorFinal().toFixed(2)}
                                        </Typography>

                                        <Typography variant="caption" color="textSecondary">
                                            Quantidade de comandas: {selectedIds.length}
                                        </Typography>
                                    </Box>

                                    {/* Botão de Pagamento */}
                                    <Button
                                        variant="contained"
                                        color="success"
                                        fullWidth
                                        size="large"
                                        startIcon={<Payment />}
                                        sx={{ mt: 3, py: 1.5 }}
                                        onClick={handlePagar}
                                        disabled={processandoPagamento}
                                    >
                                        {processandoPagamento ? 'Processando...' : 'Confirmar Pagamento'}
                                    </Button>
                                </>
                            ) : null}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </PageLayout>
    );
}

export default CaixaPage;
