
export interface Contato {
  id?: string;
  contrato_id?: string;
  nome: string;
  email: string;
  telefone: string;
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
  cliente_orgao: string;
  cnpj: string; // Novo campo
  estado: string;
  valor_global: number;
  status: 'Ativo' | 'Pendente' | 'Encerrado' | 'Cancelado';
  qtde_plataformas: number;
  qtde_elevadores: number;
  instalados_plataformas: number; // Novo campo: unidades instaladas
  instalados_elevadores: number;   // Novo campo: unidades instaladas
  objeto_contrato: string;
  data_inicio: string;
  data_encerramento: string;
  prazo_execucao: string; // Novo campo: prazo para execução/instalação
  data_conclusao_instalacao?: string; // Data de conclusão da instalação (início da garantia)
  prazo_garantia_dias?: number;       // Prazo de garantia em dias
  contatos?: Contato[];
  aditivos?: Aditivo[]; // Novo campo: aditivos contratuais
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
  Form = 'FORM'
}
