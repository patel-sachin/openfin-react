import OpenFin, { fin } from '@openfin/core';
import { EClientToProviderTopic, EProviderToClientsTopic, IDisposable } from './types';

export class IpcBusSubscriber implements IDisposable {
  private static _nextInstanceIdSuffix = 1;

  private constructor(
    private readonly _isRunningInOpenFin: boolean,
    private readonly _identity: OpenFin.Identity,
    private readonly _channelClient: OpenFin.ChannelClient | null,
  ) {}

  public static async createAsync(isRunningInOpenFin: boolean, identity: OpenFin.Identity): Promise<IpcBusSubscriber> {
    let ipcBusSubscriber: IpcBusSubscriber | null = null;
    const identityWithSuffix: OpenFin.Identity = {
      uuid: `${identity.uuid}-${this._nextInstanceIdSuffix}`,
      name: identity.name,
    };

    if (isRunningInOpenFin) {
      console.debug(`uuid: ${identityWithSuffix.uuid} | name: ${identity.name} | begin -----`);
      try {
        const channelClient = await fin.InterApplicationBus.Channel.connect(window.env.OPENFIN_CHANNEL_PROVIDER_ID, {
          protocols: ['classic'],
        });

        channelClient.onDisconnection((identity) => {
          console.debug(`Client Disconnected | ${identity.uuid} | ${identity.name}`);
        });

        channelClient.onError((action, error, identity) => {
          console.error(`onError | action: ${action} | identity: ${identity.uuid}, name: ${identity.name}`, error);
        });

        channelClient.setDefaultAction(() => undefined);

        console.debug(`uuid: ${identityWithSuffix.uuid} | name: ${identity.name} | success`);

        ipcBusSubscriber = new IpcBusSubscriber(isRunningInOpenFin, identityWithSuffix, channelClient);
      } catch (error) {
        console.error(`uuid: ${identityWithSuffix} | name: ${identity.name} | failed`, error);
      }
    }

    return ipcBusSubscriber ?? new IpcBusSubscriber(isRunningInOpenFin, identityWithSuffix, null);
  }

  public async subscribeTopicAsync(topic: EProviderToClientsTopic, listener: OpenFin.ChannelAction): Promise<void> {
    if (!this._isRunningInOpenFin || !this._channelClient) {
      return;
    }

    try {
      this.unSubscribeTopic(topic);
      this._channelClient.register(topic, listener);
    } catch (error) {
      console.error(`${this._identity.name} | ${topic} | failed`, error);
    }
  }

  public unSubscribeTopic(topic: EProviderToClientsTopic): void {
    if (!this._isRunningInOpenFin || !this._channelClient) {
      return;
    }

    try {
      this._channelClient.remove(topic);
    } catch (error) {
      console.error(`${this._identity.name} | ${topic} | failed`, error);
    }
  }

  public sendToProviderAsync(topic: EClientToProviderTopic, data?: unknown): Promise<unknown> {
    if (!this._channelClient) {
      return Promise.reject('channelClient is not initialized');
    }

    return this._channelClient.dispatch(topic, data);
  }

  public getFromProviderAsync(topic: EClientToProviderTopic, data: unknown): Promise<unknown> {
    if (!this._channelClient) {
      return Promise.reject('channelClient is not initialized');
    }

    return this._channelClient.dispatch(topic, data);
  }

  public disposeAsync(): Promise<void> {
    if (!this._channelClient) {
      return Promise.resolve(undefined);
    }

    console.debug('channelClient disconnecting', this._identity.name);
    return this._channelClient.disconnect();
  }
}
