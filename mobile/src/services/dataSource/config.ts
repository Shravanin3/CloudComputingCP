export const USE_MOCK_DATA = process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true';
export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
