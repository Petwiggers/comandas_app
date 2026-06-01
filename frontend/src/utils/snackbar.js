/**
* showSnackbar - Função utilitária global para notificações
*
* Esta função permite mostrar notificações Snackbar em qualquer componente
*
* Funcionalidades:
* - Uso simplificado: showSnackbar(message, severity)
* - Disponibilidade global: Em qualquer parte da aplicação
* - Severidades: success, error, warning, info
* - Comunicação via eventos customizados
*/
const showSnackbar = (message, severity = 'error') => {
    const text = typeof message === 'string'
        ? message
        : (message === undefined || message === null)
            ? ''
            : (typeof message === 'object' ? JSON.stringify(message) : String(message));
    // Emite evento customizado para o SnackbarGlobal
    const event = new CustomEvent('showSnackbar', {
        detail: { message: text, severity }
    });
    window.dispatchEvent(event);
};
export default showSnackbar;