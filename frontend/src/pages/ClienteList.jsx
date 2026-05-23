import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Card, CardContent, Typography, Box, Divider } from '@mui/material';
import { FiberNew } from '@mui/icons-material';
import PageLayout from "../components/common/PageLayout";
import ActionButtons from "../components/common/ActionButtons";
import ClienteFilters from '../components/common/ClienteFilters';
import Pagination from '../components/common/Pagination';
import { clienteService } from '../services/clienteService';
import showSnackbar from '../utils/snackbar';
import showConfirm from '../utils/confirm';

function ClienteList() {
    const navigate = useNavigate();

    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});
    const [pagination, setPagination] = useState({ skip: 0, limit: 3, currentPage: 1 });
    const [hasItems, setHasItems] = useState(true);

    // Funções de navegação
    const handleView = (cliente) => navigate(`/cliente/view/${cliente.id}`);
    const handleEdit = (cliente) => navigate(`/cliente/edit/${cliente.id}`);

    // Funções de manipulação de filtros
    const handleFilter = (newFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, skip: 0, currentPage: 1 }));
    };
    const handleClearFilters = () => {
        setFilters({});
        setPagination(prev => ({ ...prev, skip: 0, currentPage: 1 }));
    };

    // Funções de manipulação de paginação
    const handlePageChange = (newPage) => {
        const newSkip = (newPage - 1) * pagination.limit;
        setPagination(prev => ({ ...prev, skip: newSkip, currentPage: newPage }));
    };
    const handleItemsPerPageChange = (newLimit) => {
        setPagination(prev => ({ ...prev, limit: newLimit, skip: 0, currentPage: 1 }));
    };

    // Função de exclusão com confirmação
    const handleDelete = (cliente) => {
        showConfirm('Excluir Cliente', `Tem certeza que deseja excluir o cliente "${cliente.nome}"?`,
            async () => {
                try {
                    await clienteService.delete(cliente.id);
                    showSnackbar('Cliente excluído com sucesso!', 'success');
                    const updatedClientes = clientes.filter(c => c.id !== cliente.id);
                    setClientes(updatedClientes);
                } catch (error) {
                    showSnackbar('Erro ao excluir cliente', 'error');
                }
            }
        );
    };

    // Configuração de ações da página
    const actions = (
        <Button variant="contained" color="primary" onClick={() => navigate('/cliente')} startIcon={<FiberNew />} sx={{ fontWeight: 600, px: 2, py: 1 }}>
            Novo
        </Button>
    );

    // Efeito para carregar clientes
    useEffect(() => {
        const loadClientes = async () => {
            try {
                setLoading(true);
                const params = { skip: pagination.skip, limit: pagination.limit, ...filters };
                const response = await clienteService.list(params);
                const clientesData = response.data || response;
                setClientes(clientesData);
                setHasItems(clientesData && clientesData.length > 0);
            } catch (error) {
                showSnackbar('Erro ao carregar clientes', 'error');
            } finally {
                setLoading(false);
            }
        };
        loadClientes();
    }, [pagination.skip, pagination.limit, filters]);

    const columns = [
        { field: 'id', headerName: 'ID' },
        { field: 'nome', headerName: 'Nome' },
        { field: 'cpf', headerName: 'CPF' },
        { field: 'telefone', headerName: 'Telefone' },
        { field: 'actions', headerName: 'Ações' }
    ];

    // Renderização desktop: linha da tabela
    const renderDesktopRow = (cliente) => (
        <TableRow key={cliente.id} hover>
            <TableCell>{cliente.id}</TableCell>
            <TableCell sx={{ fontWeight: 500 }}>{cliente.nome}</TableCell>
            <TableCell>{cliente.cpf}</TableCell>
            <TableCell>{cliente.telefone}</TableCell>
            <TableCell>
                <ActionButtons onView={handleView} onEdit={handleEdit} onDelete={handleDelete} item={cliente} />
            </TableCell>
        </TableRow>
    );

    // Renderização mobile: card
    const renderMobileCard = (cliente) => (
        <Card key={cliente.id} sx={{ mb: 2, elevation: 2 }}>
            <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                            {cliente.nome}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            ID: {cliente.id}
                        </Typography>
                    </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">CPF:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{cliente.cpf}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Telefone:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{cliente.telefone}</Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <ActionButtons item={cliente} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <PageLayout title="Clientes" actions={actions}>
            {/* Componente de Filtros */}
            <ClienteFilters onFilter={handleFilter} onClear={handleClearFilters} filters={filters} />

            {/* Tabela Desktop */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {columns.map((column, index) => (
                                    <TableCell key={index} sx={{ fontWeight: 600 }}>
                                        {column.headerName}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {clientes.map((cliente) => renderDesktopRow(cliente))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Cards Mobile */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                {clientes.map((cliente) => renderMobileCard(cliente))}
            </Box>

            {/* Componente de Paginação */}
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

export default ClienteList;