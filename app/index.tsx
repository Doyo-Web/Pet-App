import useUser from "@/hooks/auth/useUser";
import { Redirect } from "expo-router";
import Loader from "@/components/loader/loader";
import React from "react";

export default function TabsIndex() {
  const { loading, user } = useUser();
  console.log(user);
  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <Redirect href={!user ? "/(routes)/loader" : "/(tabs)"} />
      )}
    </>
  );
}
