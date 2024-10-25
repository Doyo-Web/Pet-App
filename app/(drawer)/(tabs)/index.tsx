import HomeScreen from "@/screens/home/home.screen";
import React, { useEffect, useRef, useState } from "react";
import { Alert, BackHandler } from "react-native";
import { Toast } from "react-native-toast-notifications";

export default function index() {

 const [isExit, setIsExit] = useState(false);
 const backPressTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);


 useEffect(() => {
   const backAction = () => {
     if (isExit) {
       BackHandler.exitApp(); // Close the app
       return true;
     } else {
       setIsExit(true);
        Toast.show("Press back again to exit the app", {
          type: "info",
        });

       backPressTimeout.current = setTimeout(() => {
         setIsExit(false); // Reset the exit state after 2 seconds
       }, 2000);

       return true;
     }
   };

   const backHandler = BackHandler.addEventListener(
     "hardwareBackPress",
     backAction
   );

   return () => {
     backHandler.remove(); // Clean up event listener on unmount
     if (backPressTimeout.current) {
       clearTimeout(backPressTimeout.current);
     } // Clear timeout if unmounted before timeout
   };
 }, [isExit]);
  
  return <HomeScreen />;
}
