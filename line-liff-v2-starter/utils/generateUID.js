export function generateUID() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  const letter = letters[Math.floor(Math.random() * letters.length)];
  let numberPart = '';
  
  for (let i = 0; i < 6; i++) {
    numberPart += numbers[Math.floor(Math.random() * numbers.length)];
  }
  
  return letter + numberPart;
}