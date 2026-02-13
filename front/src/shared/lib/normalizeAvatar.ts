export const normalizeAvatarSrc = (val?: string | null) => {
  if (!val) return undefined;

  const s = val.trim();

  if (s.startsWith("data:image/")) return s;

  if (/^[A-Za-z0-9+/=\s]+$/.test(s) && s.length > 200) {
    const compact = s.replace(/\s+/g, "");
    return `data:image/jpeg;base64,${compact}`;
  }

  return s;
};
