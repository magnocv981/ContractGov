import { createClient } from '@supabase/supabase-js';
import { Contrato, Contato, Profile, Aditivo, Cliente } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseService = {
  // Clientes
  async getClientes(): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome');
    if (error) throw error;
    return data || [];
  },

  async upsertCliente(cliente: Cliente): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const clienteData = {
      ...cliente,
      user_id: user.id
    };

    if (cliente.id) {
      const { error } = await supabase
        .from('clientes')
        .update(clienteData)
        .eq('id', cliente.id);
      if (error) throw error;
      return cliente.id;
    } else {
      const { data, error } = await supabase
        .from('clientes')
        .insert(clienteData)
        .select()
        .single();
      if (error) throw error;
      return data.id;
    }
  },

  async deleteCliente(id: string): Promise<void> {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  getProfile: async (): Promise<Profile> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data as Profile;
  },

  getContratos: async (): Promise<Contrato[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    const { data, error } = await supabase
      .from('contratos')
      .select('*, contatos(*), aditivos(*), clientes(*), contrato_observacoes(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    // Map 'clientes' to 'cliente' object and 'contrato_observacoes' to 'observacoes'
    return (data || []).map(c => ({
      ...c,
      cliente: c.clientes,
      observacoes: c.contrato_observacoes
    })) as Contrato[];
  },

  upsertContrato: async (contrato: Contrato, contatos: Contato[], aditivos: Aditivo[] = []): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    const isEditing = !!contrato.id;
    const contractData: any = {
      ...contrato,
      user_id: user.id
    };

    // Converter strings vazias para null em campos de data para evitar erro do Postgres
    const dateFields = ['data_inicio', 'data_encerramento', 'prazo_execucao', 'data_conclusao_instalacao'];
    dateFields.forEach(field => {
      if (contractData[field] === '') {
        contractData[field] = null;
      }
    });

    // Remove relations from contract object if it exists to avoid error on insert/update
    delete contractData.contatos;
    delete contractData.aditivos;
    delete contractData.observacoes;
    delete contractData.contrato_observacoes;
    delete contractData.cliente;
    delete contractData.clientes;

    let contractId = contrato.id;

    if (isEditing) {
      const { error } = await supabase
        .from('contratos')
        .update(contractData)
        .eq('id', contractId);
      if (error) throw error;
    } else {
      const { data, error } = await supabase
        .from('contratos')
        .insert(contractData)
        .select()
        .single();
      if (error) throw error;
      contractId = data.id;
    }

    // Handle Contacts: Delete existing and re-insert
    if (isEditing) {
      const { error: deleteError } = await supabase
        .from('contatos')
        .delete()
        .eq('contrato_id', contractId);
      if (deleteError) throw deleteError;
    }

    if (contatos.length > 0) {
      const contactsToInsert = contatos.map(c => ({
        nome: c.nome,
        email: c.email,
        telefone: c.telefone,
        contrato_id: contractId
      }));
      const { error: contactsError } = await supabase
        .from('contatos')
        .insert(contactsToInsert);
      if (contactsError) throw contactsError;
    }

    // Handle Aditivos: Delete existing and re-insert
    if (isEditing) {
      const { error: deleteAditivosError } = await supabase
        .from('aditivos')
        .delete()
        .eq('contrato_id', contractId);
      if (deleteAditivosError) throw deleteAditivosError;
    }

    if (aditivos.length > 0) {
      const aditivosToInsert = aditivos.map(a => ({
        tipo: a.tipo,
        valor_aditivo: a.valor_aditivo,
        nova_data_encerramento: a.nova_data_encerramento === '' ? null : a.nova_data_encerramento,
        descricao: a.descricao,
        data_assinatura: a.data_assinatura === '' ? null : (a.data_assinatura || new Date().toISOString().split('T')[0]),
        contrato_id: contractId
      }));
      const { error: aditivosError } = await supabase
        .from('aditivos')
        .insert(aditivosToInsert);
      if (aditivosError) throw aditivosError;
    }
  },

  deleteContrato: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('contratos')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Observações
  async addObservacao(contratoId: string, texto: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('contrato_observacoes')
      .insert({
        contrato_id: contratoId,
        user_id: user.id,
        texto
      });
    if (error) throw error;
  }
};
