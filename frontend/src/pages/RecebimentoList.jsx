import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
    Paper, Box, Typography, Card, CardContent, Divider,
} from '@mui/material';
import PageLayout from '../components/common/PageLayout';
import ActionButtons from '../components/common/ActionButtons';
import { recebimentoService } from '../services/recebimentoService';
import showSnackbar from '../utils/snackbar';
import showConfirm from '../utils/confirm';
import Pagination from '../components/common/Pagination';

function RecebimentoList() {
    const navigate = useNavigate();
    const [recebimentos, setRecebimentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ skip: 0, limit: 10, currentPage: 1 });
    const [hasItems, setHasItems] = useState(true);

    const handleEdit = (recebimento) => {
        navigate(`/recebimento/edit/${recebimento.id}`, { state: { recebimento } });
    };

    const handleDelete = (recebimento) => {
        showConfirm(
            'Excluir Recebimento',
            `Tem certeza que deseja excluir o recebimento #${recebimento.id}? As comandas vinculadas serão reabertas.`,
            async () => {
                try {
                    await recebimentoService.delete(recebimento.id);
                    showSnackbar('Recebimento excluído com sucesso!', 'success');
                    setRecebimentos(prev => prev.filter(r => r.id !== recebimento.id));
                } catch (error) {
                    showSnackbar(error.apiMessage || 'Erro ao excluir recebimento', 'error');
                }
            }
        );
    };

    const handlePageChange = (newPage) => {
        const newSkip = (newPage - 1) * pagination.limit;
        setPagination(prev => ({ ...prev, skip: newSkip, currentPage: newPage }));
    };

    const handleItemsPerPageChange = (newLimit) => {
        setPagination(prev => ({ ...prev, limit: newLimit, skip: 0, currentPage: 1 }));
    };

    useEffect(() => {
        const loadRecebimentos = async () => {
            try {
                setLoading(true);
                const data = await recebimentoService.list(pagination);
                setRecebimentos(data);
                setHasItems(data.length > 0);
            } catch (error) {
                showSnackbar(error.apiMessage || 'Erro ao carregar recebimentos', 'error');
            } finally {
                setLoading(false);
            }
        };
        loadRecebimentos();
    }, [pagination]);

    const columns = [
        { headerName: '#' },
        { headerName: 'Data/Hora' },
        { headerName: 'Funcionário' },
        { headerName: 'Cliente' },
        { headerName: 'Subtotal' },
        { headerName: 'Desconto' },
        { headerName: 'Acréscimo' },
        { headerName: 'Valor Final' },
        { headerName: 'Ações' },
    ];

    const formatCurrency = (value) => `R$ ${Number(value).toFixed(2)}`;

    const renderDesktopRow = (recebimento) => (
        <TableRow key={recebimento.id}>
            <TableCell>{recebimento.id}</TableCell>
            <TableCell>{new Date(recebimento.data_hora).toLocaleString('pt-BR')}</TableCell>
            <TableCell>{recebimento.funcionario_nome}</TableCell>
            <TableCell>{recebimento.cliente_nome || '-'}</TableCell>
            <TableCell>{formatCurrency(recebimento.subtotal_geral)}</TableCell>
            <TableCell>{formatCurrency(recebimento.desconto_total)}</TableCell>
            <TableCell>{formatCurrency(recebimento.acrescimo_total)}</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(recebimento.valor_final)}</TableCell>
            <TableCell>
                <ActionButtons onEdit={handleEdit} onDelete={handleDelete} item={recebimento} />
            </TableCell>
        </TableRow>
    );

    const renderMobileCard = (recebimento) => (
        <Card key={recebimento.id} sx={{ mb: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Recebimento #{recebimento.id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {new Date(recebimento.data_hora).toLocaleString('pt-BR')}
                        </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {formatCurrency(recebimento.valor_final)}
                    </Typography>
                </Box>
                <Typography variant="body2">
                    <strong>Funcionário:</strong> {recebimento.funcionario_nome}
                </Typography>
                {recebimento.cliente_nome && (
                    <Typography variant="body2">
                        <strong>Cliente:</strong> {recebimento.cliente_nome}
                    </Typography>
                )}
                {(recebimento.desconto_total > 0 || recebimento.acrescimo_total > 0) && (
                    <Typography variant="body2" color="text.secondary">
                        Subtotal: {formatCurrency(recebimento.subtotal_geral)}
                        {recebimento.desconto_total > 0 && ` | Desconto: ${formatCurrency(recebimento.desconto_total)}`}
                        {recebimento.acrescimo_total > 0 && ` | Acréscimo: ${formatCurrency(recebimento.acrescimo_total)}`}
                    </Typography>
                )}
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <ActionButtons onEdit={handleEdit} onDelete={handleDelete} item={recebimento} />
                </Box>
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <PageLayout title="Recebimentos">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <Typography>Carregando recebimentos...</Typography>
                </Box>
            </PageLayout>
        );
    }

    return (
        <PageLayout title="Recebimentos">
            {/* Desktop */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <TableContainer component={Paper} sx={{ mb: 3 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {columns.map((col, i) => (
                                    <TableCell key={i}>{col.headerName}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {recebimentos.length > 0
                                ? recebimentos.map(renderDesktopRow)
                                : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            Nenhum recebimento encontrado
                                        </TableCell>
                                    </TableRow>
                                )
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            {/* Mobile */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                {recebimentos.length > 0
                    ? recebimentos.map(renderMobileCard)
                    : (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                            Nenhum recebimento encontrado
                        </Typography>
                    )
                }
            </Box>
            <Pagination
                currentPage={pagination.currentPage}
                itemsPerPage={pagination.limit}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                loading={loading}
                hasItems={hasItems}
            />
        </PageLayout>
    );
}

export default RecebimentoList;
