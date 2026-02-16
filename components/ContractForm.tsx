
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, User, CheckCircle, ShieldCheck, Edit2, FilePlus, Users, ClipboardList } from 'lucide-react';
import { Contrato, Contato, Aditivo, Screen, Cliente } from '../types';
import { supabaseService } from '../supabaseClient';

interface ContractFormProps {
  contratoToEdit?: Contrato | null;
  onSave: (contrato: Contrato, contatos: Contato[], aditivos: Aditivo[]) => void;
  onCancel: () => void;
}

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const ADITIVO_TIPOS: ('Valor' | 'Prazo' | 'Valor e Prazo' | 'Outros')[] = ['Valor', 'Prazo', 'Valor e Prazo', 'Outros'];

const formatBRL = (val: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val);

const ContractForm: React.FC<ContractFormProps> = ({ contratoToEdit, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Contrato>({
    cliente_orgao: '',
    cnpj: '',
    estado: '',
    valor_global: 0,
    status: 'Pendente',
    qtde_plataformas: 0,
    qtde_elevadores: 0,
    instalados_plataformas: 0,
    instalados_elevadores: 0,
    objeto_contrato: '',
    data_inicio: new Date().toISOString().split('T')[0],
    data_encerramento: '',
    prazo_execucao: '',
    data_conclusao_instalacao: '',
    prazo_garantia_dias: 365,
  });

  const [isReadOnly, setIsReadOnly] = useState(!!contratoToEdit?.id);

  const [contatos, setContatos] = useState<Contato[]>([
    { nome: '', email: '', telefone: '' }
  ]);

  const [aditivos, setAditivos] = useState<Aditivo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await supabaseService.getClientes();
        setClientes(data);
      } catch (err) {
        console.error('Erro ao carregar clientes:', err);
      }
    };
    fetchClientes();
  }, []);

  useEffect(() => {
    if (contratoToEdit) {
      setFormData({
        ...contratoToEdit,
        cnpj: contratoToEdit.cnpj || '',
        instalados_plataformas: contratoToEdit.instalados_plataformas || 0,
        instalados_elevadores: contratoToEdit.instalados_elevadores || 0
      });
      if (contratoToEdit.contatos && contratoToEdit.contatos.length > 0) {
        setContatos(contratoToEdit.contatos);
      }
      if (contratoToEdit.aditivos && contratoToEdit.aditivos.length > 0) {
        setAditivos(contratoToEdit.aditivos);
      }
    }
  }, [contratoToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Logic for "Instalado em" (data_conclusao_instalacao)
    if (name === 'data_conclusao_instalacao' && value && !formData.data_conclusao_instalacao) {
      const prazo = window.prompt("Qual seria o prazo de garantia em dias?", "365");
      if (prazo) {
        setFormData(prev => ({ ...prev, [name]: value, prazo_garantia_dias: Number(prazo) }));
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: (name === 'valor_global' || name === 'qtde_plataformas' || name === 'qtde_elevadores' || name === 'instalados_plataformas' || name === 'instalados_elevadores' || name === 'prazo_garantia_dias')
        ? Number(value)
        : value
    }));
  };

  const handleContactChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newContatos = [...contatos];
    newContatos[index] = { ...newContatos[index], [name]: value };
    setContatos(newContatos);
  };

  const addContact = () => {
    setContatos([...contatos, { nome: '', email: '', telefone: '' }]);
  };

  const removeContact = (index: number) => {
    if (contatos.length > 1) {
      setContatos(contatos.filter((_, i) => i !== index));
    }
  };

  const handleAditivoChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newAditivos = [...aditivos];
    newAditivos[index] = {
      ...newAditivos[index],
      [name]: name === 'valor_aditivo' ? Number(value) : value
    };
    setAditivos(newAditivos);
  };

  const addAditivo = () => {
    setAditivos([...aditivos, {
      contrato_id: contratoToEdit?.id || '',
      tipo: 'Valor',
      valor_aditivo: 0,
      nova_data_encerramento: '',
      descricao: '',
      data_assinatura: new Date().toISOString().split('T')[0]
    }]);
  };

  const removeAditivo = (index: number) => {
    setAditivos(aditivos.filter((_, i) => i !== index));
  };

  const handleClienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clienteId = e.target.value;
    const selectedCliente = clientes.find(c => c.id === clienteId);

    setFormData(prev => ({
      ...prev,
      cliente_id: clienteId,
      cliente_orgao: selectedCliente ? selectedCliente.nome : prev.cliente_orgao,
      cnpj: selectedCliente && selectedCliente.cnpj ? selectedCliente.cnpj : prev.cnpj,
      estado: selectedCliente ? (selectedCliente.endereco_estado || '') : prev.estado,
      endereco_instalacao: selectedCliente ? [
        selectedCliente.endereco,
        selectedCliente.endereco_numero ? `Nº ${selectedCliente.endereco_numero}` : '',
        selectedCliente.endereco_bairro,
        selectedCliente.endereco_cidade,
        selectedCliente.endereco_estado
      ].filter(Boolean).join(', ') : prev.endereco_instalacao
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, contatos.filter(c => c.nome.trim() !== ''), aditivos);
  };

  const currentTotalValue = formData.valor_global + aditivos.reduce((sum, a) => sum + (a.valor_aditivo || 0), 0);

  const inputClasses = "w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600";
  const labelClasses = "block text-sm font-medium text-slate-400 mb-1.5";

  return (
    <div className="bg-[#1e293b] p-4 md:p-8 rounded-xl border border-slate-800 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-blue-500">{isReadOnly ? 'Visualizar' : (contratoToEdit ? 'Editar' : 'Novo')}</span> Contrato
        </h2>
        <div className="flex items-center gap-4">
          {isReadOnly && (
            <button
              type="button"
              onClick={() => setIsReadOnly(false)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all font-bold text-sm shadow-lg shadow-blue-900/40 border border-blue-400/30"
            >
              <Edit2 size={18} /> Editar Contrato
            </button>
          )}
          <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className={labelClasses}>Contrato</label>
            <input
              type="text"
              name="numero_contrato"
              value={formData.numero_contrato || ''}
              onChange={handleChange}
              placeholder="Ex: 123/2026"
              className={inputClasses}
              autoComplete="off"
              disabled={isReadOnly}
            />
          </div>

          <div className="lg:col-span-2">
            <label className={labelClasses}>
              <Users size={16} className="inline mr-2" /> Vincular Cliente Cadastrado (Opcional)
            </label>
            <select
              name="cliente_id"
              value={formData.cliente_id || ''}
              onChange={handleClienteChange}
              className={inputClasses}
              disabled={isReadOnly}
            >
              <option value="">-- Selecione um cliente ou digite abaixo --</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nome} ({c.cnpj})</option>
              ))}
            </select>
          </div>

          <div className="nd:col-span-1">
            <label className={labelClasses}>Estado</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className={inputClasses}
              required
              disabled={isReadOnly}
            >
              <option value="">Selecione o estado</option>
              {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className={labelClasses}>Cliente / Órgão Público</label>
            <input
              type="text"
              name="cliente_orgao"
              value={formData.cliente_orgao}
              onChange={handleChange}
              placeholder="Ex: Secretaria de Educação"
              className={inputClasses}
              required
              autoComplete="off"
              disabled={isReadOnly}
            />
          </div>

          <div className="md:col-span-1">
            <label className={labelClasses}>CNPJ</label>
            <input
              type="text"
              name="cnpj"
              value={formData.cnpj || ''}
              onChange={handleChange}
              placeholder="00.000.000/0000-00"
              className={inputClasses}
              autoComplete="off"
              disabled={isReadOnly}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClasses}>Endereço de Instalação</label>
            <input
              type="text"
              name="endereco_instalacao"
              value={formData.endereco_instalacao || ''}
              onChange={handleChange}
              placeholder="Rua, Número, Bairro, Cidade..."
              className={inputClasses}
              disabled={isReadOnly}
            />
          </div>

          <div>
            <label className={labelClasses}>Valor do Contrato (R$)</label>
            <div className="relative">
              {isReadOnly ? (
                <div className={`${inputClasses} pl-4 font-mono font-bold text-blue-400 bg-slate-900/50 flex items-center`}>
                  {formatBRL(formData.valor_global || 0)}
                </div>
              ) : (
                <>
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    name="valor_global"
                    value={formData.valor_global}
                    onChange={handleChange}
                    className={`${inputClasses} pl-12 font-mono font-bold text-blue-400`}
                    required
                    placeholder="0,00"
                  />
                </>
              )}
            </div>
          </div>

          <div>
            <label className={labelClasses}>Status do Contrato</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`${inputClasses} ${formData.status === 'Instalação Concluída' ? 'border-blue-500 text-blue-400' : ''}`}
              disabled={isReadOnly}
            >
              <option value="Pendente">Pendente</option>
              <option value="Ativo">Ativo</option>
              <option value="Instalação Concluída">Instalação Concluída</option>
              <option value="Encerrado">Encerrado</option>
            </select>
          </div>

          {aditivos.length > 0 && (
            <div className="md:col-span-1 border-l-2 border-emerald-500 pl-4 py-1">
              <label className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest block mb-1">Valor Total com Aditivos</label>
              <div className="text-xl font-black text-white font-mono">
                {formatBRL(currentTotalValue)}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-2 bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
            <div className="sm:col-span-2 mb-2">
              <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                <LayoutGrid size={16} /> Quantidades (Contratada vs. Instalada)
              </h3>
            </div>
            <div>
              <label className={labelClasses}>Plataforma (Qtde Contratada)</label>
              <input
                type="number"
                name="qtde_plataformas"
                value={formData.qtde_plataformas}
                onChange={handleChange}
                className={inputClasses}
                inputMode="numeric"
                disabled={isReadOnly}
              />
            </div>
            <div>
              <label className={labelClasses}>Plataforma (Qtde instalada)</label>
              <input
                type="number"
                name="instalados_plataformas"
                value={formData.instalados_plataformas}
                onChange={handleChange}
                className={`${inputClasses} border-green-900/50 focus:ring-green-500`}
                inputMode="numeric"
                disabled={isReadOnly}
              />
            </div>
            <div>
              <label className={labelClasses}>Elevador (Qtde Contratada)</label>
              <input
                type="number"
                name="qtde_elevadores"
                value={formData.qtde_elevadores}
                onChange={handleChange}
                className={inputClasses}
                inputMode="numeric"
                disabled={isReadOnly}
              />
            </div>
            <div>
              <label className={labelClasses}>Elevador (Qtde instalada)</label>
              <input
                type="number"
                name="instalados_elevadores"
                value={formData.instalados_elevadores}
                onChange={handleChange}
                className={`${inputClasses} border-green-900/50 focus:ring-green-500`}
                inputMode="numeric"
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className={labelClasses}>Objeto do Contrato</label>
            <textarea
              name="objeto_contrato"
              value={formData.objeto_contrato}
              onChange={handleChange}
              rows={3}
              className={inputClasses}
              placeholder="Descreva o objeto do contrato..."
              disabled={isReadOnly}
            />
          </div>

          <div>
            <label className={labelClasses}>Data Inicial do Contrato</label>
            <input
              type="date"
              name="data_inicio"
              value={formData.data_inicio}
              onChange={handleChange}
              className={inputClasses}
              required
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className={labelClasses}>Data de Encerramento do Contrato</label>
            <input
              type="date"
              name="data_encerramento"
              value={formData.data_encerramento}
              onChange={handleChange}
              className={inputClasses}
              required
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className={labelClasses}>Prazo Estimado para Instalação</label>
            <input
              type="date"
              name="prazo_execucao"
              value={formData.prazo_execucao}
              onChange={handleChange}
              className={`${inputClasses} border-orange-900/50 focus:ring-orange-500`}
              disabled={isReadOnly}
            />
          </div>

          {(formData.status === 'Instalação Concluída' || formData.data_conclusao_instalacao) && (
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-900/10 p-5 rounded-xl border border-blue-500/40 animate-in fade-in zoom-in-95 duration-300">
              <div className="md:col-span-2 flex items-center gap-2 mb-1">
                <ShieldCheck size={20} className="text-blue-400" />
                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">Controle de Garantia do Equipamento</h3>
              </div>

              <div>
                <label className={labelClasses}>Data da Conclusão da Instalação</label>
                <input
                  type="date"
                  name="data_conclusao_instalacao"
                  value={formData.data_conclusao_instalacao || ''}
                  onChange={handleChange}
                  className={`${inputClasses} border-blue-900/50 focus:ring-blue-500`}
                  disabled={isReadOnly}
                  required={formData.status === 'Instalação Concluída'}
                />
              </div>

              <div>
                <label className={labelClasses}>Dias da Cobertura da Garantia</label>
                <input
                  type="number"
                  name="prazo_garantia_dias"
                  value={formData.prazo_garantia_dias || ''}
                  onChange={handleChange}
                  placeholder="Ex: 365"
                  className={`${inputClasses} border-blue-900/50 focus:ring-blue-500`}
                  disabled={isReadOnly}
                  required={formData.status === 'Instalação Concluída'}
                />
              </div>
            </div>
          )}
        </div>

        {/* Section: Observações / Histórico */}
        <div className="mt-10 pt-8 border-t border-slate-800">
          <h3 className="text-lg font-semibold text-blue-400 flex items-center gap-2 mb-4">
            <ClipboardList size={20} />
            Observações (Histórico do Contrato)
          </h3>

          <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {(!formData.observacoes || formData.observacoes.length === 0) ? (
              <div className="text-center py-6 bg-[#0f172a]/20 rounded-xl border border-dashed border-slate-800 text-slate-500 text-sm">
                Nenhuma observação registrada.
              </div>
            ) : (
              formData.observacoes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((obs) => (
                <div key={obs.id} className="bg-[#0f172a]/50 p-4 rounded-lg border border-slate-800/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                      {new Date(obs.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{obs.texto}</p>
                </div>
              ))
            )}
          </div>

          {!isReadOnly && (
            <div className="flex gap-2">
              <textarea
                id="new-observation"
                placeholder="Adicione um fato importante (ex: Contato com gestor feito em...)"
                className={`${inputClasses} min-h-[80px]`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    const el = e.currentTarget;
                    if (el.value.trim() && contratoToEdit?.id) {
                      supabaseService.addObservacao(contratoToEdit.id, el.value.trim()).then(() => {
                        el.value = '';
                        // Refresh logic would go here or via re-fetch in parent
                        alert('Observação adicionada com sucesso!');
                      });
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('new-observation') as HTMLTextAreaElement;
                  if (el.value.trim() && contratoToEdit?.id) {
                    supabaseService.addObservacao(contratoToEdit.id, el.value.trim()).then(() => {
                      el.value = '';
                      alert('Observação adicionada com sucesso!');
                    });
                  } else if (!contratoToEdit?.id) {
                    alert('Salve o contrato antes de adicionar observações.');
                  }
                }}
                className="bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 px-4 rounded-lg border border-blue-500/20 transition-all font-bold text-sm"
              >
                Salvar Recado
              </button>
            </div>
          )}
          <p className="text-[10px] text-slate-500 mt-2">Pressione Ctrl + Enter para salvar rapidamente.</p>
        </div>

        {/* Section: Aditivos */}
        <div className="mt-10 pt-8 border-t border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-emerald-400 flex items-center gap-2">
              <FilePlus size={20} />
              Termos Aditivos (Valor / Prazo)
            </h3>
            {!isReadOnly && (
              <button
                type="button"
                onClick={addAditivo}
                className="flex items-center gap-1.5 text-sm font-medium bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600/20 px-3 py-1.5 rounded-lg transition-all"
              >
                <Plus size={16} /> Novo Aditivo
              </button>
            )}
          </div>

          <div className="space-y-4">
            {aditivos.length === 0 ? (
              <div className="text-center py-6 bg-[#0f172a]/20 rounded-xl border border-dashed border-slate-800 text-slate-500 text-sm">
                Nenhum termo aditivo registrado para este contrato.
              </div>
            ) : aditivos.map((aditivo, index) => (
              <div key={index} className="flex flex-col gap-4 bg-[#0f172a]/50 p-5 rounded-xl border border-emerald-500/20 relative group hover:border-emerald-500/40 transition-all">
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => removeAditivo(index)}
                    className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Tipo de Aditivo</label>
                    <select
                      name="tipo"
                      value={aditivo.tipo}
                      onChange={(e) => handleAditivoChange(index, e)}
                      className={inputClasses}
                      disabled={isReadOnly}
                    >
                      {ADITIVO_TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Valor Aditivo (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="valor_aditivo"
                      value={aditivo.valor_aditivo}
                      onChange={(e) => handleAditivoChange(index, e)}
                      placeholder="0,00"
                      className={`${inputClasses} font-mono font-bold text-emerald-400`}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Nova Data Encerramento</label>
                    <input
                      type="date"
                      name="nova_data_encerramento"
                      value={aditivo.nova_data_encerramento || ''}
                      onChange={(e) => handleAditivoChange(index, e)}
                      className={inputClasses}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Data Assinatura</label>
                    <input
                      type="date"
                      name="data_assinatura"
                      value={aditivo.data_assinatura ? aditivo.data_assinatura.split('T')[0] : ''}
                      onChange={(e) => handleAditivoChange(index, e)}
                      className={inputClasses}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="text-xs text-slate-500 mb-1 block">Descrição do Aditivo</label>
                    <textarea
                      name="descricao"
                      value={aditivo.descricao || ''}
                      onChange={(e) => handleAditivoChange(index, e)}
                      rows={2}
                      placeholder="Descreva o motivo ou detalhes do aditivo..."
                      className={inputClasses}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
              <User size={20} />
              Contatos Vinculados
            </h3>
            {!isReadOnly && (
              <button
                type="button"
                onClick={addContact}
                className="flex items-center gap-1.5 text-sm font-medium bg-green-600/10 text-green-500 hover:bg-green-600/20 px-3 py-1.5 rounded-lg transition-all"
              >
                <Plus size={16} /> Adicionar Contato
              </button>
            )}
          </div>

          <div className="space-y-4">
            {contatos.map((contato, index) => (
              <div key={index} className="flex flex-col gap-4 bg-[#0f172a]/50 p-4 rounded-xl border border-slate-800/50 relative">
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => removeContact(index)}
                    className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Nome</label>
                    <input
                      type="text"
                      name="nome"
                      value={contato.nome}
                      onChange={(e) => handleContactChange(index, e)}
                      placeholder="Nome do contato"
                      className={inputClasses}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={contato.email}
                      onChange={(e) => handleContactChange(index, e)}
                      placeholder="email@empresa.com"
                      className={inputClasses}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Telefone</label>
                    <input
                      type="tel"
                      name="telefone"
                      value={contato.telefone}
                      onChange={(e) => handleContactChange(index, e)}
                      placeholder="(00) 00000-0000"
                      className={inputClasses}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 mt-10">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-center order-2 sm:order-1"
          >
            {isReadOnly ? 'Voltar' : 'Cancelar'}
          </button>
          {!isReadOnly && (
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-all font-semibold shadow-lg shadow-blue-900/40 text-lg order-1 sm:order-2"
            >
              <Save size={20} />
              Salvar Contrato
            </button>
          )}
        </div>
      </form >
    </div >
  );
};

// Icon needed by new section
const LayoutGrid: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
);

export default ContractForm;
