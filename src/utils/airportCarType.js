import { fetchSheetData } from './googleSheets';

// rcar 시트에서 조건에 맞는 차종 목록을 가져오는 함수
export async function getAirportCarTypes(type, route) {
  // type: '픽업' 또는 '샌딩', route: 선택된 경로
  const rows = await fetchSheetData('rcar');
  if (!rows || rows.length < 2) return [];
  const headers = rows[0];
  const idxMap = {};
  headers.forEach((h, i) => { idxMap[h] = i; });
  // 구분: 공항, 분류: type, 경로: route
  const carTypeSet = new Set();
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (
      row[idxMap['구분']] === '공항' &&
      row[idxMap['분류']] === type &&
      row[idxMap['경로']] === route
    ) {
      carTypeSet.add(row[idxMap['차종']]);
    }
  }
  return Array.from(carTypeSet);
}
