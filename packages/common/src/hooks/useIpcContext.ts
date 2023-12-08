import React from 'react';
import { IIpcContext, IpcContext } from '../contexts';

export const useIpcContext = (): IIpcContext => {
  return React.useContext<IIpcContext>(IpcContext);
};
