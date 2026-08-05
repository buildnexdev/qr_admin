import axios from 'axios';

export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err) && err.response?.data && typeof err.response.data === 'object') {
    const data = err.response.data as { error?: string; message?: string; details?: string };
    if (data.error) {
      const d = data.details != null && String(data.details).trim() !== '' ? String(data.details) : '';
      return d ? `${String(data.error)} (${d})` : String(data.error);
    }
    if (data.message) return String(data.message);
  }
  return fallback;
}
