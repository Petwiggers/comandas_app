export const useValidationRules = () => ({
    nome: { required: 'Nome é obrigatório' },
    cpf: { 
        required: 'CPF é obrigatório',
        maxLength: { value: 11, message: 'CPF deve conter no máximo 11 dígitos' },
    },
    telefone: {},
    matricula: { 
        required: 'Matrícula é obrigatória',
        pattern: { value: /^\d+$/, message: 'Matrícula deve conter apenas números' },
        maxLength: { value: 10, message: 'Matrícula deve ter no máximo 10 caracteres' }
    },
    senha: {
        required: 'Senha é obrigatória',
        minLength: { value: 6, message: 'Senha deve ter pelo menos 6 caracteres' }
    },
    grupo: { required: 'Grupo é obrigatório' },
    descricao: { 
        required: 'Descrição é obrigatória',
        maxLength: { value: 150, message: 'Descrição deve ter no máximo 150 caracteres' }
    },
    valor_unitario: {
        required: 'Valor unitário é obrigatório',
        min: { value: 0, message: 'Valor deve ser maior que 0' }
    },
});
export default useValidationRules;