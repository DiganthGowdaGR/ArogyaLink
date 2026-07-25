type PublicEnv = {
  EXPO_PUBLIC_API_URL?: string;
  EXPO_PUBLIC_SUPABASE_URL?: string;
  EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
};

declare const process:
  | {
      env?: PublicEnv;
    }
  | undefined;

const readPublicEnv = (key: keyof PublicEnv) => process?.env?.[key] ?? '';

export const env = {
  apiUrl: readPublicEnv('EXPO_PUBLIC_API_URL'),
  supabaseUrl: readPublicEnv('EXPO_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: readPublicEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
} as const;

export type AppEnv = typeof env;
