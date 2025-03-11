import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ArrowLeft, Plus } from "lucide-react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";

const { width } = Dimensions.get("window");
const imageSize = (width - 48) / 2;

interface Host {
  hostProfile?: {
    facilityPictures?: string[];
    petPictures?: string[];
  };
}

export default function GalleryScreen() {
  const [host, setHost] = useState<Host | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHostData = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("access_token");
        if (!accessToken) {
          console.log("No access token found");
          setLoading(false);
          Alert.alert(
            "Error",
            "You are not logged in. Please log in and try again."
          );
          return;
        }

        const response = await axios.get<{ host: Host }>(`${SERVER_URI}/host`, {
          headers: { access_token: accessToken },
        });
        setHost(response.data.host);
        setLoading(false);
      } catch (error: any) {

         if (error.response?.status === 413) {
           await AsyncStorage.removeItem("access_token");
           await AsyncStorage.removeItem("refresh_token"); // Clear token
           router.replace("/(routes)/login"); // Redirect to login page
         }
        console.log("Error fetching host data:", error);
        setLoading(false);
        Alert.alert("Error", "Failed to fetch host data. Please try again.");
      }
    };

    fetchHostData();
  }, []);

  const prevStep = () => {
    router.push("/(drawer)/(tabs)/petparents/petparentstwo");
  };

  const renderImages = () => {
    const facilityPictures = host?.hostProfile?.facilityPictures || [];
    const petPictures = host?.hostProfile?.petPictures || [];
    const allPictures = [...facilityPictures, ...petPictures];

    return allPictures.map((image, index) => (
      <View key={`image-${index}`} style={styles.imageContainer}>
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={prevStep}>
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>My Gallery</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F59E0B" style={styles.loader} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.gallery}>
            {renderImages()}
            <TouchableOpacity style={styles.addButton}>
              <View style={styles.addButtonInner}>
                <Plus size={24} color="#F59E0B" />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FCD34D",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    marginRight: 40,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
  },
  gallery: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  imageContainer: {
    width: imageSize,
    height: imageSize,
    borderRadius: 16,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  addButton: {
    width: imageSize,
    height: imageSize,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FCD34D",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
