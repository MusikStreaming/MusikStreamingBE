export interface JWTPayload {
  sub: string;
  exp: number;
  iat?: number;
  iss?: string;
  aud?: string;
  user_metadata: {
    role: string;
  };
}

export interface ZaloOrderInfo {
  app_id: string;
  app_trans_id: string;
  app_user: string;
  app_time: number;
  item: any;
  embed_data: any;
  amount: number;
  description: string;
  bank_code: string;
  mac?: string;
}

export interface ZaloClientInfo {
  app_id: string;
  key1: string;
  key2: string;
  embed_data?: {
    redirecturl?: string;
  };
}
