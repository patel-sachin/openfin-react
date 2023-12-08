import React from 'react';
import { IpcBusSubscriber } from '../ipcBusSubscriber';
import { getOpenFinProcessIdAsync, getUuid, isOpenFin } from '../utils';
import OpenFin from '@openfin/core';

export const useOpenFinChannelSubscriber = (identityName: string) => {
  const [state, setState] = React.useState<{
    isRunningInOpenFin: boolean;
    ipcBusSubscriber: IpcBusSubscriber | null;
    identity: OpenFin.Identity | null;
    processId: number | null;
  }>({ isRunningInOpenFin: false, identity: null, ipcBusSubscriber: null, processId: null });

  React.useEffect(() => {
    if (!state.isRunningInOpenFin) {
      return;
    }

    const initFinRelatedPropsAsync = async () => {
      const identity: OpenFin.Identity = {
        name: identityName,
        uuid: getUuid(),
      };

      const ipcBusSubscriber = await IpcBusSubscriber.createAsync(state.isRunningInOpenFin, identity);
      if (!ipcBusSubscriber) {
        return;
      }

      const processId = await getOpenFinProcessIdAsync();

      setState((prevState) => ({
        ...prevState,
        ipcBusSubscriber: ipcBusSubscriber,
        identity: identity,
        processId: processId,
      }));
    };

    initFinRelatedPropsAsync().catch((error) => {
      console.error('initFinRelatedPropsAsync failed!', error);
    });
  }, [state.isRunningInOpenFin, identityName]);

  React.useEffect(() => {
    async function disposeAsync(): Promise<void> {
      if (!state.ipcBusSubscriber) {
        return;
      }

      await state.ipcBusSubscriber.disposeAsync();

      setState((prevState) => ({ ...prevState, ipcBusSubscriber: null }));
    }

    setState((prevState) => ({ ...prevState, isRunningInOpenFin: isOpenFin() }));

    return () => {
      disposeAsync().catch((error) => console.error('disposeAsync failed', error));
    };
  }, [state.ipcBusSubscriber]);

  return [state.isRunningInOpenFin, state.ipcBusSubscriber, state.processId, state.identity] as const;
};
