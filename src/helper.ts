export const trimToLength = (str: string, length: number) => {
  if (str.trim().length <= length) return str.trim();

  const trimmed = str.trim();

  return trimmed.slice(0, length);
};
