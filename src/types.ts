export interface AlertRecord {
  id: string; // Internal ID
  alertDate: string; // 警訊通知日期 (YYYY-MM-DD HH:mm)
  waterId: string; // 水號
  location: string; // 用水地點（車站名稱）
  status: string | null; // 檢視/處理情形
  timestamp: string | null; // 時間戳記 (YYYY-MM-DD HH:mm)
  replierName: string | null; // 回復者姓名
  reportUrl: string | null; // 異常回報單網址
}

export interface SectionOffice {
  id: string;
  name: string; // 段辦名稱 (e.g., '淡北段')
  lineCode: string; // 路線代號 e.g., 'R', 'G', 'BL'
  lineColor: string; // 路線代表色 Hex
}

export interface SectionStats {
  section: SectionOffice;
  totalAlerts: number;
  completedAlerts: number;
  completionRate: number;
  records: AlertRecord[];
}
