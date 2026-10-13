import { Alert, Platform } from 'react-native';

/**
 * Polyfills Alert.alert for React Native Web where Alert.alert is otherwise a silent no-op.
 * Ensures button callbacks (such as navigation.goBack()) are reliably invoked.
 */
if (Platform.OS === 'web') {
  Alert.alert = (title: string, message?: string, buttons?: any[]) => {
    const text = message ? `${title}\n\n${message}` : title;
    if (typeof window !== 'undefined') {
      if (buttons && buttons.length > 1) {
        const confirmButton =
          buttons.find((b) => b.style !== 'cancel') || buttons[buttons.length - 1];
        const confirmed = window.confirm(text);
        if (confirmed && confirmButton?.onPress) {
          confirmButton.onPress();
        } else {
          const cancelButton = buttons.find((b) => b.style === 'cancel');
          if (cancelButton?.onPress) {
            cancelButton.onPress();
          }
        }
      } else {
        window.alert(text);
        if (buttons && buttons[0]?.onPress) {
          buttons[0].onPress();
        }
      }
    }
  };
}
