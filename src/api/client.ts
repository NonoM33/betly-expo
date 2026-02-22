import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { getItemAsync, setItemAsync, deleteItemAsync } from '../utils/storage';
import { Config, StorageKeys } from '../constants/config';
import { ApiError } from '../types';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: Config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getItemAsync(StorageKeys.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }

    // Add app version headers
    config.headers['X-App-Version'] = Config.APP_VERSION;
    config.headers['X-Build-Number'] = Config.BUILD_NUMBER;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear token and redirect to login
      await deleteItemAsync(StorageKeys.AUTH_TOKEN);
      await deleteItemAsync(StorageKeys.USER_DATA);

      // You could emit an event here to trigger logout in the app
      // EventEmitter.emit('auth:logout');

      return Promise.reject(createApiError(error));
    }

    return Promise.reject(createApiError(error));
  }
);

// Create standardized API error
function createApiError(error: AxiosError<ApiError>): ApiError {
  if (error.response) {
    const { status, data } = error.response;

    // Handle specific status codes
    switch (status) {
      case 400:
        return {
          message: data?.message || 'Bad request',
          code: 'BAD_REQUEST',
          status,
          errors: data?.errors,
        };

      case 401:
        return {
          message: data?.message || 'Unauthorized',
          code: 'UNAUTHORIZED',
          status,
        };

      case 402:
        return {
          message: data?.message || 'Insufficient credits',
          code: 'INSUFFICIENT_CREDITS',
          status,
          required: data?.required,
          available: data?.available,
        };

      case 403:
        // Check for EXPERT_REQUIRED
        if (data?.code === 'EXPERT_REQUIRED') {
          return {
            message: data?.message || 'Expert subscription required',
            code: 'EXPERT_REQUIRED',
            status,
          };
        }
        return {
          message: data?.message || 'Forbidden',
          code: 'FORBIDDEN',
          status,
        };

      case 404:
        return {
          message: data?.message || 'Not found',
          code: 'NOT_FOUND',
          status,
        };

      case 409:
        return {
          message: data?.message || 'Conflict',
          code: 'CONFLICT',
          status,
        };

      case 422:
        return {
          message: data?.message || 'Validation failed',
          code: 'VALIDATION_ERROR',
          status,
          errors: data?.errors,
        };

      case 429:
        return {
          message: data?.message || 'Too many requests',
          code: 'RATE_LIMIT',
          status,
        };

      case 500:
      case 502:
      case 503:
      case 504:
        return {
          message: data?.message || 'Server error',
          code: 'SERVER_ERROR',
          status,
        };

      default:
        return {
          message: data?.message || 'Request failed',
          code: 'UNKNOWN_ERROR',
          status,
        };
    }
  }

  // Handle network errors
  if (error.code === 'ECONNABORTED') {
    return {
      message: 'Request timeout',
      code: 'TIMEOUT',
    };
  }

  if (!error.response) {
    return {
      message: 'Network error - please check your connection',
      code: 'NETWORK_ERROR',
    };
  }

  return {
    message: error.message || 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  };
}

// API helper functions
export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

export async function post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
}

export async function put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.put<T>(url, data, config);
  return response.data;
}

export async function patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.patch<T>(url, data, config);
  return response.data;
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
}

// Token management
export async function setAuthToken(token: string): Promise<void> {
  await setItemAsync(StorageKeys.AUTH_TOKEN, token);
}

export async function getAuthToken(): Promise<string | null> {
  return await getItemAsync(StorageKeys.AUTH_TOKEN);
}

export async function clearAuthToken(): Promise<void> {
  await deleteItemAsync(StorageKeys.AUTH_TOKEN);
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
}

export default apiClient;
