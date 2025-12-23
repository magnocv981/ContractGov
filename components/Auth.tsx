
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { LogIn, UserPlus, Mail, Lock, Loader2, AlertCircle, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert("Cadastro realizado! Verifique seu e-mail ou tente fazer login.");
                setIsLogin(true);
            }
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro na autenticação.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 font-sans relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[130px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[130px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
            </div>

            <div className="w-full max-w-lg relative z-10 transition-all duration-500 ease-in-out">
                {/* Branding / Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-2xl shadow-blue-500/20 mb-4 ring-1 ring-white/20 transform hover:scale-110 transition-transform duration-300">
                        <ShieldCheck className="text-white" size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                        Gov<span className="text-blue-500">Contract</span>
                    </h2>
                    <div className="h-1 w-12 bg-blue-600 rounded-full mt-1"></div>
                </div>

                <div className="bg-[#1e293b]/40 backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-extrabold text-white mb-3">
                            {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
                        </h1>
                        <p className="text-slate-400 text-sm max-w-[280px] mx-auto leading-relaxed">
                            {isLogin
                                ? "Insira suas credenciais para gerenciar contratos públicos com eficiência."
                                : "Junte-se a nós para uma gestão transparente e organizada de contratos."}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-4 duration-300">
                            <AlertCircle size={18} className="shrink-0" />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Endereço de E-mail</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors duration-300" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-950/40 border border-white/10 text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-300 placeholder:text-slate-600"
                                    placeholder="exemplo@gov.br"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Senha de Acesso</label>
                                {isLogin && (
                                    <button type="button" className="text-[10px] font-bold text-blue-500 uppercase tracking-wider hover:text-blue-400 transition-colors">
                                        Esqueceu a senha?
                                    </button>
                                )}
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors duration-300" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950/40 border border-white/10 text-white pl-12 pr-12 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-300 placeholder:text-slate-600"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative group overflow-hidden bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>{isLogin ? "Acessar Painel" : "Criar Minha Conta"}</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-white/5 text-center">
                        <p className="text-slate-500 text-sm mb-4">
                            {isLogin ? "Ainda não tem acesso?" : "Já possui registro?"}
                        </p>
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="group relative inline-flex items-center gap-2 text-white font-bold text-sm tracking-tight transition-all"
                        >
                            <span className="relative z-10">{isLogin ? "Solicitar Novo Cadastro" : "Fazer Login no Sistema"}</span>
                            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></div>
                            <UserPlus size={16} className="text-blue-500 group-hover:rotate-12 transition-transform" />
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold">
                        Ambiente Seguro & Monitorado • © {new Date().getFullYear()} GovContract
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};

export default Auth;
