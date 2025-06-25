// Mercado Pago webhook types
export interface PaymentWebhookData {
    id: string;
    action: string;
    apiVersion: string;
    application_id: string;
    date_created: string;
    live_mode: boolean;
    type: string;
    user_id: string;
    data: {
        id: string;
    };
}
