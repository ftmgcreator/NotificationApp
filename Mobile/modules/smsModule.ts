import { NativeModules, Platform } from 'react-native';

const { SmsModule } = NativeModules;

export const smsModule = {
    sendSms: (phoneNumber: string, message: string): Promise<boolean> => {
        if (Platform.OS !== 'android') return Promise.resolve(false);
        return SmsModule.sendSms(phoneNumber, message);
    },
};
