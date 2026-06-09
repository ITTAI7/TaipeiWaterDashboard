import React, { useEffect } from 'react';
import { Maximize2, X } from 'lucide-react';
import { SectionStats } from '../types';

interface Props {
  stats: SectionStats;
  isOpen: boolean;
  onToggle: () => void;
}

const SectionAccordion: React.FC<Props> = ({ stats, isOpen, onToggle }) => {
  const { section, totalAlerts, completedAlerts, completionRate, records } = stats;
  const hasUnhandled = totalAlerts > 0 && completedAlerts < totalAlerts;

  // Disable background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Base Card in Grid */}
      <div 
        className={`bg-white rounded shadow-sm flex flex-col overflow-hidden transition-all duration-300 h-fit hover:shadow-md cursor-pointer hover:-translate-y-0.5 group relative ${
          hasUnhandled ? 'border-2 border-orange-400' : 'border border-slate-200'
        }`}
        style={{ borderLeft: `${hasUnhandled ? '4px' : '4px'} solid ${section.lineColor}` }}
        onClick={onToggle}
      >
        {hasUnhandled && (
          <div className="absolute top-0 right-0 w-0 h-0 border-t-[32px] border-l-[32px] border-t-orange-500 border-l-transparent">
            <span className="absolute -top-[30px] -left-[14px] text-white text-[10px] font-bold select-none">!</span>
          </div>
        )}
        <div className={`p-3 border-b border-slate-100 flex justify-between items-center ${hasUnhandled ? 'bg-orange-50/30' : 'bg-slate-50/50'}`}>
          <div className="flex items-center gap-2">
            <span 
              className="text-sm font-bold text-white px-2 py-1 rounded-sm"
              style={{ backgroundColor: section.lineColor }}
            >
              {section.lineCode}
            </span>
            <span className="font-bold text-lg text-slate-800">{section.name}</span>
            <span className="text-sm text-slate-400 font-mono">({completedAlerts}/{totalAlerts})</span>
          </div>
          
          <div className="flex items-center gap-3">
            <span 
              className="text-base sm:text-lg font-mono font-bold"
              style={{ color: section.lineColor }}
            >
              {completionRate}%
            </span>
            <div className="text-slate-400 group-hover:text-slate-600 transition-colors">
              <Maximize2 size={14} />
            </div>
          </div>
        </div>

        <div className="p-3">
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-1000 ease-out"
              style={{ width: `${completionRate}%`, backgroundColor: section.lineColor }}
            />
          </div>
        </div>
      </div>

      {/* Modal Overlay for "Zoom to front" */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer" 
            onClick={onToggle}
          />
          
          {/* Modal Content */}
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative z-10 animate-zoom-in"
            style={{ 
              borderTop: `6px solid ${section.lineColor}` 
            }}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <span 
                  className="text-sm sm:text-base font-bold text-white px-2 py-1 rounded-sm"
                  style={{ backgroundColor: section.lineColor }}
                >
                  {section.lineCode}
                </span>
                <span className="font-bold text-xl sm:text-2xl text-slate-800">{section.name} <span className="text-slate-300 font-normal mx-1">|</span> 查核明細</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-base sm:text-lg font-mono font-medium hidden sm:inline-block" style={{ color: section.lineColor }}>
                  完成進度: {completedAlerts} / {totalAlerts} ({completionRate}%)
                </span>
                <button 
                  onClick={onToggle}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors bg-white border border-slate-200"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-4 sm:p-6 bg-slate-50/50 flex-1">
              {totalAlerts === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-slate-200 mb-2">
                    <Maximize2 size={40} />
                  </div>
                  <span className="text-base tracking-widest font-medium">當週無通報紀錄</span>
                </div>
              ) : (
                <div className="w-full overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-sm">
                  <table className="w-full text-base text-left whitespace-nowrap">
                    <thead>
                      <tr className="text-slate-500 bg-slate-50/80 border-b border-slate-200">
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-sm">通知日期</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-sm">水號</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-sm">車站</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-sm text-right">狀態</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {records.map((record) => {
                        const isHandled = !!(record.status && record.timestamp && record.replierName);
                        return (
                          <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4 font-mono text-slate-500">
                              {record.alertDate.substring(5)}
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-400">{record.waterId}</td>
                            <td className="py-3 px-4 font-bold text-slate-800 text-lg">{record.location}</td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex flex-col items-end gap-2">
                                {isHandled ? (
                                  <div className="text-[#009544] flex flex-col items-end leading-tight">
                                    <span className="font-bold text-base tracking-wide">
                                      {record.replierName} <span className="font-mono text-slate-400 text-sm ml-1 mr-1">{record.timestamp?.substring(5)}</span> 已完成
                                    </span>
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center justify-center min-w-[60px] text-sm text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md font-bold tracking-widest border border-orange-100">
                                    未完成
                                  </span>
                                )}
                                {record.reportUrl && (
                                  <a
                                    href={record.reportUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`inline-flex items-center justify-center px-4 py-1.5 text-sm font-bold rounded-md transition-all ${
                                      isHandled 
                                        ? 'text-slate-500 border border-slate-200 hover:text-slate-700 hover:border-slate-300 bg-white hover:bg-slate-50' 
                                        : 'text-white bg-[#0070BD] border border-[#0060A0] shadow-sm hover:bg-[#005a9e] hover:-translate-y-0.5'
                                    }`}
                                  >
                                    填寫異常回報單
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SectionAccordion;
