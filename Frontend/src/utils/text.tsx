// Trunca um nome de evento longo, mantendo o início e o fim.
export const formatEventName = (name: string, maxLength: number = 18): string => {
  if (name.length <= maxLength) {
    return name;
  }
  const start = name.substring(0, 15);
  const end = name.substring(name.length - 10);
  return `${start.trim()}... ${end}`;
};

// Formata um nome completo para exibir apenas o primeiro e o último nome.
export const formatDisplayName = (fullName: string): string => {
  if (!fullName || !fullName.trim()) {
    return '';
  }
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) {
    return fullName;
  }
  return `${parts[0]} ${parts[parts.length - 1]}`;
};