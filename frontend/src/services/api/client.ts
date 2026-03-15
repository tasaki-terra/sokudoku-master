import { config } from '../../config';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const url = `${config.apiBaseUrl}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new ApiError(response.status, body || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const get = <T>(path: string): Promise<T> => request<T>(path);

export const post = <T>(path: string, data: unknown): Promise<T> =>
  request<T>(path, {
    method: 'POST',
    body: JSON.stringify(data),
  });
