import { AxiosRequestConfig } from 'axios';

export interface ApiResponse<T> {
  data: T;
  status: number;
}

export interface ApiRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}
