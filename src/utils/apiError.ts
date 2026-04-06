import axios from 'axios';

export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err) && err.response?.data && typeof err.response.data === 'object') {
    const data = err.response.data as { error?: string; message?: string };
    if (data.error) return String(data.error);
    if (data.message) return String(data.message);
  }
  return fallback;
}
