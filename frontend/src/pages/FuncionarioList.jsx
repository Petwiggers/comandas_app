import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Card, CardContent, Typography, Box, Divider, Chip } from '@mui/material';
import { FiberNew } from '@mui/icons-material';
import PageLayout from "../components/common/PageLayout";
import ActionButtons from "../components/common/ActionButtons";
import FuncionarioFilters from '../components/common/FuncionarioFilters';
import Pagination from '../components/common/Pagination';
import { funcionarioService } from '../services/funcionarioService';
import showSnackbar from '../utils/snackbar';
import showConfirm from '../utils/confirm';

import { useMasks } from '../hooks/useMasks';

// Mapeamento de grupo: número -> nome e cor
const GRUPO_MAP = {
    1: { label: 'Admin',  color: 'error'   },
    2: { label: 'Balcão', color: 'primary' },
    3: { label: 'Caixa',  color: 'success' },
};

const renderGrupoChip = (grupo) => {
    const config = GRUPO_MAP[grupo];
    if (!config) return <Typography variant="body2" color="text.secondary">—</Typography>;
    return <Chip label={config.label} color={config.color} size="small" />;
};

function FuncionarioList() {
    const { applyCpfMask, applyPhoneMask } = useMasks();
    const navigate = useNavigate();

    const [funcionarios, setFuncionarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});
    const [pagination, setPagination] = useState({ skip: 0, limit: 10, currentPage: 1 });
    const [hasItems, setHasItems] = useState(true);

    // Navegação
    const handleView   = (funcionario) => navigate(`/funcionario/view/${funcionario.id}`);
    const handleEdit   = (funcionario) => navigate(`/funcionario/edit/${funcionario.id}`);

    // Filtros
    const handleFilter = (newFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, skip: 0, currentPage: 1 }));
    };
    const handleClearFilters = () => {
        setFilters({});
        setPagination(prev => ({ ...prev, skip: 0, currentPage: 1 }));
    };

    // Paginação
    const handlePageChange = (newPage) => {
        const newSkip = (newPage - 1) * pagination.limit;
        setPagination(prev => ({ ...prev, skip: newSkip, currentPage: newPage }));
    };
    const handleItemsPerPageChange = (newLimit) => {
        setPagination(prev => ({ ...prev, limit: newLimit, skip: 0, currentPage: 1 }));
    };

    // Exclusão com confirmação
    const handleDelete = (funcionario) => {
        showConfirm(
            'Excluir Funcionário',
            `Tem certeza que deseja excluir o funcionário "${funcionario.nome}"?`,
            async () => {
                try {
                    await funcionarioService.delete(funcionario.id);
                    showSnackbar('Funcionário excluído com sucesso!', 'success');
                    setFuncionarios(prev => prev.filter(f => f.id !== funcionario.id));
                } catch (error) {
                    showSnackbar('Erro ao excluir funcionário', 'error');
                }
            }
        );
    };

    // Ação de novo funcionário
    const actions = (
        <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/funcionario')}
            startIcon={<FiberNew />}
            sx={{ fontWeight: 600, px: 2, py: 1 }}
        >
            Novo
        </Button>
    );

    // Colunas da tabela
    const columns = [
        { field: 'id',        headerName: 'ID'        },
        { field: 'nome',      headerName: 'Nome'      },
        { field: 'matricula', headerName: 'Matrícula' },
        { field: 'cpf',       headerName: 'CPF'       },
        { field: 'grupo',     headerName: 'Grupo'     },
        { field: 'telefone',  headerName: 'Telefone'  },
        { field: 'actions',   headerName: 'Ações'     },
    ];

    // Carregar funcionários
    useEffect(() => {
        const loadFuncionarios = async () => {
            try {
                setLoading(true);
                const params = { skip: pagination.skip, limit: pagination.limit, ...filters };
                const response = await funcionarioService.list(params);
                const funcionariosData = response.data || response;
                setFuncionarios(funcionariosData);
                setHasItems(funcionariosData && funcionariosData.length > 0);
            } catch (error) {
                showSnackbar('Erro ao carregar funcionários', 'error');
            } finally {
                setLoading(false);
            }
        };
        loadFuncionarios();
    }, [pagination.skip, pagination.limit, filters]);

    // Renderização desktop: linha da tabela
    const renderDesktopRow = (funcionario) => (
        <TableRow key={funcionario.id} hover>
            <TableCell>{funcionario.id}</TableCell>
            <TableCell sx={{ fontWeight: 500 }}>{funcionario.nome}</TableCell>
            <TableCell>{funcionario.matricula || '—'}</TableCell>
            <TableCell>{applyCpfMask(funcionario.cpf || '—')}</TableCell>
            <TableCell>{renderGrupoChip(funcionario.grupo)}</TableCell>
            <TableCell>{applyPhoneMask(funcionario.telefone || '—')}</TableCell>
            <TableCell>
                <ActionButtons
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    item={funcionario}
                />
            </TableCell>
        </TableRow>
    );

    // Renderização mobile: card
    const renderMobileCard = (funcionario) => (
        <Card key={funcionario.id} sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                            {funcionario.nome}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            ID: {funcionario.id}
                        </Typography>
                    </Box>
                    {renderGrupoChip(funcionario.grupo)}
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Matrícula:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {funcionario.matricula || '—'}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">CPF:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {applyCpfMask(funcionario.cpf || '—')}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Telefone:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {applyPhoneMask(funcionario.telefone || '—')}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <ActionButtons
                        item={funcionario}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <PageLayout title="Funcionários" actions={actions}>
            {/* Filtros */}
            <FuncionarioFilters onFilter={handleFilter} onClear={handleClearFilters} filters={filters} />

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
                            {funcionarios.map((funcionario) => renderDesktopRow(funcionario))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Cards Mobile */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                {funcionarios.map((funcionario) => renderMobileCard(funcionario))}
            </Box>

            {/* Paginação */}
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

export default FuncionarioList;