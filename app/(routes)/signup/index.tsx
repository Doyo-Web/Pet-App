import React, { useEffect, useState } from "react";
import SignUpScreen from "@/screens/auth/signup/signup.screen";
import LoaderScreen from "@/screens/loader/loader.screen";
import useUser from "@/hooks/auth/useUser";
import { useRouter } from "expo-router"; 

export default function SignUp() {
  const { loading, user, setRefetch } = useUser();
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    setRefetch((prev) => !prev);
  }, [setRefetch]);


  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/(tabs)");
      } else {
        setShowLoader(false);
      }
    }
  }, [loading, user, router]);

 
  return <SignUpScreen />;
}
