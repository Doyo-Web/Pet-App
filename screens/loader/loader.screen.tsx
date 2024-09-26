import { Image, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { styles } from '@/styles/loader/loader'
import * as Progress from "react-native-progress";
import { router } from 'expo-router';

export default function LoaderScreen() {

  const [progress, setProgress] = useState<number>(0);

useEffect(() => {
  const progressInterval = setInterval(() => {
    setProgress((prevProgress) => {
      const newProgress = prevProgress + 0.01;
      return newProgress > 1 ? 1 : newProgress; // Ensure progress doesn't exceed 1 (100%)
    });
  }, 20); // Update progress every 20ms for a smooth animation (2000ms total duration)

  // Stop the interval when progress reaches 100%
  if (progress === 1) {
    clearInterval(progressInterval);
  }

  // Automatically navigate to welcome screen after 5 seconds
  const timeout = setTimeout(() => {
    router.push("/(routes)/welcome");
  }, 2000);

  // Cleanup the interval and timeout on unmount
  return () => {
    clearInterval(progressInterval);
    clearTimeout(timeout);
  };
}, [progress]);
  
  return (
    <View style={styles.container}>
      <Image
        style={styles.gif}
        source={require("@/assets/images/Loader_Image.gif")}
      />

      <Text style={styles.text}>Get ready for pawsome care, just a sec!</Text>

      <Progress.Bar progress={progress} width={300} color={"#FDCF00"} />
    </View>
  );
}