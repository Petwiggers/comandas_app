import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Card, CardContent, Typography, Box, Divider } from '@mui/material';
import { FiberNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageLayout from "../components/common/PageLayout";
import ActionButtons from "../components/common/ActionButtons";

function FuncionarioList() {
    const navigate = useNavigate();

    // Lista manual de funcionários baseada no esquema solicitado
    const funcionarios = [
        { id: 1, nome: 'João Silva', matricula: '2023001', cpf: '123.456.789-00', telefone: '(11) 98765-4321', grupo: 1 },
        { id: 2, nome: 'Maria Oliveira', matricula: '2023002', cpf: '234.567.890-11', telefone: '(11) 91234-5678', grupo: 2 },
        { id: 3, nome: 'Carlos Souza', matricula: '2023003', cpf: '345.678.901-22', telefone: '(11) 99887-7665', grupo: 1 }
    ];

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

    const handleView = (funcionario) => console.log("Visualizar funcionário:", funcionario);
    const handleEdit = (funcionario) => navigate(`/funcionario/${funcionario.id}`);
    const handleDelete = (funcionario) => console.log("Excluir funcionário:", funcionario);

    const columns = [
        { field: 'id', headerName: 'ID' },
        { field: 'nome', headerName: 'Nome' },
        { field: 'matricula', headerName: 'Matrícula' },
        { field: 'cpf', headerName: 'CPF' },
        { field: 'telefone', headerName: 'Telefone' },
        { field: 'grupo', headerName: 'Grupo' },
        { field: 'actions', headerName: 'Ações' }
    ];

    // Função para renderizar uma linha da tabela em desktop
    const renderDesktopRow = (funcionario) => (
        <TableRow key={funcionario.id} hover>
            <TableCell>{funcionario.id}</TableCell>
            <TableCell sx={{ fontWeight: 500 }}>{funcionario.nome}</TableCell>
            <TableCell>{funcionario.matricula}</TableCell>
            <TableCell>{funcionario.cpf}</TableCell>
            <TableCell>{funcionario.telefone}</TableCell>
            <TableCell>{funcionario.grupo}</TableCell>
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

    // Função para renderizar um card em mobile
    const renderMobileCard = (funcionario) => (
        <Card key={funcionario.id} sx={{ mb: 2, elevation: 2 }}>
            <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                            {funcionario.nome}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            ID: {funcionario.id} | Matrícula: {funcionario.matricula}
                        </Typography>
                    </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">CPF:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{funcionario.cpf}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Telefone:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{funcionario.telefone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Grupo:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{funcionario.grupo}</Typography>
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
            {/* Versão Desktop */}
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

            {/* Versão Mobile */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                {funcionarios.map((funcionario) => renderMobileCard(funcionario))}
            </Box>
        </PageLayout>
    );
}

export default FuncionarioList;