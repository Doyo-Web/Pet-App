import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from "react-native";
import { ArrowLeft, Plus } from "lucide-react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { router } from "expo-router";


const { width } = Dimensions.get("window");
const imageSize = (width - 48) / 2; // Calculate image size based on screen width (2 columns with padding)

export default function GalleryScreen() {
  const { petProfiles, isLoading, error } = useSelector(
    (state: RootState) => state.petProfile
  );

  // Flatten all pet images into a single array
  const allPetImages = petProfiles.flatMap((pet) =>
    pet.petImages.map((img) => ({ url: img.url, petName: pet.petName }))
  );

  const prevStep = () => {
    router.push("/(drawer)/(tabs)/petparents/petparentstwo");
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={prevStep}>
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>My Gallery</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Gallery Grid */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.gallery}>
          {allPetImages.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image
                source={{ uri: image.url }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          ))}

          {/* Add Photo Button */}
          <TouchableOpacity style={styles.addButton}>
            <View style={styles.addButtonInner}>
              <Plus size={24} color="#F59E0B" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    marginRight: 40, // To offset the back button and keep title centered
  },
  placeholder: {
    width: 40, // Same width as back button for symmetry
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
});
