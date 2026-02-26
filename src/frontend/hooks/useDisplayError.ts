export function useDisplayError(...errors: Array<string | null>): string | null {
  for (const error of errors) {
    if (error) return error;
  }

  return null;
}
