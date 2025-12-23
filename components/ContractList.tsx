
import React, { useState } from 'react';
import { Edit2, Trash2, Search, Filter, LayoutGrid } from 'lucide-react';
import { Contrato, Screen } from '../types';

interface ContractListProps {
  contratos: Contrato[];
  onEdit: (contrato: Contrato) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

const ContractList: React.FC<ContractListProps> = ({ contratos, onEdit, onDelete, onNew }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContratos = contratos.filter(c =>
    c.cliente_orgao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.estado.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const getStatusBadge = (status: string) => {
    const styles = {
      'Ativo': 'bg-green-500/10 text-green-500 border-green-500/20',
      'Pendente': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      'Encerrado': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      'Cancelado': 'bg-red-500/10 text-red-500 border-red-500/20'
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles] || styles.Pendente}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <LayoutGrid className="text-blue-500" />
          Listagem de Contratos
        </h1>
        <button
          onClick={onNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all font-medium flex items-center gap-2 shadow-lg shadow-blue-900/20"
        >
          <Edit2 size={18} />
          Novo Contrato
        </button>
      </div>

      <div className="bg-[#1e293b] rounded-xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-800/20">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Buscar por cliente ou estado..."
              className="w-full bg-[#0f172a] border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Filter size={16} />
            <span>Total: <strong>{filteredContratos.length}</strong> contratos</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0f172a]/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Cliente / Órgão</th>
                <th className="px-6 py-4">UF</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Instalados / Total</th>
                <th className="px-6 py-4">Prazo Execução</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredContratos.length > 0 ? filteredContratos.map((contrato) => (
                <tr key={contrato.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{contrato.cliente_orgao}</div>
                    <div className="text-xs text-slate-500 truncate max-w-xs">{contrato.objeto_contrato || 'Sem descrição'}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-300 font-mono">{contrato.estado}</td>
                  <td className="px-6 py-4 font-semibold text-blue-400">{formatCurrency(contrato.valor_global)}</td>
                  <td className="px-6 py-4">{getStatusBadge(contrato.status)}</td>
                  <td className="px-6 py-4">
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between w-40">
                        <span className="text-slate-500">Elevadores:</span>
                        <span className="text-white font-medium">
                          <span className="text-green-500">{contrato.instalados_elevadores || 0}</span> / {contrato.qtde_elevadores}
                        </span>
                      </div>
                      <div className="flex justify-between w-40">
                        <span className="text-slate-500">Plataformas:</span>
                        <span className="text-white font-medium">
                          <span className="text-green-500">{contrato.instalados_plataformas || 0}</span> / {contrato.qtde_plataformas}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`text-sm font-medium ${contrato.prazo_execucao && new Date(contrato.prazo_execucao) < new Date() ? 'text-red-500' :
                          contrato.prazo_execucao && (new Date(contrato.prazo_execucao).getTime() - new Date().getTime()) < (15 * 24 * 60 * 60 * 1000) ? 'text-orange-500' : 'text-slate-300'
                        }`}>
                        {contrato.prazo_execucao ? new Date(contrato.prazo_execucao).toLocaleDateString('pt-BR') : 'N/A'}
                      </span>
                      {contrato.prazo_execucao && new Date(contrato.prazo_execucao) < new Date() && (
                        <span className="text-[10px] text-red-500 font-bold uppercase">Atrasado</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(contrato)}
                        className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => contrato.id && onDelete(contrato.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Nenhum contrato encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContractList;
