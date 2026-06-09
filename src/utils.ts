import { AlertRecord } from './types';

/**
 * Get the start and end dates of the current week (Sunday to Saturday)
 */
export function getCurrentWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  const currentDay = now.getDay(); // 0 is Sunday, 6 is Saturday
  
  const start = new Date(now);
  start.setDate(now.getDate() - currentDay);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function formatDateString(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function formatDateTimeString(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

const API_URL = '/api/alerts';

/**
 * Fetch real data from our API proxy
 */
export async function fetchWaterAlertsAPI(): Promise<AlertRecord[]> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText} ${text}`);
    }
    const data = await response.json();
    
    const { start, end } = getCurrentWeekRange();
    const startMs = start.getTime();
    const endMs = end.getTime();

    const alerts: AlertRecord[] = data
      .map((row: any, index: number) => {
        const alertDateStr = row["警訊通知日期"] || row.alertDate || '';
        return {
          id: `API-${index}-${Date.now()}`,
          alertDate: alertDateStr,
          waterId: row["水號"] || row.waterId || '',
          location: row["用水地點"] || row.location || '',
          status: row["檢視/處理情形"] || row.status || null,
          timestamp: row["時間戳記"] || row.timestamp || null,
          replierName: row["回復者姓名"] || row.replierName || null,
          reportUrl: row["reportUrl"] || row.reportUrl || null,
        } as AlertRecord;
      })
      .filter((record: AlertRecord) => {
        if (!record.alertDate) return false;
        // Replace space with T for valid ISO date parsing in all browsers
        const safeDateStr = record.alertDate.trim().replace(' ', 'T');
        const alertTime = new Date(safeDateStr).getTime();
        return !isNaN(alertTime) && alertTime >= startMs && alertTime <= endMs;
      });

    // Sort by descending alert Date
    alerts.sort((a, b) => {
      const timeA = new Date(a.alertDate.trim().replace(' ', 'T')).getTime();
      const timeB = new Date(b.alertDate.trim().replace(' ', 'T')).getTime();
      return timeB - timeA;
    });

    return alerts;
  } catch (error) {
    console.error('Failed to fetch data from API:', error);
    return [];
  }
}

