import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import {
  getCurrentUser,
  login as loginRequest,
  type CurrentUser,
} from "../services/api";


type AuthContextValue = {
  user: CurrentUser | null;
  token: string | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
};


const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );


const TOKEN_KEY = "aerovision_access_token";


export function AuthProvider({
  children,
}: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY),
  );

  const [user, setUser] =
    useState<CurrentUser | null>(null);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    getCurrentUser(token)
      .then((currentUser) => {
        setUser(currentUser);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);


  async function login(
    email: string,
    password: string,
  ) {
    const response = await loginRequest(
      email.trim(),
      password,
    );

    localStorage.setItem(
      TOKEN_KEY,
      response.access_token,
    );

    setToken(response.access_token);

    const currentUser =
      await getCurrentUser(
        response.access_token,
      );

    setUser(currentUser);
  }


  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }


  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
    }),
    [user, token, loading],
  );


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider.",
    );
  }

  return context;
}