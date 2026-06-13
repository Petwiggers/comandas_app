import { useState, useEffect, useRef } from 'react';
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
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
} from '@mui/material';
import { Payment, Print, Close } from '@mui/icons-material';
import PageLayout from '../components/common/PageLayout';
import { recebimentoService } from '../services/recebimentoService';
import { useAuth } from '../context/AuthContext';
import showSnackbar from '../utils/snackbar';
import showConfirm from '../utils/confirm';
import { useMasks } from '../hooks/useMasks';

function CaixaPage() {
    const { user } = useAuth();
    const { applyCpfMask, applyPhoneMask } = useMasks();

    // Estado para lista de comandas abertas
    const [comandasAbertas, setConandasAbertas] = useState([]);
    const [loadingDashboard, setLoadingDashboard] = useState(true);

    // Estado para seleção de comandas
    const [selectedIds, setSelectedIds] = useState([]);

    // Estado para detalhes das comandas selecionadas
    const [detalhesComandas, setDetalhesComandas] = useState(null);
    const [loadingDetalhes, setLoadingDetalhes] = useState(false);
    const [clientesDisponiveis, setClientesDisponiveis] = useState([]);
    const [selectedClienteId, setSelectedClienteId] = useState(null);

    // Estado para aplicar desconto/acréscimo
    const [desconto, setDesconto] = useState(0);
    const [acrescimo, setAcrescimo] = useState(0);
    const [processandoPagamento, setProcessandoPagamento] = useState(false);

    // Estado do comprovante
    const [comprovanteAberto, setComprovanteAberto] = useState(false);
    const [comprovanteData, setComprovanteData] = useState(null);
    const comprovanteRef = useRef(null);

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
            setClientesDisponiveis([]);
            setSelectedClienteId(null);
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

            const clientes = Array.isArray(response?.clientes)
                ? response.clientes.filter(Boolean)
                : [];
            const clientesUnicos = clientes.reduce((acc, cliente) => {
                if (!acc.some(item => item.id === cliente.id)) {
                    acc.push(cliente);
                }
                return acc;
            }, []);

            setClientesDisponiveis(clientesUnicos);
            setSelectedClienteId(clientesUnicos.length > 0 ? clientesUnicos[0].id : null);
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

        if (!confirmado) return;

        try {
            setProcessandoPagamento(true);

            const desconto_valor = desconto ? Number(desconto) : null;
            const acrescimo_valor = acrescimo ? Number(acrescimo) : null;

            const recebimentoData = {
                funcionario_id: user.id,
                cliente_id: selectedClienteId ?? null,
                comandas_ids: selectedIds,
                desconto_valor,
                acrescimo_valor,
            };

            const response = await recebimentoService.postComplete(recebimentoData);

            if (!response?.sucesso) {
                throw new Error(response?.mensagem || 'Erro ao confirmar pagamento');
            }

            showSnackbar(response.mensagem || 'Pagamento realizado com sucesso!', 'success');

            const recebimentoId = response.recebimento_id;

            // Limpar seleção e recarregar dashboard
            setSelectedIds([]);
            setDesconto(0);
            setAcrescimo(0);
            await carregarDashboard();

            const querComprovante = await showConfirm(
                'Emitir Comprovante',
                'Deseja emitir o comprovante de pagamento?'
            );
            if (querComprovante) {
                await emitirComprovante(recebimentoId);
            }
        } catch (error) {
            showSnackbar(error?.message || 'Erro ao processar pagamento', 'error');
            console.error(error);
        } finally {
            setProcessandoPagamento(false);
        }
    };

    const emitirComprovante = async (recebimentoId) => {
        try {
            const data = await recebimentoService.getComprovante(recebimentoId);
            setComprovanteData(data);
            setComprovanteAberto(true);
        } catch (error) {
            showSnackbar('Erro ao carregar comprovante', 'error');
            console.error(error);
        }
    };

    const handleImprimir = () => {
        const conteudo = comprovanteRef.current?.innerHTML;
        if (!conteudo) return;
        const janela = window.open('', '_blank', 'width=400,height=700');
        janela.document.write(`
            <html><head><title>Comprovante</title>
            <style>
                body { font-family: monospace; font-size: 13px; padding: 16px; color: #000; background-color: #fdf8e1; }
                h2, h3 { text-align: center; margin: 4px 0; }
                hr { border: 1px dashed #000; margin: 8px 0; }
                .linha { display: flex; justify-content: space-between; margin: 2px 0; }
                .negrito { font-weight: bold; }
                .centro { text-align: center; }
            </style>
            </head><body>${conteudo}</body></html>
        `);
        janela.document.close();
        janela.focus();
        janela.print();
        janela.close();
    };

    // Calcular valor total com desconto e acréscimo
    const calcularValorFinal = () => {
        if (!detalhesComandas) return 0;
        const subtotal = detalhesComandas.total_geral || 0;
        return subtotal - Number(desconto) + Number(acrescimo);
    };

    return (
        <PageLayout title="Caixa - Fechamento de Comandas">
            <Grid container direction="column" spacing={3} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                {/* PAINEL DE LISTA DE COMANDAS */}
                <Grid item xs={12} md={10} lg={8} sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <Card sx={{ width: '100%' }}>
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

                {/* PAINEL DE DETALHES E PAGAMENTO */}
                <Grid item xs={12} md={10} lg={8} sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <Card sx={{ width: '100%' }}>
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

                                    {clientesDisponiveis.length > 0 ? (
                                        <TextField
                                            select
                                            label="Cliente (opcional)"
                                            fullWidth
                                            size="small"
                                            value={selectedClienteId ?? ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setSelectedClienteId(value === '' ? null : Number(value));
                                            }}
                                            helperText="Selecione o cliente que será usado no recebimento ou deixe vazio para nenhum cliente"
                                            sx={{ mb: 2 }}
                                        >
                                            <MenuItem value="">Nenhum cliente</MenuItem>
                                            {clientesDisponiveis.map((cliente) => (
                                                <MenuItem key={cliente.id} value={cliente.id}>
                                                    {cliente.nome} {cliente.cpf ? `(${applyCpfMask(cliente.cpf || '—')})` : ''}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    ) : (
                                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                            Nenhum cliente vinculado a essas comandas.
                                        </Typography>
                                    )}

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
            {/* DIALOG DE COMPROVANTE */}
            <Dialog
                open={comprovanteAberto}
                onClose={() => setComprovanteAberto(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Comprovante de Pagamento
                    <IconButton onClick={() => setComprovanteAberto(false)} size="small">
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    {comprovanteData ? (
                        <Box ref={comprovanteRef} sx={{ fontFamily: 'monospace', fontSize: '0.85rem', backgroundColor: '#fdf8e1', p: 2, borderRadius: 1 }}>
                            {/* Cabeçalho */}
                            {comprovanteData.cabecalho && (
                                <Box sx={{ textAlign: 'center', mb: 1 }}>
                                    {Object.values(comprovanteData.cabecalho).map((valor, i) => (
                                        <Typography key={i} variant="body2" sx={{ fontFamily: 'monospace', fontWeight: i === 0 ? 'bold' : 'normal' }}>
                                            {valor}
                                        </Typography>
                                    ))}
                                </Box>
                            )}

                            <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

                            {/* Info do recebimento */}
                            {comprovanteData.recebimento && (
                                <Box sx={{ mb: 1 }}>
                                    {Object.entries(comprovanteData.recebimento).map(([chave, valor]) => (
                                        <Box key={chave} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace', textTransform: 'capitalize' }}>
                                                {chave.replace(/_/g, ' ')}:
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                {String(valor)}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            {/* Funcionário */}
                            {comprovanteData.funcionario && (
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                                    Atendente: {comprovanteData.funcionario.nome}
                                </Typography>
                            )}

                            {/* Cliente */}
                            {comprovanteData.cliente && (
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                                    Cliente: {comprovanteData.cliente.nome}
                                </Typography>
                            )}

                            <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

                            {/* Comandas */}
                            {comprovanteData.comandas?.map((comanda, i) => (
                                <Box key={i} sx={{ mb: 1 }}>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                        Comanda #{comanda.comanda ?? comanda.id}
                                    </Typography>
                                </Box>
                            ))}

                            <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

                            {/* Resumo de valores */}
                            {comprovanteData.resumo_valores && (
                                <Box sx={{ mb: 1 }}>
                                    {Object.entries(comprovanteData.resumo_valores).map(([chave, valor]) => (
                                        <Box key={chave} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace', textTransform: 'capitalize' }}>
                                                {chave.replace(/_/g, ' ')}:
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: chave.toLowerCase().includes('total') || chave.toLowerCase().includes('final') ? 'bold' : 'normal' }}>
                                                {String(valor)}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

                            {/* Data de emissão */}
                            {comprovanteData.data_emissao && (
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', textAlign: 'center', mb: 1 }}>
                                    Emitido em: {new Date(comprovanteData.data_emissao).toLocaleString('pt-BR')}
                                </Typography>
                            )}

                            {/* Rodapé */}
                            {comprovanteData.rodape && (
                                <Box sx={{ textAlign: 'center', mt: 1 }}>
                                    {Object.values(comprovanteData.rodape).map((valor, i) => (
                                        <Typography key={i} variant="body2" sx={{ fontFamily: 'monospace' }}>
                                            {valor}
                                        </Typography>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setComprovanteAberto(false)}>Fechar</Button>
                    <Button
                        variant="contained"
                        startIcon={<Print />}
                        onClick={handleImprimir}
                        disabled={!comprovanteData}
                    >
                        Imprimir
                    </Button>
                </DialogActions>
            </Dialog>
        </PageLayout>
    );
}

export default CaixaPage;
