export type KeaEnvironment = 'localdev' | 'local' | 'dev' | 'beta' | 'prod';

export enum EControlAppId {
  DemoApp = 'demo-app',
}

export enum EControlAppName {
  DemoApp = 'Demo App',
}

export interface IControlAppInfo {
  id: EControlAppId;
  url: string;
  name: string;
  processAffinity?: string;
}

export enum EControlAppEntryName {
  DemoApp = 'demo-app.html',
}
