import React, { useState } from 'react';
import { Edit2, Trash2, Search, Filter, Users, Phone, Mail, Building2, FilePlus } from 'lucide-react';
import { Cliente } from '../types';

interface CustomerListProps {
    clientes: Cliente[];
    onEdit: (cliente: Cliente) => void;
    onDelete: (id: string) => void;
    onNew: () => void;
    onNewContract: (cliente: Cliente) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ clientes, onEdit, onDelete, onNew, onNewContract }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClientes = clientes.filter(c =>
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.cnpj && c.cnpj.includes(searchTerm))
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Users className="text-blue-500" />
                    Cadastro de Clientes
                </h1>
                <button
                    onClick={onNew}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all font-medium flex items-center gap-2 shadow-lg shadow-blue-900/20"
                >
                    <Building2 size={18} />
                    Novo Cliente
                </button>
            </div>

            <div className="bg-[#1e293b] rounded-xl border border-slate-800 shadow-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-800/20">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou CNPJ..."
                            className="w-full bg-[#0f172a] border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Filter size={16} />
                        <span>Total: <strong>{filteredClientes.length}</strong> clientes</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#0f172a]/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Cliente / CNPJ</th>
                                <th className="px-6 py-4">Contato</th>
                                <th className="px-6 py-4">Endereço</th>
                                <th className="px-6 py-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredClientes.length > 0 ? filteredClientes.map((cliente) => (
                                <tr
                                    key={cliente.id}
                                    className="hover:bg-slate-800/60 transition-colors cursor-pointer group"
                                    onClick={() => onEdit(cliente)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white group-hover:text-blue-400 transition-colors">{cliente.nome}</div>
                                        <div className="text-xs text-slate-500">{cliente.cnpj || 'Sem CNPJ'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs space-y-1">
                                            {cliente.email && (
                                                <div className="flex items-center gap-2 text-slate-300">
                                                    <Mail size={12} className="text-slate-500" />
                                                    {cliente.email}
                                                </div>
                                            )}
                                            {cliente.telefone && (
                                                <div className="flex items-center gap-2 text-slate-300">
                                                    <Phone size={12} className="text-slate-500" />
                                                    {cliente.telefone}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        {cliente.endereco || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onNewContract(cliente); }}
                                                className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                                title="Novo Contrato para este cliente"
                                            >
                                                <FilePlus size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onEdit(cliente); }}
                                                className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                title="Editar Cliente"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); cliente.id && onDelete(cliente.id); }}
                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Excluir Cliente"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        Nenhum cliente encontrado.
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

export default CustomerList;
