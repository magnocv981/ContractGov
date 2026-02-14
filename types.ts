
export interface Contato {
  id?: string;
  contrato_id?: string;
  nome: string;
  email: string;
  telefone: string;
}

export interface Cliente {
  id?: string;
  nome: string;
  cnpj: string;
  endereco?: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  created_at?: string;
}

export interface Aditivo {
  id?: string;
  contrato_id: string;
  tipo: 'Valor' | 'Prazo' | 'Valor e Prazo' | 'Outros';
  valor_aditivo: number;
  nova_data_encerramento?: string;
  descricao?: string;
  data_assinatura?: string;
  created_at?: string;
}

export interface Contrato {
  id?: string;
  cliente_id?: string; // Novo campo
  cliente_orgao: string;
  cnpj: string;
  estado: string;
  valor_global: number;
  status: 'Ativo' | 'Pendente' | 'Encerrado' | 'Cancelado';
  qtde_plataformas: number;
  qtde_elevadores: number;
  instalados_plataformas: number;
  instalados_elevadores: number;
  objeto_contrato: string;
  data_inicio: string;
  data_encerramento: string;
  prazo_execucao: string;
  data_conclusao_instalacao?: string;
  prazo_garantia_dias?: number;
  contatos?: Contato[];
  aditivos?: Aditivo[];
  cliente?: Cliente; // Novo campo: relação com cliente
}

export type UserRole = 'admin' | 'user';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  updated_at?: string;
}

export enum Screen {
  Dashboard = 'DASHBOARD',
  List = 'LIST',
  Form = 'FORM',
  Customers = 'CUSTOMERS',
  CustomerForm = 'CUSTOMER_FORM'
}
