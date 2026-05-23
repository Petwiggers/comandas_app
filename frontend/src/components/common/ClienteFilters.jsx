import { useState, useEffect } from 'react';
import { TextField, Box, Button, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { Clear, FilterList } from '@mui/icons-material';
/*
opções de filtro de cliente
id, integer | (integer | null) - Filtrar por ID
nome, string | (string | null) - Filtrar por nome
cpf, string | (string | null) - Filtrar por CPF
telefone, string | (string | null) - Filtrar por telefone
*/
const ClienteFilters = ({ onFilter, onClear, filters: externalFilters = {} }) => {
    const [filters, setFilters] = useState({ id: '', nome: '', cpf: '', telefone: '' });

    // Sincronizar estado local com props externas
    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            ...externalFilters
        }));
    }, [externalFilters]);

    const handleInputChange = (field) => (event) => {
        const value = event.target.value;
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFilter = () => {
        // Limpar valores vazios antes de enviar
        const cleanedFilters = Object.keys(filters).reduce((acc, key) => {
            const value = filters[key];
            if (value !== '' && value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});
        onFilter(cleanedFilters);
    };

    const handleClear = () => {
        setFilters({ id: '', nome: '', cpf: '', telefone: '' });
        onClear();
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== '');

    return (
        <Accordion>
            <AccordionSummary expandIcon={<FilterList />}>
                <Typography variant="h6" component="div">
                    Opções de Filtros {hasActiveFilters && '(ativos)'}
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
                        <Box>
                            <TextField fullWidth label="ID" value={filters.id} onChange={handleInputChange('id')} placeholder="Buscar por ID..." type="number" size="small" />
                        </Box>
                        <Box>
                            <TextField fullWidth label="Nome" value={filters.nome} onChange={handleInputChange('nome')} placeholder="Buscar por nome..." size="small" />
                        </Box>
                        <Box>
                            <TextField fullWidth label="CPF" value={filters.cpf} onChange={handleInputChange('cpf')} placeholder="000.000.000-00" size="small" />
                        </Box>
                        <Box>
                            <TextField fullWidth label="Telefone" value={filters.telefone} onChange={handleInputChange('telefone')} placeholder="(00) 00000-0000" size="small" />
                        </Box>
                        <Box sx={{ gridColumn: { xs: '1 / -1', md: 'auto' }, display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Button variant="outlined" startIcon={<Clear />} onClick={handleClear} disabled={!hasActiveFilters} size="small">
                                Limpar
                            </Button>
                            <Button variant="contained" onClick={handleFilter} size="small">
                                Filtrar
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};

export default ClienteFilters;