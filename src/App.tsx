import React, { useState, useEffect, useMemo } from 'react';
import SectionAccordion from './components/SectionAccordion';
import { SECTION_OFFICES, STATION_TO_SECTION_MAP } from './data';
import { fetchWaterAlertsAPI, getCurrentWeekRange, formatDateString } from './utils';
import { AlertRecord, SectionStats } from './types';
import { RefreshCw } from 'lucide-react';

export default function App() {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchWaterAlertsAPI();
      setAlerts(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load alerts', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute calculated statistics per section
  const sectionStats: SectionStats[] = useMemo(() => {
    return SECTION_OFFICES.map(section => {
      // Find what stations belong to this section
      const sectionStations = Object.keys(STATION_TO_SECTION_MAP).filter(
        station => STATION_TO_SECTION_MAP[station] === section.name
      );

      // Filter alerts belonging to these stations
      const records = alerts.filter(record => sectionStations.includes(record.location));
      
      const totalAlerts = records.length;
      const completedAlerts = records.filter(r => r.status && r.timestamp).length;
      const completionRate = totalAlerts > 0 ? Math.round((completedAlerts / totalAlerts) * 100) : 0;

      return {
        section,
        totalAlerts,
        completedAlerts,
        completionRate,
        records
      };
    });
  }, [alerts]);

  const toggleSection = (sectionId: string) => {
    setOpenSectionId(prev => prev === sectionId ? null : sectionId);
  };

  const { start, end } = getCurrentWeekRange();
  
  const globalTotal = sectionStats.reduce((sum, s) => sum + s.totalAlerts, 0);
  const globalCompleted = sectionStats.reduce((sum, s) => sum + s.completedAlerts, 0);
  const globalUnfinished = globalTotal - globalCompleted;
  const globalRate = globalTotal > 0 ? ((globalCompleted / globalTotal) * 100).toFixed(1) : '0';

  const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'];

  // Calculate specific dates for the week timeline
  const currentDayIndex = new Date().getDay();
  const weekDates = dayOfWeek.map((_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return {
      day: dayOfWeek[i],
      dateNum: d.getDate(),
      isPast: i < currentDayIndex,
      isToday: i === currentDayIndex,
      isFuture: i > currentDayIndex,
    };
  });
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-cyan-100">
      {/* Header Section */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 xl:py-5 flex flex-col xl:flex-row justify-between items-center gap-6 sticky top-0 z-10 transition-opacity">
        {/* Left Logo & Title */}
        <div className="flex items-center gap-3 sm:gap-4 w-full xl:w-auto xl:flex-1 justify-center sm:justify-start">
          <div className="w-10 h-10 bg-[#0070BD] rounded flex items-center justify-center text-white font-bold italic text-xl shrink-0">M</div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">每週智慧水管家查核完成度儀表板</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium uppercase tracking-widest mt-0.5">Smart Water Management System • Internal Use Only</p>
          </div>
        </div>
        
        {/* Center: Week Timeline */}
        <div className="flex justify-center items-center gap-2 sm:gap-3 w-full xl:w-auto xl:flex-1 h-20 pointer-events-none">
          {weekDates.map(({ day, dateNum, isPast, isToday }) => (
            <div
              key={day}
              className={`flex flex-col items-center justify-center rounded-xl transition-all duration-500 shadow-sm ${
                isToday
                  ? 'h-[72px] w-12 sm:w-16 bg-[#0070BD] text-white shadow-blue-300/50 shadow-lg border border-[#0060A0] transform -translate-y-1'
                  : isPast
                  ? 'h-14 w-10 sm:w-12 bg-slate-100 text-slate-400 opacity-60 border border-slate-200/50'
                  : 'h-14 w-10 sm:w-12 bg-white text-slate-500 border border-slate-200'
              }`}
            >
              <span className={`text-[10px] sm:text-xs font-bold leading-none mb-1 ${isToday ? 'text-blue-100' : ''}`}>{day}</span>
              <span className={`font-mono font-bold leading-none ${isToday ? 'text-xl sm:text-2xl mt-0.5' : 'text-sm sm:text-base mt-0.5'}`}>{dateNum}</span>
            </div>
          ))}
        </div>

        {/* Right Info */}
        <div className="text-center xl:text-right flex flex-col justify-center items-center xl:items-end w-full xl:w-auto xl:flex-1">
          <div className="text-base sm:text-lg font-semibold text-[#009544] mb-1 md:mb-0">
            統計區間：{formatDateString(start)} ({dayOfWeek[start.getDay()]}) - {formatDateString(end)} ({dayOfWeek[end.getDay()]})
          </div>
          <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
             {isLoading ? (
               <><RefreshCw size={10} className="animate-spin" /> 資料更新中...</>
             ) : (
               <>
                 <button disabled={isLoading} onClick={loadData} className="hover:text-cyan-600 flex items-center gap-1 transition-colors cursor-pointer pointer-events-auto">
                   <RefreshCw size={10} /> 重新整理
                 </button>
                 <span className="text-slate-300">|</span> 
                 資料更新時間: {lastUpdated.toLocaleString()}
               </>
             )}
          </div>
        </div>
      </header>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-8 py-4 sm:py-6 bg-slate-100/50">
        <div className="bg-white p-3 sm:p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-sm text-slate-400 block mb-1 font-bold tracking-wider uppercase">全系統平均完成率</span>
          <span className="text-3xl sm:text-4xl font-mono font-bold text-[#0070BD]">{globalRate}%</span>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg border border-slate-200 shadow-sm text-center flex flex-col justify-between">
          <span className="text-sm text-slate-400 block mb-1 font-bold tracking-wider uppercase">當週總通報</span>
          <span className="text-3xl sm:text-4xl font-mono font-bold">{globalTotal} <small className="text-sm sm:text-base text-slate-400">件</small></span>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg border border-slate-200 shadow-sm text-center flex flex-col justify-between">
          <span className="text-sm text-slate-400 block mb-1 font-bold tracking-wider uppercase">已處理案件</span>
          <span className="text-3xl sm:text-4xl font-mono font-bold text-[#009544]">{globalCompleted} <small className="text-sm sm:text-base text-slate-400">件</small></span>
        </div>
        <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border-2 border-orange-200 shadow-sm text-center flex flex-col justify-between">
          <span className="text-sm text-orange-700/70 block mb-1 font-bold tracking-wider uppercase">未結案警示</span>
          <span className="text-3xl sm:text-4xl font-mono font-bold text-orange-600">{globalUnfinished} <small className="text-sm sm:text-base text-orange-500/80">件</small></span>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <main className="flex-1 flex flex-col gap-6 px-4 sm:px-8 py-4 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200 border-dashed shadow-sm">
            <RefreshCw className="animate-spin text-[#0070BD] mb-4 w-10 h-10" />
            <h3 className="text-lg font-bold text-slate-700 mb-1">正在同步系統資料...</h3>
            <p className="text-sm text-slate-500">正在向遠端伺服器請求最新查核紀錄，請稍候</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200 border-dashed shadow-sm">
            <h3 className="text-lg font-bold text-slate-700 mb-1">本週目前無通報紀錄</h3>
            <p className="text-sm text-slate-500">系統尚未接收到任何當週的查核資料</p>
          </div>
        ) : (
          <div className="max-w-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 items-start auto-rows-max">
            {sectionStats.map(stats => (
              <SectionAccordion 
                key={stats.section.id} 
                stats={stats} 
                isOpen={openSectionId === stats.section.id}
                onToggle={() => toggleSection(stats.section.id)}
              />
            ))}
          </div>
        )}

        {/* Japanese Minimal Element: Legend/Notes */}
        <div className="mt-auto p-4 bg-[#f1f5f9] border-l-2 border-[#0070BD] rounded-r-lg h-auto">
          <h4 className="text-sm font-bold text-slate-600 uppercase mb-2">儀表板說明</h4>
          <p className="text-sm leading-relaxed text-slate-500 italic">
            本週進度計算方式：當週該段辦轄下車站總通報筆數為分母，已填寫處理情形與時間戳記之筆數為分子。每週日凌晨零時重置數據。
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 px-4 sm:px-8 py-3 flex flex-col sm:flex-row gap-2 justify-between items-center text-xs font-mono text-slate-400 uppercase tracking-widest mt-auto shrink-0">
        <div className="text-center sm:text-left">Taipei Rapid Transit Corporation • Infrastructure Dept</div>
        <div className="flex gap-2 sm:gap-4 items-center">
          <span>系統代碼: MRT-WDM-2023</span>
          <span className="text-slate-200 hidden sm:inline">|</span>
          <span>API Status: Connected</span>
        </div>
      </footer>
    </div>
  );
}
