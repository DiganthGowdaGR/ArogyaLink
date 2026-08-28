import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { UserRole } from '@/config/navigation';

type MockUser = {
  id: string;
  name: string;
  identifier: string;
  role: UserRole;
};

type LoginInput = {
  identifier: string;
  password: string;
  role: UserRole;
};

type RegisterInput = LoginInput & {
  name: string;
};

type AuthSessionContextValue = {
  isAuthenticated: boolean;
  isRestoring: boolean;
  role: UserRole | null;
  user: MockUser | null;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);
const sessionStorageKey = '@arogya-link/mock-session';

function isMockUser(value: unknown): value is MockUser {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const user = value as Record<string, unknown>;

  return (
    typeof user.id === 'string' &&
    typeof user.name === 'string' &&
    typeof user.identifier === 'string' &&
    (user.role === 'patient' || user.role === 'doctor')
  );
}

async function saveSession(user: MockUser) {
  await AsyncStorage.setItem(sessionStorageKey, JSON.stringify(user));
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const storedSession = await AsyncStorage.getItem(sessionStorageKey);

        if (storedSession) {
          const parsedSession: unknown = JSON.parse(storedSession);

          if (isMockUser(parsedSession)) {
            setUser(parsedSession);
          } else {
            await AsyncStorage.removeItem(sessionStorageKey);
          }
        }
      } catch {
        await AsyncStorage.removeItem(sessionStorageKey).catch(() => undefined);
      } finally {
        setIsRestoring(false);
      }
    }

    void restoreSession();
  }, []);

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      isAuthenticated: Boolean(user),
      isRestoring,
      role: user?.role ?? null,
      user,
      login: async ({ identifier, role }) => {
        const session: MockUser = {
          id: `mock-${role}-${Date.now()}`,
          identifier,
          role,
          name: role === 'patient' ? 'Meena K' : 'Dr. Kumar',
        };

        await saveSession(session);
        setUser(session);
      },
      register: async ({ identifier, name, role }) => {
        const session: MockUser = {
          id: `mock-${role}-${Date.now()}`,
          identifier,
          name,
          role,
        };

        await saveSession(session);
        setUser(session);
      },
      logout: async () => {
        try {
          await AsyncStorage.removeItem(sessionStorageKey);
        } finally {
          setUser(null);
        }
      },
    }),
    [isRestoring, user]
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error('useAuthSession must be used inside AuthSessionProvider');
  }

  return context;
}
