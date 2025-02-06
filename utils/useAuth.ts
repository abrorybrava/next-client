"use client";

import { useEffect, useState } from "react";

const useAuth = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Retrieve user data from localStorage
    const storedUser = localStorage.getItem("dataUser");

    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Parse and set the user data
    }
  }, []);

  const deleteAuth = () => {
    setUser(null);
    localStorage.removeItem("dataUser"); // Optionally clear the data from localStorage as well
  };

  return { user, deleteAuth };
};

export default useAuth;
