/**
 * Push Notifications Setup Guide
 * 
 * This file contains instructions and utilities for setting up push notifications
 * with Capacitor and Firebase Cloud Messaging (FCM).
 * 
 * To enable push notifications:
 * 
 * 1. Install Capacitor Push Notifications plugin:
 *    npm install @capacitor/push-notifications
 * 
 * 2. Install Firebase SDK:
 *    npm install firebase
 * 
 * 3. Set up Firebase project:
 *    - Go to https://console.firebase.google.com
 *    - Create a new project or use existing
 *    - Add Android/iOS apps
 *    - Download google-services.json (Android) and GoogleService-Info.plist (iOS)
 *    - Place in appropriate Capacitor directories
 * 
 * 4. Configure Capacitor:
 *    - Add to capacitor.config.ts:
 *      plugins: {
 *        PushNotifications: {
 *          presentationOptions: ["badge", "sound", "alert"]
 *        }
 *      }
 * 
 * 5. Request permissions and register:
 *    - Use the functions below in your app initialization
 * 
 * 6. Set up backend endpoint to send notifications:
 *    - Create endpoint in Edge Function to send FCM messages
 *    - Store device tokens in database
 */

import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

export interface PushNotificationToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
}

/**
 * Request push notification permissions
 */
export async function requestPushPermissions(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    console.log('Push notifications only available on native platforms');
    return false;
  }

  try {
    const result = await PushNotifications.requestPermissions();
    return result.receive === 'granted';
  } catch (error) {
    console.error('Error requesting push permissions:', error);
    return false;
  }
}

/**
 * Register for push notifications
 */
export async function registerPushNotifications(
  onTokenReceived: (token: PushNotificationToken) => void,
  onNotificationReceived: (notification: any) => void,
  onError: (error: Error) => void
): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    console.log('Push notifications only available on native platforms');
    return;
  }

  try {
    // Register for push
    await PushNotifications.register();

    // Listen for registration
    PushNotifications.addListener('registration', (token) => {
      const platform = Capacitor.getPlatform() as 'ios' | 'android';
      onTokenReceived({
        token: token.value,
        platform,
      });
    });

    // Listen for notifications
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      onNotificationReceived(notification);
    });

    // Listen for notification actions
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      onNotificationReceived(action.notification);
    });

    // Handle errors
    PushNotifications.addListener('registrationError', (error) => {
      onError(new Error(error.error));
    });
  } catch (error) {
    onError(error as Error);
  }
}

/**
 * Send device token to backend
 */
export async function saveDeviceToken(
  token: PushNotificationToken,
  userId: string,
  accessToken: string
): Promise<void> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL || 'https://wmlklvlnxftedtylgxsc.supabase.co'}/functions/v1/make-server-2516be19/user/device-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          token: token.token,
          platform: token.platform,
          userId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to save device token');
    }
  } catch (error) {
    console.error('Error saving device token:', error);
    throw error;
  }
}

/**
 * Unregister from push notifications
 */
export async function unregisterPushNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await PushNotifications.unregister();
  } catch (error) {
    console.error('Error unregistering push notifications:', error);
  }
}

