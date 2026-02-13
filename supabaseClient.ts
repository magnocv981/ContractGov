import { createClient } from '@supabase/supabase-js';
import { Contrato, Contato, Profile, Aditivo } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseService = {
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
      .select('*, contatos(*), aditivos(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Contrato[];
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
  }
};
