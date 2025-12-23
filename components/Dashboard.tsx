
import React, { useMemo } from 'react';
import {
  FileText,
  BarChart3,
  Briefcase,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Download,
  PackageCheck,
  ClipboardList,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Contrato, Screen } from '../types';

interface DashboardProps {
  contratos: Contrato[];
  onNavigate: (screen: Screen) => void;
}

const KPICard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
  onClick: () => void;
  variant?: 'default' | 'highlight';
}> = ({ title, value, subtitle, icon, color = "text-blue-500", onClick, variant = 'default' }) => {
  const isHighlight = variant === 'highlight';

  return (
    <button
      onClick={onClick}
      className={`${isHighlight
        ? 'bg-gradient-to-br from-green-600 to-emerald-700 border-green-400/20'
        : 'bg-[#1e293b] border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/80'
        } p-6 rounded-xl border shadow-lg transition-all text-left group flex flex-col justify-between h-full`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className={`${isHighlight ? 'text-white/80' : 'text-slate-400'} text-sm font-medium group-hover:text-slate-200 transition-colors`}>
            {title}
          </span>
          <div className={`${isHighlight ? 'text-white' : color} opacity-80 group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
        </div>
        <div className={`text-3xl font-bold ${isHighlight ? 'text-white' : 'text-white'}`}>
          {value}
        </div>
      </div>
      {subtitle && (
        <div className={`mt-3 text-xs flex items-center gap-1 ${isHighlight ? 'text-green-100' : 'text-slate-500'}`}>
          {isHighlight ? <CheckCircle2 size={12} /> : <ClipboardList size={12} />}
          {subtitle}
        </div>
      )}
    </button>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ contratos, onNavigate }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const salesYear = contratos
      .filter(c => new Date(c.data_inicio).getFullYear() === currentYear)
      .reduce((sum, c) => sum + Number(c.valor_global), 0);

    const salesMonth = contratos
      .filter(c => {
        const d = new Date(c.data_inicio);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      })
      .reduce((sum, c) => sum + Number(c.valor_global), 0);

    // Totais de equipamentos contratados (Vendido)
    const totalElevatorsContracted = contratos.reduce((sum, c) => sum + Number(c.qtde_elevadores || 0), 0);
    const totalPlatformsContracted = contratos.reduce((sum, c) => sum + Number(c.qtde_plataformas || 0), 0);

    // Totais de equipamentos INSTALADOS
    const totalElevatorsInstalled = contratos.reduce((sum, c) => sum + Number(c.instalados_elevadores || 0), 0);
    const totalPlatformsInstalled = contratos.reduce((sum, c) => sum + Number(c.instalados_plataformas || 0), 0);

    const globalSales = contratos.reduce((sum, c) => sum + Number(c.valor_global), 0);
    const active = contratos.filter(c => c.status === 'Ativo').length;
    const pending = contratos.filter(c => c.status === 'Pendente').length;

    // Chart Data
    const stateGroup = contratos.reduce((acc, c) => {
      if (!acc[c.estado]) {
        acc[c.estado] = { count: 0, sales: 0, elevators: 0, platforms: 0, inst_elevators: 0, inst_platforms: 0 };
      }
      acc[c.estado].count += 1;
      acc[c.estado].sales += Number(c.valor_global);
      acc[c.estado].elevators += Number(c.qtde_elevadores || 0);
      acc[c.estado].platforms += Number(c.qtde_plataformas || 0);
      acc[c.estado].inst_elevators += Number(c.instalados_elevadores || 0);
      acc[c.estado].inst_platforms += Number(c.instalados_plataformas || 0);
      return acc;
    }, {} as Record<string, { count: number, sales: number, elevators: number, platforms: number, inst_elevators: number, inst_platforms: number }>);

    const chartData = Object.entries(stateGroup)
      .map(([state, data]: [string, any]) => ({
        state,
        count: data.count,
        instalados: data.inst_elevators + data.inst_platforms,
        contratados: data.elevators + data.platforms
      }))
      .sort((a: any, b: any) => b.count - a.count);

    return {
      salesYear,
      salesMonth,
      totalElevatorsInstalled,
      totalPlatformsInstalled,
      totalElevatorsContracted,
      totalPlatformsContracted,
      globalSales,
      active,
      pending,
      chartData,
      stateGroup
    };
  }, [contratos]);

  const approachingDeadlines = useMemo(() => {
    const today = new Date();
    const fifteenDaysFromNow = new Date();
    fifteenDaysFromNow.setDate(today.getDate() + 15);

    return contratos
      .filter(c => c.status === 'Ativo' || c.status === 'Pendente')
      .filter(c => {
        if (!c.prazo_execucao) return false;
        const deadline = new Date(c.prazo_execucao);
        return deadline <= fifteenDaysFromNow;
      })
      .sort((a, b) => new Date(a.prazo_execucao).getTime() - new Date(b.prazo_execucao).getTime());
  }, [contratos]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const exportPDF = () => {
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    const now = new Date().toLocaleDateString('pt-BR');
    let yPos = 22;

    // Título
    doc.setFontSize(20);
    doc.setTextColor(30, 64, 175);
    doc.text('Relatório Estratégico de Contratos', 14, yPos);
    yPos += 10;

    // Data
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${now}`, 14, yPos);
    yPos += 15;

    // Resumo Executivo
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Resumo Executivo', 14, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const summaryData = [
      `Faturamento Anual: ${formatCurrency(stats.salesYear)}`,
      `Faturamento Global: ${formatCurrency(stats.globalSales)}`,
      `Contratos Ativos: ${stats.active}`,
      `Contratos Pendentes: ${stats.pending}`,
      `Total de Contratos: ${contratos.length}`,
      ``,
      `Elevadores Instalados: ${stats.totalElevatorsInstalled} de ${stats.totalElevatorsContracted} contratados`,
      `Plataformas Instaladas: ${stats.totalPlatformsInstalled} de ${stats.totalPlatformsContracted} contratadas`,
      `Total Geral Instalado: ${stats.totalElevatorsInstalled + stats.totalPlatformsInstalled} unidades`
    ];
    summaryData.forEach(line => {
      doc.text(line, 14, yPos);
      yPos += 5;
    });
    yPos += 10;

    // Tabela de Contratos
    if (contratos.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Lista de Contratos', 14, yPos);
      yPos += 5;

      const tableData = contratos.map(c => [
        c.cliente_orgao.substring(0, 30),
        c.estado,
        formatCurrency(c.valor_global),
        c.status,
        `${c.instalados_elevadores || 0}/${c.qtde_elevadores}`,
        `${c.instalados_plataformas || 0}/${c.qtde_plataformas}`
      ]);

      (doc as any).autoTable({
        startY: yPos,
        head: [['Cliente/Órgão', 'UF', 'Valor', 'Status', 'Elev. Inst/Tot', 'Plat. Inst/Tot']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [30, 64, 175], textColor: 255 },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 15 },
          2: { cellWidth: 30 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 }
        }
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // Estatísticas por Estado
    if (stats.chartData.length > 0 && yPos < 250) {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Estatísticas por Estado', 14, yPos);
      yPos += 5;

      const stateData = stats.chartData.map(item => [
        item.state,
        item.count.toString(),
        item.instalados.toString(),
        item.contratados.toString()
      ]);

      (doc as any).autoTable({
        startY: yPos,
        head: [['Estado', 'Nº Contratos', 'Unidades Instaladas', 'Unidades Contratadas']],
        body: stateData,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 3 }
      });
    }

    // Rodapé
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`ContractGov - Página ${i} de ${pageCount}`, 14, 290);
    }

    doc.save(`Relatorio_Contratos_${now.replace(/\//g, '-')}.pdf`);
  };

  const handleCardClick = () => onNavigate(Screen.List);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard de Gestão</h1>
          <p className="text-slate-400 text-sm">Controle detalhado de unidades vendidas vs. instaladas</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={exportPDF} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-lg transition-colors font-medium shadow-md">
            <Download size={18} /> Exportar PDF
          </button>
          <button onClick={() => onNavigate(Screen.List)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors font-medium shadow-md shadow-blue-900/20">
            <ArrowRight size={18} /> Ir para Contratos
          </button>
        </div>
      </div>


      {
        approachingDeadlines.length > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-500 rounded-lg">
                <AlertTriangle size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Alertas de Prazos Próximos</h3>
                <p className="text-orange-200/60 text-xs">Contratos com execução vencendo nos próximos 15 dias</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approachingDeadlines.map(c => (
                <div key={c.id} className="bg-[#1e293b] border border-orange-500/30 p-4 rounded-lg flex justify-between items-center group hover:border-orange-500 transition-colors">
                  <div className="min-w-0">
                    <div className="text-white font-bold truncate text-sm">{c.cliente_orgao}</div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <Calendar size={12} />
                      <span>Vence em: <strong className={new Date(c.prazo_execucao) < new Date() ? 'text-red-500' : 'text-orange-400'}>
                        {new Date(c.prazo_execucao).toLocaleDateString('pt-BR')}
                      </strong></span>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate(Screen.List)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      }

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Faturamento Anual"
          value={formatCurrency(stats.salesYear)}
          icon={<TrendingUp size={20} />}
          onClick={handleCardClick}
        />

        <KPICard
          title="Elevadores Instalados"
          value={stats.totalElevatorsInstalled}
          subtitle={`de ${stats.totalElevatorsContracted} contratados`}
          icon={<BarChart3 size={20} />}
          onClick={handleCardClick}
        />

        <KPICard
          title="Plataformas Instaladas"
          value={stats.totalPlatformsInstalled}
          subtitle={`de ${stats.totalPlatformsContracted} contratadas`}
          icon={<BarChart3 size={20} />}
          onClick={handleCardClick}
        />

        <KPICard
          title="Contratos Pendentes"
          value={stats.pending}
          icon={<Clock size={20} />}
          color="text-yellow-500"
          onClick={handleCardClick}
        />

        <KPICard
          title="Faturamento Global"
          value={formatCurrency(stats.globalSales)}
          icon={<Briefcase size={20} />}
          color="text-emerald-400"
          onClick={handleCardClick}
        />

        <KPICard
          title="Contratos Ativos"
          value={stats.active}
          icon={<CheckCircle2 size={20} />}
          color="text-green-500"
          onClick={handleCardClick}
        />

        <KPICard
          title="Total Contratado (Vendido)"
          value={stats.totalElevatorsContracted + stats.totalPlatformsContracted}
          subtitle="Unidades em contrato"
          icon={<PackageCheck size={20} />}
          color="text-blue-400"
          onClick={handleCardClick}
        />

        <KPICard
          variant="highlight"
          title="Total Geral Instalado"
          value={stats.totalElevatorsInstalled + stats.totalPlatformsInstalled}
          subtitle="Total de Unidades Instaladas"
          icon={<CheckCircle2 size={20} />}
          onClick={handleCardClick}
        />
      </div >

      <div className="bg-[#1e293b] p-8 rounded-xl border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-white">Status de Implantação por Estado</h2>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-500 rounded-sm"></span> <span className="text-slate-400">Instalados</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-500 opacity-30 rounded-sm"></span> <span className="text-slate-400">Contratados</span></div>
          </div>
        </div>
        <div className="h-[350px] w-full">
          {stats.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="state" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: '#334155' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }}
                />
                <Legend iconType="circle" verticalAlign="top" align="right" height={36} />
                <Bar dataKey="instalados" name="Unidades Instaladas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="contratados" name="Total Contratado" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} opacity={0.2} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
              <FileText size={48} className="opacity-20" />
              <p>Nenhum dado para exibir no gráfico.</p>
            </div>
          )}
        </div>
      </div>
    </div >
  );
};

export default Dashboard;
