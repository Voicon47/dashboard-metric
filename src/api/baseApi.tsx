// function getMainDomain(url: string) {
//   const parts = url
//     .replace(/^https?:\/\//, '')
//     .split('/')[0]
//     .split('.');
//   if (parts.length > 2) {
//     return parts.slice(-2).join('.');
//   }
//   return url;
// }
import axios, { AxiosResponse, AxiosError } from "axios";
export const GetHeader = (token?: string) => {
  const headers: Record<string, string> = {
    "content-type": "application/json; charset=utf-8",
  };
  if (token) {
    headers["token"] = token;
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

//Hàm xử lý lỗi tập trung
const HandleError = (error: AxiosError | any) => {
  if (error.response) {
    console.error("[API Lỗi]", error.response.status, error.response.data);
  } else {
    console.error("[API Network Error]", error.message);
  }
  throw error;
};

/// Chuan hoa method

interface IApiService {
  GET: (
    url: string,
    token?: string,
    timeout?: number,
  ) => Promise<AxiosResponse<any> | any>;
  POST: (
    url: string,
    data: string,
    token?: string,
    timeout?: number,
  ) => Promise<AxiosResponse<any> | any>;
}
const ApiService: IApiService = {
  GET: (url: string, token?: string, timeout?: number) => {
    return axios
      .get(url, {
        headers: GetHeader(token),
        timeout: timeout,
      })
      .catch(HandleError);
  },
  POST: (url: string, data: any, token?: string, timeout?: number) => {
    return axios
      .post(url, data, {
        headers: GetHeader(token),
        timeout: timeout,
      })
      .catch(HandleError);
  },
};
export default ApiService;
