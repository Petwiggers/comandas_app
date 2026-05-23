import { useState, useEffect } from 'react';
import {
    TextField,
    Box,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    MenuItem,
    Chip,
    Stack,
} from '@mui/material';
import { Clear, FilterList } from '@mui/icons-material';

/*
Opções de filtro de funcionário (API):
  id         - Optional[int]  - Filtrar por ID
  nome       - Optional[str]  - Filtrar por nome
  matricula  - Optional[str]  - Filtrar por matrícula
  cpf        - Optional[str]  - Filtrar por CPF
  grupo      - Optional[str]  - Filtrar por grupo: 1=Admin, 2=Balcão, 3=Caixa (separar por vírgula)
  telefone   - Optional[str]  - Filtrar por telefone
  skip       - int (ge=0)     - Número de registros para pular (paginação)
  limit      - int (ge=1, le=1000) - Número máximo de registros
*/

const GRUPO_OPTIONS = [
    { value: '1', label: 'Admin' },
    { value: '2', label: 'Balcão' },
    { value: '3', label: 'Caixa' },
];

const EMPTY_FILTERS = {
    id: '',
    nome: '',
    matricula: '',
    cpf: '',
    grupo: [],
    telefone: '',
};

const FuncionarioFilters = ({ onFilter, onClear, filters: externalFilters = {} }) => {
    const [filters, setFilters] = useState(EMPTY_FILTERS);

    // Sincronizar estado local com props externas
    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            ...externalFilters,
            grupo: Array.isArray(externalFilters.grupo)
                ? externalFilters.grupo
                : externalFilters.grupo
                ? String(externalFilters.grupo).split(',').map(v => v.trim())
                : [],
        }));
    }, [externalFilters]);

    const handleInputChange = (field) => (event) => {
        const value = event.target.value;
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleGrupoToggle = (value) => {
        setFilters(prev => {
            const current = prev.grupo || [];
            const exists = current.includes(value);
            return {
                ...prev,
                grupo: exists ? current.filter(v => v !== value) : [...current, value],
            };
        });
    };

    const handleFilter = () => {
        const cleanedFilters = {};

        if (filters.id !== '' && filters.id !== null) {
            cleanedFilters.id = parseInt(filters.id, 10);
        }
        if (filters.nome?.trim()) cleanedFilters.nome = filters.nome.trim();
        if (filters.matricula?.trim()) cleanedFilters.matricula = filters.matricula.trim();
        if (filters.cpf?.trim()) cleanedFilters.cpf = filters.cpf.trim();
        if (filters.telefone?.trim()) cleanedFilters.telefone = filters.telefone.trim();
        if (filters.grupo?.length > 0) {
            cleanedFilters.grupo = filters.grupo.join(',');
        }

        onFilter(cleanedFilters);
    };

    const handleClear = () => {
        setFilters(EMPTY_FILTERS);
        onClear();
    };

    const hasActiveFilters =
        Object.entries(filters).some(([key, value]) => {
            if (key === 'grupo') return Array.isArray(value) && value.length > 0;
            return value !== '' && value !== null && value !== undefined;
        });

    return (
        <Accordion>
            <AccordionSummary expandIcon={<FilterList />}>
                <Typography variant="h6" component="div">
                    Opções de Filtros {hasActiveFilters && '(ativos)'}
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Box sx={{ width: '100%' }}>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: 'repeat(2, 1fr)',
                                md: 'repeat(3, 1fr)',
                                lg: 'repeat(4, 1fr)',
                            },
                            gap: 2,
                        }}
                    >
                        {/* ID */}
                        <Box>
                            <TextField
                                fullWidth
                                label="ID"
                                value={filters.id}
                                onChange={handleInputChange('id')}
                                placeholder="Buscar por ID..."
                                type="number"
                                size="small"
                                slotProps={{ min: 1 }}
                            />
                        </Box>

                        {/* Nome */}
                        <Box>
                            <TextField
                                fullWidth
                                label="Nome"
                                value={filters.nome}
                                onChange={handleInputChange('nome')}
                                placeholder="Buscar por nome..."
                                size="small"
                            />
                        </Box>

                        {/* Matrícula */}
                        <Box>
                            <TextField
                                fullWidth
                                label="Matrícula"
                                value={filters.matricula}
                                onChange={handleInputChange('matricula')}
                                placeholder="Buscar por matrícula..."
                                size="small"
                            />
                        </Box>

                        {/* CPF */}
                        <Box>
                            <TextField
                                fullWidth
                                label="CPF"
                                value={filters.cpf}
                                onChange={handleInputChange('cpf')}
                                placeholder="000.000.000-00"
                                size="small"
                            />
                        </Box>

                        {/* Telefone */}
                        <Box>
                            <TextField
                                fullWidth
                                label="Telefone"
                                value={filters.telefone}
                                onChange={handleInputChange('telefone')}
                                placeholder="(00) 00000-0000"
                                size="small"
                            />
                        </Box>

                        {/* Grupo (multi-select via Chips) */}
                        <Box sx={{ gridColumn: { xs: '1 / -1', sm: 'span 2', lg: 'span 2' } }}>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                Grupo
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {GRUPO_OPTIONS.map(option => {
                                    const selected = (filters.grupo || []).includes(option.value);
                                    return (
                                        <Chip
                                            key={option.value}
                                            label={option.label}
                                            onClick={() => handleGrupoToggle(option.value)}
                                            color={selected ? 'primary' : 'default'}
                                            variant={selected ? 'filled' : 'outlined'}
                                            size="small"
                                            clickable
                                        />
                                    );
                                })}
                            </Stack>
                        </Box>

                        {/* Botões de ação */}
                        <Box
                            sx={{
                                gridColumn: { xs: '1 / -1', md: 'auto' },
                                display: 'flex',
                                gap: 1,
                                justifyContent: 'flex-end',
                                alignItems: 'flex-end',
                            }}
                        >
                            <Button
                                variant="outlined"
                                startIcon={<Clear />}
                                onClick={handleClear}
                                disabled={!hasActiveFilters}
                                size="small"
                            >
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

export default FuncionarioFilters;