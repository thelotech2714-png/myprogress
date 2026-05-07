import { Camera } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { PushNotifications } from '@capacitor/push-notifications';
import { Device } from '@capacitor/device';
import { App } from '@capacitor/app';

export const permissionService = {
  async checkAllPermissions() {
    try {
      const info = await Device.getInfo();
      if (info.platform === 'web') return true;

      const camera = await Camera.checkPermissions();
      const geo = await Geolocation.checkPermissions();
      
      // Post notifications is only for Android 13+
      let pushGranted = true;
      try {
        const push = await PushNotifications.checkPermissions();
        // Be lenient: only consider it not granted if it's explicitly denied
        pushGranted = push.receive !== 'denied'; 
      } catch (e) {
        console.warn('Push permissions check failed:', e);
      }

      return (
        camera.camera === 'granted' &&
        geo.location === 'granted' &&
        pushGranted
      );
    } catch (e) {
      console.error('Error checking permissions:', e);
      // Fallback to true on errors to avoid blocking the app completely if a plugin fails
      return true; 
    }
  },

  async openSettings() {
    const info = await Device.getInfo();
    if (info.platform !== 'web') {
      try {
        await (App as any).openAppSettings();
      } catch (e) {
        console.error('Error opening app settings:', e);
      }
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
    try {
      const info = await Device.getInfo();
      if (info.platform === 'web') return true;

      // Camera - Explicitly request camera
      console.log('Requesting camera permission...');
      try {
        await Camera.requestPermissions({ permissions: ['camera'] });
      } catch (e) {
        console.warn('Camera request failed:', e);
      }
      
      // Geolocation - Explicitly request location
      console.log('Requesting geolocation permission...');
      try {
        await Geolocation.requestPermissions();
      } catch (e) {
        console.warn('Geolocation request failed:', e);
      }

      // Push Notifications - Optional but recommended if configured
      try {
        const pushStatus = await PushNotifications.checkPermissions();
        if (pushStatus.receive !== 'granted') {
          await PushNotifications.requestPermissions();
        }
      } catch (e) {
        console.warn('Push permissions request failed:', e);
      }

      return await this.checkAllPermissions();
    } catch (e) {
      console.error('Error requesting permissions:', e);
      return true; // Fallback to avoid blocking
    }
  }
};
