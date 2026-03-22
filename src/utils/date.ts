export const toDate = (value?: string) => (value ? new Date(value) : undefined);

export const formatDate = (value?: string) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
};
