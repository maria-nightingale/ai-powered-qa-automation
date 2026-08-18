/** Append a timestamp so program names are unique across parallel test runs. */
export function uniqueName(base: string): string {
  return `${base} ${Date.now()}`;
}

/** Unique college.edu email so Settings user creates do not collide. */
export function uniqueEmail(localPart = 'qa-ds215'): string {
  return `${localPart}-${Date.now()}@college.edu`;
}

/** Build a string of exact length for boundary validation tests. */
export function repeatChar(char: string, count: number): string {
  return char.repeat(count);
}
