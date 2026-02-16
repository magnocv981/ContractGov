import React, { useState, useEffect } from 'react';
import { Save, Users, Building2, MapPin, Phone, Mail, MessageSquare, FilePlus } from 'lucide-react';
import { Cliente } from '../types';

interface CustomerFormProps {
    cliente?: Cliente;
    onSave: (cliente: Cliente, createContract?: boolean) => void;
    onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ cliente, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Cliente>({
        nome: '',
        cnpj: '',
        endereco: '',
        endereco_numero: '',
        endereco_bairro: '',
        endereco_cep: '',
        endereco_cidade: '',
        endereco_estado: '',
        contato_nome: '',
        telefone: '',
        whatsapp: '',
        email: ''
    });

    useEffect(() => {
        if (cliente) {
            setFormData({
                ...cliente
            });
        }
    }, [cliente]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent, createContract = false) => {
        e.preventDefault();
        onSave(formData, createContract);
    };

    const inputClasses = "w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600";

    return (
        <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Users className="text-blue-500" />
                    </div>
                    {cliente ? 'Editar Cliente' : 'Novo Cliente'}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="bg-[#1e293b] rounded-2xl border border-slate-800 p-6 md:p-8 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-slate-400 mb-2 block flex items-center gap-2">
                            <Building2 size={16} /> Nome / Razão Social
                        </label>
                        <input
                            type="text"
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            required
                            className={inputClasses}
                            placeholder="Ex: Secretaria de Saúde de São Paulo"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-400 mb-2 block flex items-center gap-2">
                            <Building2 size={16} /> CNPJ
                        </label>
                        <input
                            type="text"
                            name="cnpj"
                            value={formData.cnpj}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="00.000.000/0000-00"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-400 mb-2 block flex items-center gap-2">
                            <Users size={16} /> Contato
                        </label>
                        <input
                            type="text"
                            name="contato_nome"
                            value={formData.contato_nome}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="Nome do responsável"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-400 mb-2 block flex items-center gap-2">
                            <Mail size={16} /> Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="exemplo@email.com"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-400 mb-2 block flex items-center gap-2">
                            <Phone size={16} /> Telefone
                        </label>
                        <input
                            type="tel"
                            name="telefone"
                            value={formData.telefone}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="(00) 0000-0000"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-400 mb-2 block flex items-center gap-2">
                            <MessageSquare size={16} /> WhatsApp
                        </label>
                        <input
                            type="tel"
                            name="whatsapp"
                            value={formData.whatsapp}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="(00) 90000-0000"
                        />
                    </div>

                    <div className="md:col-span-2 mt-4 pt-4 border-t border-slate-700/50">
                        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                            <MapPin size={16} className="text-blue-500" /> Endereço
                        </h3>
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-slate-400 mb-2 block">Logradouro</label>
                        <input
                            type="text"
                            name="endereco"
                            value={formData.endereco}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="Rua, Avenida, etc."
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-400 mb-2 block">Número</label>
                        <input
                            type="text"
                            name="endereco_numero"
                            value={formData.endereco_numero}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="123"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-400 mb-2 block">Bairro</label>
                        <input
                            type="text"
                            name="endereco_bairro"
                            value={formData.endereco_bairro}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="Centro"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-400 mb-2 block">CEP</label>
                        <input
                            type="text"
                            name="endereco_cep"
                            value={formData.endereco_cep}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="00000-000"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4 md:col-span-1">
                        <div className="col-span-2">
                            <label className="text-sm font-medium text-slate-400 mb-2 block">Cidade</label>
                            <input
                                type="text"
                                name="endereco_cidade"
                                value={formData.endereco_cidade}
                                onChange={handleChange}
                                className={inputClasses}
                                placeholder="São Paulo"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-400 mb-2 block">UF</label>
                            <input
                                type="text"
                                name="endereco_estado"
                                value={formData.endereco_estado}
                                onChange={handleChange}
                                className={inputClasses}
                                placeholder="SP"
                                maxLength={2}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 mt-10">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-center order-3 sm:order-1"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e as any, true)}
                        className="flex items-center justify-center gap-2 bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600/20 px-6 py-3 rounded-lg transition-all font-semibold border border-emerald-500/20 order-2"
                    >
                        <FilePlus size={20} />
                        Salvar e Criar Contrato
                    </button>
                    <button
                        type="submit"
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-all font-semibold shadow-lg shadow-blue-900/40 order-1 sm:order-3"
                    >
                        <Save size={20} />
                        Salvar Cliente
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CustomerForm;
