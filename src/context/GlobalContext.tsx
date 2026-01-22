import { api } from "@/services/api";
import { useEffect, createContext, useState } from "react";
export const GlobalContext = createContext({});

export const GlobalContextProvider = ({ children }: any) => {
  const [currentUser, setCurrentUser] = useState();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setIsLoading(true);
        const tokenExist = localStorage.getItem("accessToken");
        tokenExist;

        if (tokenExist) {
          const res = await api.get(
            "/users/get-user-from-token/pass-token-in-header"
          );
          res?.data;
          res && setCurrentUser(res?.data?.data?.user);
          setIsLoading(false);
        }
      } catch (error) {
        setIsLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  return (
    <GlobalContext.Provider value={{ currentUser, setCurrentUser, isLoading }}>
      {children}
    </GlobalContext.Provider>
  );
};
