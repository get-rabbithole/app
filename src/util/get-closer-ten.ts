export function getNextCloserTen(num: number): number {
  if (num % 10 === 0) {
    return num;
  } else {
    return Math.floor(num / 10) * 10;
  }
}
