type AuthCallback = () => void;
let onUnauthorizedCallback: AuthCallback | null = null;

export const setUnauthorizedCallback = (callback: AuthCallback) => {
  onUnauthorizedCallback = callback;
};

export const triggerUnauthorized = () => {
  if (onUnauthorizedCallback) {
    onUnauthorizedCallback();
  }
};
