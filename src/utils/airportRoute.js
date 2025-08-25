import { fetchSheetData } from './googleSheets';

// rcar 시트에서 경로 목록을 가져오는 함수
export async function getAirportRoutesByType(type) {
  // type: '픽업' 또는 '샌딩'
  const rows = await fetchSheetData('rcar');
  if (!rows || rows.length < 2) return [];
  const headers = rows[0];
  const idxMap = {};
  headers.forEach((h, i) => { idxMap[h] = i; });
  // 구분: 공항, 분류: type
  const routeSet = new Set();
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row[idxMap['구분']] === '공항' && row[idxMap['분류']] === type) {
      routeSet.add(row[idxMap['경로']]);
    }
  }
  return Array.from(routeSet);
}
