
import { createClient } from '@supabase/supabase-js';
import { Contrato, Contato } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseService = {
  getContratos: async (): Promise<Contrato[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    const { data, error } = await supabase
      .from('contratos')
      .select('*, contatos(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Contrato[];
  },

  upsertContrato: async (contrato: Contrato, contatos: Contato[]): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    const isEditing = !!contrato.id;
    const contractData = {
      ...contrato,
      user_id: user.id
    };
    
    // Remove contatos from contract object if it exists to avoid error on insert/update
    delete contractData.contatos;

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

    // Handle Contacts: Delete existing and re-insert (simple approach for MVP)
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
  },

  deleteContrato: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('contratos')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
