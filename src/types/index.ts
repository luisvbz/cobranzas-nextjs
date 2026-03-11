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

export interface CustomerFormData {
    name: string;
    email?: string;
    phone?: string;
    document_type?: string;
    document_number?: string;
    notes?: string;
}

export interface Debt {
    id: number;
    customer_id: number;
    customer?: Customer;
    title: string;
    description: string | null;
    amount: string;
    currency: string;
    due_date: string;
    status: string;
    status_label?: string;
    created_at: string;
    updated_at: string;
    installments?: Installment[];
}

export interface DebtFormData {
    customer_id: number;
    title: string;
    description?: string;
    amount: number;
    currency: string;
    due_date: string;
    installments_count: number;
}

export interface Installment {
    id: number;
    debt_id: number;
    number: number;
    amount: string;
    due_date: string;
    status: string;
    status_label?: string;
    payment_link_token?: string;
    payments?: Payment[];
    created_at?: string;
}

export interface Payment {
    id: number;
    installment_id: number;
    amount: string;
    method?: string;
    payment_method?: string;
    transaction_id?: string;
    paid_at?: string;
    payment_date?: string;
    status: string;
    created_at?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
}

