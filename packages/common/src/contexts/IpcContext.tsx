import React from 'react';
import { useOpenFinChannelSubscriber } from '../hooks';
import { IpcBusSubscriber } from '../ipcBusSubscriber';
import { getUuid } from '../utils';

export interface IIpcContextState {
  isRunningInOpenFin: boolean;
  ipcBusSubscriber?: IpcBusSubscriber;
  processId: number;
  isIpcContextReady: boolean;
}

export type IIpcContext = IIpcContextState;

const initialIpcContextState: IIpcContextState = {
  isRunningInOpenFin: false,
  processId: 0,
  isIpcContextReady: false,
};

export const IpcContext = React.createContext<IIpcContext>({
  ...initialIpcContextState,
} as IIpcContext);

export const IpcContextProvider = ({
  identifier,
  uuid,
  children,
}: {
  identifier: string;
  uuid?: string;
  children: React.ReactNode;
}) => {
  if (!uuid || uuid.trim().length === 0) {
    uuid = getUuid();
  }
  const ipcSubscriberIdentifierRef = React.useRef<string>(`${identifier}-${uuid}`);
  const [state, setState] = React.useState<IIpcContextState>(initialIpcContextState);
  const [isRunningInOpenFin, ipcBusSubscriber, processId] = useOpenFinChannelSubscriber(
    ipcSubscriberIdentifierRef.current,
  );

  React.useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      isRunningInOpenFin: isRunningInOpenFin,
      ipcBusSubscriber: ipcBusSubscriber ? ipcBusSubscriber : undefined,
      processId: processId ? processId : 0,
      isIpcContextReady: !!ipcBusSubscriber,
    }));
  }, [isRunningInOpenFin, ipcBusSubscriber, processId]);

  return (
    <IpcContext.Provider
      value={{
        ...state,
      }}
    >
      {children}
    </IpcContext.Provider>
  );
};
