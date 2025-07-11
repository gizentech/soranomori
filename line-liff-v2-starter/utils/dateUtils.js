import dayjs from 'dayjs';

export function calculateDaysUntilBloodTest(bloodTestDate) {
  if (!bloodTestDate) return null;
  
  const today = dayjs();
  const testDate = dayjs(bloodTestDate);
  const diff = testDate.diff(today, 'day');
  
  if (diff < 0) return null; // 過ぎた場合はnullを返す
  if (diff === 0) return '当日';
  
  return `${diff}日`;
}

export function calculateAge(birthDate) {
  if (!birthDate) return null;
  
  // 文字列、Date オブジェクト、dayjs オブジェクトに対応
  const birth = dayjs(birthDate);
  return dayjs().diff(birth, 'year');
}

export function calculateMarriageAge(birthDate, marriageYear) {
  if (!birthDate || !marriageYear) return null;
  
  const birth = dayjs(birthDate);
  return parseInt(marriageYear) - birth.year();
}

export function formatDateForFirestore(date) {
  if (!date) return null;
  
  // 日付の時刻部分を00:00:00に設定
  const dateObj = new Date(date);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj;
}

export function compareDatesForAuth(firestoreDate, inputDateString) {
  if (!firestoreDate || !inputDateString) return false;
  
  // Firestoreの日付を日付のみに変換
  const fsDate = dayjs(firestoreDate.toDate ? firestoreDate.toDate() : firestoreDate);
  const inputDate = dayjs(inputDateString);
  
  return fsDate.format('YYYY-MM-DD') === inputDate.format('YYYY-MM-DD');
}