import { API_ENDPOINTS } from '../config/apiConfig';
import api from './api';

// Extrair apenas endpoints utilizados no service
const { FUNCIONARIO } = API_ENDPOINTS;

// Serviços de funcionários
export const funcionarioService = {
    // Listar todos os funcionários com filtros e paginação
    list: async (params = {}) => {
        const { skip = 0, limit = 100, id, nome, matricula, cpf, grupo, telefone } = params;
        const queryParams = new URLSearchParams();

        // paginação
        queryParams.append('skip', skip);
        queryParams.append('limit', limit);

        // filtros
        if (id !== undefined && id !== null) queryParams.append('id', id);
        if (nome !== undefined && nome !== null && nome !== '') queryParams.append('nome', nome);
        if (matricula !== undefined && matricula !== null && matricula !== '') queryParams.append('matricula', matricula);
        if (cpf !== undefined && cpf !== null && cpf !== '') queryParams.append('cpf', cpf);
        if (grupo !== undefined && grupo !== null && grupo !== '') queryParams.append('grupo', grupo);
        if (telefone !== undefined && telefone !== null && telefone !== '') queryParams.append('telefone', telefone);

        // executar requisição GET com query params
        // exemplo de url: /funcionario?skip=0&limit=100&nome=João&grupo=1,2
        const response = await api.get(`${FUNCIONARIO.LIST}?${queryParams.toString()}`);
        return response.data;
    },

    // Buscar funcionário por ID
    getById: async (id) => {
        const response = await api.get(FUNCIONARIO.GET.replace(':id', id));
        return response.data;
    },

    // Criar novo funcionário
    create: async (funcionarioData) => {
        const response = await api.post(FUNCIONARIO.CREATE, funcionarioData);
        return response.data;
    },

    // Atualizar funcionário existente
    update: async (id, funcionarioData) => {
        const response = await api.put(FUNCIONARIO.UPDATE.replace(':id', id), funcionarioData);
        return response.data;
    },

    // Excluir funcionário
    delete: async (id) => {
        await api.delete(FUNCIONARIO.DELETE.replace(':id', id));
        return { success: true };
    },

    // Verificar se CPF já existe
    checkCpfExists: async (cpf, excludeId = null) => {
        const params = { cpf };
        if (excludeId) {
            params.exclude_id = excludeId;
        }
        const response = await api.get(`${FUNCIONARIO.LIST}?${new URLSearchParams(params).toString()}`);
        const funcionarios = response.data || response;
        return funcionarios.length > 0 ? funcionarios[0] : null;
    },
};

export default funcionarioService;