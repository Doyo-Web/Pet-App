import useUser from "@/hooks/auth/useUser";
import { Redirect } from "expo-router";
import Loader from "@/components/loader/loader";
import React from "react";




export default function TabsIndex() {
 

  const { loading, user } = useUser();

  if (loading) {
    return <Loader />;
  }

  return <Redirect href={user ? "/(tabs)" : "/(routes)/loader"} />;
}
