import axios, { AxiosError, AxiosResponse } from 'axios';
import { I18nManager } from 'react-native';
import Config from '../config';
import { store } from '../store/Store';

const apiClient = axios.create({
  baseURL: Config.baseUrl,
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json',
  },
});
const LOCALE_PERSISTENCE_KEY = 'language';

apiClient.interceptors.request.use(async function (config: any) {
  const userInfo: any = store.getState().user.token;
  // const deviceId = store.getState().app.deviceId;
  // const country = store.getState().user.country;
  // const currentlanguage = store.getState().app.lanugage;
  // if (userInfo != null && userInfo.data.access_token && config.headers) {
  //change

  config.headers.authorization = 'Bearer ' + userInfo;

  // }
  // if (config.headers) {
  //   config.headers['culturelanguage'] =
  //     currentlanguage == null ? 'en' : currentlanguage;
  // }
  // if (deviceId != null && config.headers) {
  //   config.headers['deviceId'] = deviceId;
  // }
  // if (country != null && config.headers) {
  //   config.headers['countryId'] = country?.id;
  // }
  // if (config.headers) {
  //   config.headers['AppType'] = Platform.OS == 'ios' ? '1' : '2';
  //   config.headers['type'] = Platform.OS;
  // }

  const base = (config?.baseURL || "").replace(/\/+$/, "");
  const path = (config?.url || "").replace(/^\/+/, "");
  const fullUrl = path ? `${base}/${path}` : base;
  return config;
});
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (err: AxiosError) => {
    const status = err.response?.status || 500;
    switch (status) {
      case 401: {
        return Promise.reject(err);
      }
      default: {
        return Promise.reject(err);
      }
    }
  },
);
export { apiClient };
