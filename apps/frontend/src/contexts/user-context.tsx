import { createContext, type ReactNode, useCallback, useContext, useState } from "react";

interface UserContextType {
  coins: number;
  deductCoins: (amount: number) => boolean;
  addCoins: (amount: number) => void;
  canAfford: (amount: number) => boolean;
}

const UserContext = createContext<UserContextType | null>(null);

const INITIAL_COINS = 500;

export function UserProvider({ children }: { children: ReactNode }) {
  const [coins, setCoins] = useState(INITIAL_COINS);

  const canAfford = useCallback((amount: number) => coins >= amount, [coins]);

  const deductCoins = useCallback(
    (amount: number): boolean => {
      if (coins >= amount) {
        setCoins((prev) => prev - amount);
        return true;
      }
      return false;
    },
    [coins],
  );

  const addCoins = useCallback((amount: number) => {
    setCoins((prev) => prev + amount);
  }, []);

  return (
    <UserContext.Provider value={{ coins, deductCoins, addCoins, canAfford }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
