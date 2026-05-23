import { API_ENDPOINTS } from '../config/apiConfig';
import api from './api';
// Extrair apenas endpoints utilizados no service
const { CLIENTE } = API_ENDPOINTS;
// Serviços de clientes
export const clienteService = {
    // Listar todos os clientes com filtros e paginação
    list: async (params = {}) => {
        const { skip = 0, limit = 100, id, nome, cpf, telefone } = params;
        const queryParams = new URLSearchParams(); // Construir query params, para passar como parâmetros na URL
        // paginação
        queryParams.append('skip', skip);
        queryParams.append('limit', limit);
        // filtros
        if (id !== undefined && id !== null) queryParams.append('id', id);
        if (nome !== undefined && nome !== null && nome !== '') queryParams.append('nome', nome);
        if (cpf !== undefined && cpf !== null && cpf !== '') queryParams.append('cpf', cpf);
        if (telefone !== undefined && telefone !== null && telefone !== '') queryParams.append('telefone', telefone);
        // executar requisição GET com query params - exemplo de url: /cliente?skip=0&limit=100&id=1&nome=João&cpf=000.000.000-00&telefone=(00)00000-0000
        const response = await api.get(`${CLIENTE.LIST}?${queryParams.toString()}`);
        return response.data;
    },
    // Buscar cliente por ID
    getById: async (id) => {
        const response = await api.get(CLIENTE.GET.replace(':id', id));
        return response.data;
    },
    // Criar novo cliente
    create: async (clienteData) => {
        const response = await api.post(CLIENTE.CREATE, clienteData);
        return response.data;
    },
    // Atualizar cliente existente
    update: async (id, clienteData) => {
        const response = await api.put(CLIENTE.UPDATE.replace(':id', id), clienteData);
        return response.data;
    },
    // Excluir cliente
    delete: async (id) => {
        await api.delete(CLIENTE.DELETE.replace(':id', id));
        return { success: true };
    },
};

export default clienteService;