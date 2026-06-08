import { API_ENDPOINTS } from '../config/apiConfig';
import api from './api';

// Extrair apenas endpoints utilizados no service
const { RECEBIMENTO } = API_ENDPOINTS;

// Serviços de recebimento
export const recebimentoService = {
    // Dashboard de recebimentos (paginação)
    getDashboard: async (params = {}) => {
        const { skip = 0, limit = 100 } = params;
        const queryParams = new URLSearchParams();
        queryParams.append('skip', skip);
        queryParams.append('limit', limit);

        const response = await api.get(`${RECEBIMENTO.DASHBOARD}?${queryParams.toString()}`);
        return response.data;
    },

    // Detalhar comandas antes do pagamento. Recebe array ou string de ids
    getComandasDetalhe: async (comandasIds) => {
        const idsString = Array.isArray(comandasIds) ? comandasIds.join(',') : comandasIds;
        // Endpoint com placeholder :ids
        const endpoint = RECEBIMENTO.DETALHE.replace(':ids', idsString);

        const response = await api.get(endpoint);
        return response.data;
    },

    // Confirmar pagamento e criar recebimento completo
    postComplete: async (recebimentoData) => {
        const response = await api.post(RECEBIMENTO.RECEBER, recebimentoData);
        return response.data;
    },

    // Trazer comprovante completo de um recebimento
    getComprovante: async (recebimentoId) => {
        const endpoint = RECEBIMENTO.COMPROVANTE.replace(':id', recebimentoId);
        const response = await api.get(endpoint);
        return response.data;
    },
};

export default recebimentoService;
