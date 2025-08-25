import { fetchSheetData } from './googleSheets';

// rcar 시트에서 5가지 조건에 맞는 금액값 반환
export async function getAirportCarPrice(type, route, carType, code) {
  // type: '픽업' 또는 '샌딩', route: 선택된 경로, carType: 선택된 차종, code: 선택된 코드
  const rows = await fetchSheetData('rcar');
  if (!rows || rows.length < 2) return '';
  const headers = rows[0];
  const idxMap = {};
  headers.forEach((h, i) => { idxMap[h] = i; });
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (
      row[idxMap['구분']] === '공항' &&
      row[idxMap['분류']] === type &&
      row[idxMap['경로']] === route &&
      row[idxMap['차종']] === carType &&
      row[idxMap['코드']] === code
    ) {
      return row[idxMap['금액']];
    }
  }
  return '';
}
