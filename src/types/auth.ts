export type AuthUser = {
  id: number;
  full_name: string;
  email: string;
  role: string;
};

export type AuthTenant = {
  id: number;
  slug: string;
  school_name: string;
  school_address: string;
  school_phone: string;
};

export type AuthSession = {
  access_token?: string;
  user: AuthUser;
  tenant: AuthTenant;
};

export type AuthLoginInput = {
  tenant_slug: string;
  email: string;
  password: string;
};

export type AuthSignUpInput = {
  school_name: string;
  tenant_slug: string;
  admin_name: string;
  email: string;
  password: string;
  school_phone?: string;
  school_address?: string;
};
