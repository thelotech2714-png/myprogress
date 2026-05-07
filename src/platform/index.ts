import { Capacitor } from '@capacitor/core';

export const isNative = () => {
  return Capacitor.isNativePlatform();
};

export const isWeb = () => {
  return !isNative();
};

export const getPlatform = () => {
  return Capacitor.getPlatform();
};
