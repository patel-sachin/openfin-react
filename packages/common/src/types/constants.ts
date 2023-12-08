import { EControlAppEntryName, EControlAppId, EControlAppName, IControlAppInfo } from './Shapes';

export const FONT_SIZE_SMALL = 10;
export const FONT_SIZE = 12;
export const FONT_SIZE_LARGE = 14;

export const LAYOUT_STORE_KEY = 'openfin-react-layout-v1';

export const ControlApps: Record<EControlAppId, IControlAppInfo> = {
  [EControlAppId.DemoApp]: {
    id: EControlAppId.DemoApp,
    name: EControlAppName.DemoApp,
    url: `${window.env.APP_URL}/${EControlAppEntryName.DemoApp}`,
    processAffinity: 'ps_2',
  },
};

export const DefaultWorkspaceSettings = {
  autosavePath: '',
  study: {
    autosave: {
      newFile: true,
      privateFile: true,
      sharedFile: true,
      viewableOwnFile: true,
    },
  },
  kdl: {
    autosave: {
      newFile: true,
      privateFile: true,
      sharedFile: true,
      viewableOwnFile: true,
    },
  },
} as const;
