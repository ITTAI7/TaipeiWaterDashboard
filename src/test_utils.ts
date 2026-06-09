import { fetchWaterAlertsAPI } from './utils';

async function test() {
  process.env.NODE_ENV = 'development';
  (global as any).fetch = require('node-fetch');
  // Mock API url to use full URL for local testing
  const data = await require('node-fetch')('http://127.0.0.1:3000/api/alerts').then((r:any) => r.json());
  
  const start = new Date();
  const currentDay = start.getDay();
  start.setDate(start.getDate() - currentDay);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  const startMs = start.getTime();
  const endMs = end.getTime();
  
  console.log("Start:", start);
  console.log("End:", end);
  
  let validCount = 0;
  for (const d of data) {
    const alertDateStr = d["警訊通知日期"] || d.alertDate || '';
    if (!alertDateStr) continue;
    const safeDateStr = alertDateStr.trim().replace(' ', 'T');
    const alertTime = new Date(safeDateStr).getTime();
    if (!isNaN(alertTime) && alertTime >= startMs && alertTime <= endMs) {
      validCount++;
    }
  }
  console.log("Found valid:", validCount);
}

test();
