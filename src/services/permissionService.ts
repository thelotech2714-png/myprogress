import { Camera } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { PushNotifications } from '@capacitor/push-notifications';
import { Device } from '@capacitor/device';
import { App } from '@capacitor/app';

export const permissionService = {
  async checkAllPermissions() {
    const info = await Device.getInfo();
    if (info.platform === 'web') return true;

    try {
      const camera = await Camera.checkPermissions();
      const geo = await Geolocation.checkPermissions();
      
      // Post notifications is only for Android 13+
      let pushGranted = true;
      try {
        const push = await PushNotifications.checkPermissions();
        pushGranted = push.receive === 'granted';
      } catch (e) {
        // Might fail on some platforms/versions, ignore if fails
      }

      return (
        camera.camera === 'granted' &&
        geo.location === 'granted' &&
        pushGranted
      );
    } catch (e) {
      console.error('Error checking permissions:', e);
      return false;
    }
  },

  async openSettings() {
    const info = await Device.getInfo();
    if (info.platform !== 'web') {
      await App.openAppSettings();
    }
  },

  async requestCamera() {
    const info = await Device.getInfo();
    if (info.platform === 'web') return true;
    const status = await Camera.requestPermissions();
    return status.camera === 'granted';
  },

  async requestGeolocation() {
    const info = await Device.getInfo();
    if (info.platform === 'web') return true;
    const status = await Geolocation.requestPermissions();
    return status.location === 'granted';
  },

  async requestAllPermissions() {
    const info = await Device.getInfo();
    if (info.platform === 'web') return true;

    try {
      // Camera
      await Camera.requestPermissions();
      
      // Geolocation
      await Geolocation.requestPermissions();

      // Push Notifications
      const pushStatus = await PushNotifications.checkPermissions();
      if (pushStatus.receive !== 'granted') {
        await PushNotifications.requestPermissions();
      }

      return await this.checkAllPermissions();
    } catch (e) {
      console.error('Error requesting permissions:', e);
      return false;
    }
  }
};
