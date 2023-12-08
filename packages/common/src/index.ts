import { KeaEnvironment } from './types';

export {};

declare global {
  interface Window {
    env: {
      NAME: KeaEnvironment;
      APP_URL: string;
      API_URL: string;
      API_WS_URL: string;
      OPENFIN_CHANNEL_PROVIDER_ID: string;
      SCI_CHART_LICENSE_KEY: string;
      DEVELOPERS: string[];
    };
  }
}

export * from './types';
export * from './utils';
export * from './icons';
export * from './ipcBusPublisher';
export * from './ipcBusSubscriber';
export * from './contexts';
export * from './hooks';
