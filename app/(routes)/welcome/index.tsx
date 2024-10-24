import React, { useEffect } from "react";
import { Redirect } from "expo-router";
import WelcomeScreen from "@/screens/welcome/welcome.screen";
import useUser from "@/hooks/auth/useUser";

const Welcome = () => {
  const { loading, user } = useUser();

  if (loading) {
    return null;
  }

  return (
    <>
      {user ? (
        <Redirect href="/(tabs)" /> // Redirect to tabs if logged in
      ) : (
        <WelcomeScreen /> // Show the welcome screen if not logged in
      )}
    </>
  );
};

export default Welcome;
