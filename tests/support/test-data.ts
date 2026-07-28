export function uniqueName(base: string): string {
  return `${base} ${Date.now()}`;
}

export function repeatChar(char: string, count: number): string {
  return char.repeat(count);
}
