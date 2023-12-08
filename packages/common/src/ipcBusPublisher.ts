import OpenFin, { fin } from '@openfin/core';
import {
  EClientToProviderTopic,
} from './types';
import { isOpenFin } from './utils';

export class IpcBusPublisher {
  private static instance: IpcBusPublisher;

  private constructor(private _isRunningInOpenFin: boolean, private _channelProvider?: OpenFin.ChannelProvider) {
    Object.values(EClientToProviderTopic).forEach((v) => this.registerTopic(v, this._channelProvider));
  }

  private quitApplication() {
    const application = fin.Application.getCurrentSync();
    if (!application) {
      console.error('Cannot quit! Application is null or undefined!');
      return;
    }

    application.quit(true).catch((error) => console.error('error during quit', error));
  }

  private registerTopic(topic: EClientToProviderTopic, channelProvider?: OpenFin.ChannelProvider): void {
    if (!this._isRunningInOpenFin || !channelProvider) {
      return;
    }

    try {
      let rv: boolean;

      switch (topic) {
        case EClientToProviderTopic.QUIT_APPLICATION:
          rv = channelProvider.register(topic, () => {
            console.log(topic);
            setTimeout(() => this.quitApplication(), 100);
            return { ack: true };
          });
          break;
        default:
          rv = true;
          break;
      }

      if (!rv) {
        console.error(`register topic failed | ${topic}`);
        return;
      }
    } catch (error) {
      console.error(`exception while registering topic ${topic}`, error);
    }
  }

  public static async getInstanceAsync(): Promise<IpcBusPublisher> {
    if (IpcBusPublisher.instance) {
      return IpcBusPublisher.instance;
    }

    console.log('creating IpcBusPublisher');
    const isRunningInOpenFin = isOpenFin();
    const channelProvider = isRunningInOpenFin ? await this.tryCreateChannelProviderAsync() : undefined;
    IpcBusPublisher.instance = new IpcBusPublisher(isRunningInOpenFin, channelProvider);

    return IpcBusPublisher.instance;
  }

  private static async tryCreateChannelProviderAsync(): Promise<OpenFin.ChannelProvider | undefined> {
    let channelProvider: OpenFin.ChannelProvider | undefined;
    try {
      channelProvider = await fin.InterApplicationBus.Channel.create(window.env.OPENFIN_CHANNEL_PROVIDER_ID, {
        protocols: ['classic'],
      });

      channelProvider.onConnection((identity) => {
        console.debug(`Client Connected | ${identity.name}`);
      });

      channelProvider.onDisconnection((identity) => {
        console.debug(`Client Disconnected | ${identity.name}`);
      });

      channelProvider.onError((action, error, identity) => {
        console.error(`onError | action: ${action} | ${identity.name}`, error);
      });
    } catch (error) {
      console.error('failed to create Channel', error);
    }
    return channelProvider;
  }
}
