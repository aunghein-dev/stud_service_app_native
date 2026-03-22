export const toQueryString = (params: Record<string, unknown>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    query.set(k, String(v));
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
};
