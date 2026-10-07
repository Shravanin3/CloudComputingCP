export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export interface Tenant {
  id: string;
  shopName: string;
  gstinNumber?: string;
  address?: string;
  subscriptionTier?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  tenant: Tenant;
}

export interface MeResponse {
  user: User;
  tenant: Tenant;
}
