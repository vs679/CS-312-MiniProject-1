export async function api(url, options = {}) 
{
  const response = await fetch(`/api${url}`, {
    credentials: 'same-origin',
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers }
  });

  const result = await response.json().catch(() => ({}));
  
  if (!response.ok) throw new Error(result.error || 'Request failed.');
  return result;
}
