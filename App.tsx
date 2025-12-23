
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, Menu, X, LogOut, Bell, Loader2 } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ContractForm from './components/ContractForm';
import ContractList from './components/ContractList';
import Auth from './components/Auth';
import { Contrato, Contato, Screen } from './types';
import { supabase, supabaseService } from './supabaseClient';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Dashboard);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [editingContrato, setEditingContrato] = useState<Contrato | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadData();
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadData();
      } else {
        setContratos([]);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await supabaseService.getContratos();
      setContratos(data);
    } catch (error) {
      console.error("Erro ao carregar contratos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSaveContract = async (contrato: Contrato, contatos: Contato[]) => {
    try {
      await supabaseService.upsertContrato(contrato, contatos);
      await loadData();
      setCurrentScreen(Screen.List);
      setEditingContrato(null);
    } catch (error) {
      alert("Erro ao salvar contrato. Verifique o console.");
      console.error(error);
    }
  };

  const handleDeleteContract = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este contrato?")) {
      try {
        await supabaseService.deleteContrato(id);
        await loadData();
      } catch (error) {
        console.error("Erro ao excluir contrato:", error);
      }
    }
  };

  const handleEditContract = (contrato: Contrato) => {
    setEditingContrato(contrato);
    setCurrentScreen(Screen.Form);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="animate-spin text-blue-500" size={48} />
        </div>
      );
    }

    switch (currentScreen) {
      case Screen.Dashboard:
        return <Dashboard contratos={contratos} onNavigate={setCurrentScreen} />;
      case Screen.List:
        return (
          <ContractList
            contratos={contratos}
            onEdit={handleEditContract}
            onDelete={handleDeleteContract}
            onNew={() => { setEditingContrato(null); setCurrentScreen(Screen.Form); }}
          />
        );
      case Screen.Form:
        return (
          <ContractForm
            contratoToEdit={editingContrato}
            onSave={handleSaveContract}
            onCancel={() => { setEditingContrato(null); setCurrentScreen(Screen.List); }}
          />
        );
      default:
        return <Dashboard contratos={contratos} onNavigate={setCurrentScreen} />;
    }
  };

  const NavItem: React.FC<{ screen: Screen, icon: React.ReactNode, label: string }> = ({ screen, icon, label }) => (
    <button
      onClick={() => { setCurrentScreen(screen); setIsSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${currentScreen === screen
          ? 'bg-blue-600/10 text-blue-500 border-l-4 border-blue-600'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen flex bg-[#0f172a]">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#1e293b] border-r border-slate-800 p-6 space-y-8 sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <LayoutDashboard size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">ContractGov</span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem screen={Screen.Dashboard} icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem screen={Screen.List} icon={<FileText size={20} />} label="Meus Contratos" />
        </nav>

        <div className="pt-6 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}>
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[#1e293b] p-6 space-y-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LayoutDashboard size={24} className="text-blue-500" />
                <span className="text-xl font-bold text-white">GovManage</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400">
                <X size={24} />
              </button>
            </div>
            <nav className="space-y-2">
              <NavItem screen={Screen.Dashboard} icon={<LayoutDashboard size={20} />} label="Dashboard" />
              <NavItem screen={Screen.List} icon={<FileText size={20} />} label="Contratos" />
            </nav>
            <div className="pt-6 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-colors"
              >
                <LogOut size={20} />
                <span>Sair</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-[#1e293b]/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:block text-sm font-medium text-slate-400">
              {currentScreen === Screen.Dashboard && "Página Inicial"}
              {currentScreen === Screen.List && "Lista de Contratos"}
              {currentScreen === Screen.Form && "Formulário de Contrato"}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#1e293b]"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-slate-800 shadow-lg">
              {session.user.email?.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dynamic Screen Content */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {renderContent()}
        </div>

        {/* Footer */}
        <footer className="mt-auto py-6 px-8 border-t border-slate-800 text-center text-slate-500 text-xs">
          © {new Date().getFullYear()} ContractGov System — Painel de Gestão Governamental
        </footer>
      </main>
    </div>
  );
};

export default App;
