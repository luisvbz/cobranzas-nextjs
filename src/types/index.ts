export interface Customer {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    document_type: string | null;
    document_number: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    debts?: Debt[];
    payments?: Payment[];
}

export interface Debt {
    id: number;
    customer_id: number;
    description: string;
    total_amount: string;
    currency: string;
    due_date: string;
    status: string;
    created_at: string;
    installments?: Installment[];
}

export interface Installment {
    id: number;
    debt_id: number;
    amount: string;
    due_date: string;
    status: string;
}

export interface Payment {
    id: number;
    customer_id: number;
    installment_id: number;
    amount: string;
    payment_date: string;
    payment_method: string;
    status: string;
}
