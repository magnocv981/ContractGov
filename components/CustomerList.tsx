import React, { useState } from 'react';
import { Edit2, Trash2, Search, Filter, Users, Phone, Mail, Building2, FilePlus, Printer, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { Cliente, Contrato } from '../types';

interface CustomerListProps {
    clientes: Cliente[];
    contratos: Contrato[];
    onEdit: (cliente: Cliente) => void;
    onDelete: (id: string) => void;
    onNew: () => void;
    onNewContract: (cliente: Cliente) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ clientes, contratos, onEdit, onDelete, onNew, onNewContract }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleRow = (id: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const handlePrint = (cliente: Cliente) => {
        const clientContracts = contratos.filter(c => c.cliente_id === cliente.id);
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const addressStr = [
            cliente.endereco,
            cliente.endereco_numero ? `Nº ${cliente.endereco_numero}` : '',
            cliente.endereco_bairro,
            cliente.endereco_cep ? `CEP: ${cliente.endereco_cep}` : '',
            cliente.endereco_cidade,
            cliente.endereco_estado
        ].filter(Boolean).join(', ');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Ficha do Cliente - ${cliente.nome}</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; color: #333; }
                        h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
                        h2 { color: #475569; margin-top: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
                        .info-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-top: 20px; }
                        .info-item { margin-bottom: 10px; }
                        .label { font-weight: bold; color: #64748b; font-size: 0.9rem; }
                        .value { font-size: 1.1rem; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
                        th { background-color: #f8fafc; color: #64748b; }
                        @media print {
                            button { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <h1>Ficha Cadastral do Cliente</h1>
                    <div class="info-grid">
                        <div class="info-item"><div class="label">Cliente / Órgão:</div><div class="value">${cliente.nome}</div></div>
                        <div class="info-item"><div class="label">CNPJ:</div><div class="value">${cliente.cnpj || 'N/A'}</div></div>
                        <div class="info-item"><div class="label">Contato:</div><div class="value">${cliente.contato_nome || 'N/A'}</div></div>
                        <div class="info-item"><div class="label">Email:</div><div class="value">${cliente.email || 'N/A'}</div></div>
                        <div class="info-item"><div class="label">Telefone:</div><div class="value">${cliente.telefone || 'N/A'}</div></div>
                        <div class="info-item"><div class="label">WhatsApp:</div><div class="value">${cliente.whatsapp || 'N/A'}</div></div>
                    </div>
                    <div class="info-item" style="margin-top: 20px;">
                        <div class="label">Endereço:</div>
                        <div class="value">${addressStr || 'N/A'}</div>
                    </div>

                    <h2>Contratos Vinculados</h2>
                    ${clientContracts.length > 0 ? `
                        <table>
                            <thead>
                                <tr>
                                    <th>Objeto</th>
                                    <th>Valor</th>
                                    <th>Status</th>
                                    <th>Encerramento</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${clientContracts.map(c => `
                                    <tr>
                                        <td>${c.objeto_contrato || 'N/A'}</td>
                                        <td>${c.valor_global.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                        <td>${c.status}</td>
                                        <td>${c.data_encerramento ? new Date(c.data_encerramento).toLocaleDateString('pt-BR') : 'N/A'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p>Nenhum contrato cadastrado para este cliente.</p>'}
                    
                    <script>
                        window.onload = () => { window.print(); };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

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
                                <th className="px-6 py-4">Localização</th>
                                <th className="px-6 py-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredClientes.length > 0 ? filteredClientes.map((cliente) => {
                                const clientContracts = contratos.filter(c => c.cliente_id === cliente.id);
                                const isExpanded = expandedRows.has(cliente.id || '');

                                return (
                                    <React.Fragment key={cliente.id}>
                                        <tr
                                            className="hover:bg-slate-800/60 transition-colors cursor-pointer group"
                                            onClick={() => cliente.id && toggleRow(cliente.id)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {isExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                                                    <div>
                                                        <div className="font-medium text-white group-hover:text-blue-400 transition-colors">{cliente.nome}</div>
                                                        <div className="text-xs text-slate-500">{cliente.cnpj || 'Sem CNPJ'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs space-y-1">
                                                    {cliente.contato_nome && (
                                                        <div className="font-medium text-slate-200 mb-1">{cliente.contato_nome}</div>
                                                    )}
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
                                                {cliente.endereco_cidade ? `${cliente.endereco_cidade} - ${cliente.endereco_estado || ''}` : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handlePrint(cliente); }}
                                                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                                        title="Imprimir Cadastro"
                                                    >
                                                        <Printer size={18} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onNewContract(cliente); }}
                                                        className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                                        title="Novo Contrato"
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
                                        {isExpanded && (
                                            <tr className="bg-slate-900/40 border-l-4 border-l-blue-600/50 animate-in slide-in-from-left-2 duration-300">
                                                <td colSpan={4} className="px-8 py-6">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                                                <FileText size={16} className="text-blue-500" />
                                                                Contratos do Cliente ({clientContracts.length})
                                                            </h4>
                                                        </div>

                                                        {clientContracts.length > 0 ? (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                {clientContracts.map(contrato => (
                                                                    <div key={contrato.id} className="bg-[#1e293b] border border-slate-800 p-4 rounded-xl shadow-sm hover:border-slate-700 transition-all group/card relative overflow-hidden">
                                                                        <div className={`absolute top-0 right-0 w-1 h-full ${contrato.status === 'Ativo' ? 'bg-emerald-500' :
                                                                                contrato.status === 'Pendente' ? 'bg-amber-500' :
                                                                                    'bg-slate-600'
                                                                            }`} />
                                                                        <div className="font-medium text-white text-sm mb-1 truncate pr-2" title={contrato.objeto_contrato}>
                                                                            {contrato.objeto_contrato || 'Sem objeto definido'}
                                                                        </div>
                                                                        <div className="flex items-center justify-between text-xs mt-3">
                                                                            <span className="text-slate-500">Valor:</span>
                                                                            <span className="text-blue-400 font-semibold">{contrato.valor_global.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between text-xs mt-1">
                                                                            <span className="text-slate-500">Status:</span>
                                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${contrato.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-500' :
                                                                                    contrato.status === 'Pendente' ? 'bg-amber-500/10 text-amber-500' :
                                                                                        'bg-slate-800 text-slate-400'
                                                                                }`}>{contrato.status}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-6 bg-[#0f172a] rounded-xl border border-dashed border-slate-800">
                                                                <p className="text-slate-500 text-sm">Nenhum contrato encontrado para este cliente.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            }) : (
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
