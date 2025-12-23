
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, User, CheckCircle } from 'lucide-react';
import { Contrato, Contato, Screen } from '../types';

interface ContractFormProps {
  contratoToEdit?: Contrato | null;
  onSave: (contrato: Contrato, contatos: Contato[]) => void;
  onCancel: () => void;
}

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const ContractForm: React.FC<ContractFormProps> = ({ contratoToEdit, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Contrato>({
    cliente_orgao: '',
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
  });

  const [contatos, setContatos] = useState<Contato[]>([
    { nome: '', email: '', telefone: '' }
  ]);

  useEffect(() => {
    if (contratoToEdit) {
      setFormData({
        ...contratoToEdit,
        instalados_plataformas: contratoToEdit.instalados_plataformas || 0,
        instalados_elevadores: contratoToEdit.instalados_elevadores || 0
      });
      if (contratoToEdit.contatos && contratoToEdit.contatos.length > 0) {
        setContatos(contratoToEdit.contatos);
      }
    }
  }, [contratoToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'valor_global' || name === 'qtde_plataformas' || name === 'qtde_elevadores' || name === 'instalados_plataformas' || name === 'instalados_elevadores')
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, contatos.filter(c => c.nome.trim() !== ''));
  };

  const inputClasses = "w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600";
  const labelClasses = "block text-sm font-medium text-slate-400 mb-1.5";

  return (
    <div className="bg-[#1e293b] p-8 rounded-xl border border-slate-800 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-blue-500">{contratoToEdit ? 'Editar' : 'Novo'}</span> Contrato
        </h2>
        <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-1">
            <label className={labelClasses}>Cliente / Órgão</label>
            <input
              type="text"
              name="cliente_orgao"
              value={formData.cliente_orgao}
              onChange={handleChange}
              placeholder="Ex: Secretaria de Educação"
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label className={labelClasses}>Estado</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className={inputClasses}
              required
            >
              <option value="">Selecione o estado</option>
              {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClasses}>Valor Global (R$)</label>
            <input
              type="number"
              step="0.01"
              name="valor_global"
              value={formData.valor_global}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label className={labelClasses}>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="Ativo">Ativo</option>
              <option value="Pendente">Pendente</option>
              <option value="Encerrado">Encerrado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 md:col-span-2 bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
            <div className="col-span-2 mb-2">
              <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                <LayoutGrid size={16} /> Quantidades do Contrato vs. Instaladas
              </h3>
            </div>
            <div>
              <label className={labelClasses}>Total Plataformas</label>
              <input
                type="number"
                name="qtde_plataformas"
                value={formData.qtde_plataformas}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>Plataformas Instaladas</label>
              <input
                type="number"
                name="instalados_plataformas"
                value={formData.instalados_plataformas}
                onChange={handleChange}
                className={`${inputClasses} border-green-900/50 focus:ring-green-500`}
              />
            </div>
            <div>
              <label className={labelClasses}>Total Elevadores</label>
              <input
                type="number"
                name="qtde_elevadores"
                value={formData.qtde_elevadores}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>Elevadores Instalados</label>
              <input
                type="number"
                name="instalados_elevadores"
                value={formData.instalados_elevadores}
                onChange={handleChange}
                className={`${inputClasses} border-green-900/50 focus:ring-green-500`}
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
            />
          </div>

          <div>
            <label className={labelClasses}>Data de Início</label>
            <input
              type="date"
              name="data_inicio"
              value={formData.data_inicio}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label className={labelClasses}>Data de Encerramento</label>
            <input
              type="date"
              name="data_encerramento"
              value={formData.data_encerramento}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label className={labelClasses}>Prazo de Execução / Instalação</label>
            <input
              type="date"
              name="prazo_execucao"
              value={formData.prazo_execucao}
              onChange={handleChange}
              className={`${inputClasses} border-orange-900/50 focus:ring-orange-500`}
              required
            />
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
              <User size={20} />
              Contatos Vinculados
            </h3>
            <button
              type="button"
              onClick={addContact}
              className="flex items-center gap-1.5 text-sm font-medium bg-green-600/10 text-green-500 hover:bg-green-600/20 px-3 py-1.5 rounded-lg transition-all"
            >
              <Plus size={16} /> Adicionar Contato
            </button>
          </div>

          <div className="space-y-3">
            {contatos.map((contato, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end bg-[#0f172a]/50 p-4 rounded-xl border border-slate-800/50">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Nome</label>
                  <input
                    type="text"
                    name="nome"
                    value={contato.nome}
                    onChange={(e) => handleContactChange(index, e)}
                    placeholder="Nome do contato"
                    className={inputClasses}
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
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">Telefone</label>
                    <input
                      type="text"
                      name="telefone"
                      value={contato.telefone}
                      onChange={(e) => handleContactChange(index, e)}
                      placeholder="(00) 00000-0000"
                      className={inputClasses}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeContact(index)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-10">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg transition-all font-semibold shadow-lg shadow-blue-900/40"
          >
            <Save size={18} />
            Salvar Contrato
          </button>
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
