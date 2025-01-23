"use client";

import { useEffect } from "react";
import Cookies from "js-cookie"; 

const useAuth = (): boolean => {
  useEffect(() => {
    const token = Cookies.get("token"); 

    console.log('Token from cookie:', token);

    if (token) {
      const now = Date.now();
    } else {
      window.location.href = "/";
    }
  }, []);

  return true;
};

export default useAuth;
