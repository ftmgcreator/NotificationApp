import { DeviceEventEmitter, NativeModules, Platform } from 'react-native';

const { CallModule } = NativeModules;

export type CallState = 'dialing' | 'ringing' | 'answered' | 'ended';

export const callModule = {
    makeCall: (phoneNumber: string): Promise<boolean> => {
        if (Platform.OS !== 'android') return Promise.resolve(false);
        return CallModule.makeCall(phoneNumber);
    },

    endCall: (): Promise<boolean> => {
        if (Platform.OS !== 'android') return Promise.resolve(false);
        return CallModule.endCall();
    },

    muteMicrophone: (muted: boolean): Promise<boolean> => {
        if (Platform.OS !== 'android') return Promise.resolve(false);
        return CallModule.muteMicrophone(muted);
    },

    playAudioToCall: (filePath: string): Promise<boolean> => {
        if (Platform.OS !== 'android') return Promise.resolve(false);
        return CallModule.playAudioToCall(filePath);
    },

    onCallStateChanged: (callback: (state: CallState) => void) => {
        const sub = DeviceEventEmitter.addListener('callStateChanged', (data) => {
            callback(data.state as CallState);
        });
        return () => sub.remove();
    },

    onCallAnswered: (callback: () => void) => {
        const sub = DeviceEventEmitter.addListener('callAnswered', callback);
        return () => sub.remove();
    },
};
