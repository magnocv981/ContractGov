
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
  endereco_numero?: string;
  endereco_bairro?: string;
  endereco_cep?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
  contato_nome?: string;
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
  cliente_id?: string;
  cliente_orgao: string;
  cnpj: string;
  estado: string;
  valor_global: number;
  status: 'Ativo' | 'Pendente' | 'Instalação Concluída' | 'Encerrado';
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
  observacoes?: Observacao[];
  cliente?: Cliente;
  // Novos campos
  numero_contrato?: string;
  endereco_instalacao?: string;
}

export interface Observacao {
  id: string;
  contrato_id: string;
  user_id: string;
  texto: string;
  created_at: string;
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
