export const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
export const isRequired = (value: string) => value.trim().length > 0;
export const isPositiveNumber = (value: number) => value > 0;