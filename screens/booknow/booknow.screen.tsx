import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import MapView, { Marker } from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialIcons";
import { router } from "expo-router";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Pet {
  id: string;
  name: string;
  image: string | null;
}

interface Location {
  type: string;
  address: string;
}

interface BookData {
  pets: Pet[];
  startDate: Date;
  startTime: Date;
  endDate: Date;
  endTime: Date;
  location: Location;
  diet: "packed" | "home";
}

export default function BookingScreen(): JSX.Element {
  const [bookData, setBookData] = useState<BookData>({
    pets: [],
    startDate: new Date(),
    startTime: new Date(),
    endDate: new Date(),
    endTime: new Date(),
    location: { type: "Home", address: "Mumbai" },
    diet: "packed",
  });

  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [showUnavailablePopup, setShowUnavailablePopup] =
    useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [datePickerMode, setDatePickerMode] = useState<"date" | "time">("date");
  const [currentDatePickerField, setCurrentDatePickerField] =
    useState<
      keyof Pick<BookData, "startDate" | "startTime" | "endDate" | "endTime">
    >("startDate");

  useEffect(() => {
    const fetchPets = async () => {
      const accessToken = await AsyncStorage.getItem("access_token");
      try {
        const response = await axios.get<{ success: boolean; data: any[] }>(
          `${SERVER_URI}/petprofile-get`,
          {
            headers: { access_token: accessToken },
          }
        );
        const filteredPets = response.data.data.map((pet: any) => ({
          id: pet._id,
          name: pet.petName,
          image: pet.petImages.length > 0 ? pet.petImages[0].url : null,
        }));
        setAllPets(filteredPets);
      } catch (error) {
        console.error("Error fetching pet profiles:", error);
        if (axios.isAxiosError(error)) {
          console.error("Axios error details:", error.response?.data);
        }
        Alert.alert("Error", "Failed to fetch pet profiles. Please try again.");
      }
    };
    fetchPets();
  }, []);

  const togglePetSelection = (pet: Pet) => {
    setBookData((prev) => {
      const isPetSelected = prev.pets.some((p) => p.id === pet.id);
      if (isPetSelected) {
        return { ...prev, pets: prev.pets.filter((p) => p.id !== pet.id) };
      } else {
        return { ...prev, pets: [...prev.pets, pet] };
      }
    });
  };

  const addNewPet = () => {
    router.push("/(drawer)/(tabs)/profile");
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ): void => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBookData((prev) => ({
        ...prev,
        [currentDatePickerField]: selectedDate,
      }));
    }
  };

  const showDatePickerModal = (
    mode: "date" | "time",
    field: keyof Pick<
      BookData,
      "startDate" | "startTime" | "endDate" | "endTime"
    >
  ): void => {
    setShowDatePicker(true);
    setDatePickerMode(mode);
    setCurrentDatePickerField(field);
  };

  const handleLocationSelect = (location: Location): void => {
    if (location.address === "Delhi") {
      setShowUnavailablePopup(true);
    } else {
      setBookData((prev) => ({ ...prev, location }));
    }
    setShowMap(false);
  };

  const handleBookNow = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      const response = await axios.post(`${SERVER_URI}/booking`, bookData, {
        headers: { access_token: accessToken },
      });
      if (response.data.success) {
        router.push("./booknowtwo");
      } else {
        console.error("Booking failed:", response.data.message);
        Alert.alert(
          "Booking Failed",
          response.data.message ||
            "An error occurred while booking. Please try again."
        );
      }
    } catch (error) {
      console.error("Error during booking:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", error.response?.data);
        Alert.alert(
          "Booking Error",
          error.response?.data?.message ||
            "An unexpected error occurred. Please try again."
        );
      } else {
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.boardingbox}>
        <TouchableOpacity style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.header}>Boarding</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Choose your pet(s)</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.petsContainer}
        >
          {allPets.map((pet) => (
            <TouchableOpacity
              key={pet.id}
              style={[
                styles.petItem,
                bookData.pets.some((p) => p.id === pet.id) &&
                  styles.selectedPet,
              ]}
              onPress={() => togglePetSelection(pet)}
            >
              <Image
                source={{
                  uri: pet.image
                    ? pet.image
                    : "/placeholder.svg?height=100&width=100",
                }}
                style={styles.petImage}
              />
              <Text style={styles.petName}>{pet.name}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.addNewPet} onPress={addNewPet}>
            <Icon name="add" size={40} color="#fff" />
            <Text style={styles.addNewText}>Add New</Text>
          </TouchableOpacity>
        </ScrollView>

        <Text style={styles.sectionTitle}>Start Date</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => showDatePickerModal("date", "startDate")}
        >
          <Text>{bookData.startDate.toLocaleDateString()}</Text>
          <Icon name="calendar-today" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => showDatePickerModal("time", "startTime")}
        >
          <Text>{bookData.startTime.toLocaleTimeString()}</Text>
          <Icon name="access-time" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>End Date</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => showDatePickerModal("date", "endDate")}
        >
          <Text>{bookData.endDate.toLocaleDateString()}</Text>
          <Icon name="calendar-today" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => showDatePickerModal("time", "endTime")}
        >
          <Text>{bookData.endTime.toLocaleTimeString()}</Text>
          <Icon name="access-time" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Pick your Location</Text>
        <View style={styles.locationsContainer}>
          {["Home", "Work", "Friend"].map((locationType) => (
            <View style={styles.locationsContainerbox} key={locationType}>
              <TouchableOpacity
                style={[
                  styles.locationItem,
                  bookData.location.type === locationType &&
                    styles.selectedLocation,
                  {
                    backgroundColor:
                      locationType === "Home"
                        ? "#FDCF00"
                        : locationType === "Work"
                        ? "#00D0C3"
                        : "#F96247",
                  },
                ]}
                onPress={() =>
                  setBookData((prev) => ({
                    ...prev,
                    location: { type: locationType, address: "Mumbai" },
                  }))
                }
              >
                <Icon
                  name={
                    locationType === "Home"
                      ? "home"
                      : locationType === "Work"
                      ? "work"
                      : "person"
                  }
                  size={50}
                  color="#000"
                />
              </TouchableOpacity>
              <Text style={styles.locationText}>{locationType}</Text>
              <Text style={styles.locationAddress}>Mumbai</Text>
            </View>
          ))}

          <View style={styles.locationsContainerbox}>
            <TouchableOpacity
              style={[styles.locationItembox, { backgroundColor: "#FDCF00" }]}
              onPress={() => setShowMap(true)}
            >
              <Icon name="add" size={50} color="#000" />
            </TouchableOpacity>
            <Text style={styles.locationText}>Add New</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Pet's Diet</Text>
        <View style={styles.dietContainer}>
          <TouchableOpacity
            style={[styles.dietItem]}
            onPress={() => setBookData((prev) => ({ ...prev, diet: "packed" }))}
          >
            <View
              style={[
                styles.iconContainer,
                bookData.diet === "packed" && styles.selectedDiet,
              ]}
            >
              <Icon name="inventory" size={40} color="#000" />
            </View>
            <Text style={styles.dietText}>Packed food</Text>
            <Text style={styles.dietSubtext}>by Pet Parent</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dietItem]}
            onPress={() => setBookData((prev) => ({ ...prev, diet: "home" }))}
          >
            <View
              style={[
                styles.iconContainer,
                bookData.diet === "home" && styles.selectedDiet,
              ]}
            >
              <Icon name="restaurant" size={40} color="#000" />
            </View>
            <Text style={styles.dietText}>Home food</Text>
            <Text style={styles.dietSubtext}>by Host</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleBookNow} style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={bookData[currentDatePickerField]}
          mode={datePickerMode}
          is24Hour={true}
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Modal visible={showMap} animationType="slide">
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 19.076,
              longitude: 72.8777,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker
              coordinate={{ latitude: 19.076, longitude: 72.8777 }}
              title="Mumbai"
              description="Available"
              onPress={() =>
                handleLocationSelect({ type: "Custom", address: "Mumbai" })
              }
            />
            <Marker
              coordinate={{ latitude: 19.1, longitude: 72.9 }}
              title="Unavailable City"
              description="Service not available"
              onPress={() =>
                handleLocationSelect({
                  type: "Custom",
                  address: "Unavailable City",
                })
              }
            />
          </MapView>
          <TouchableOpacity
            style={styles.closeMapButton}
            onPress={() => setShowMap(false)}
          >
            <Text style={styles.closeMapButtonText}>Close Map</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={showUnavailablePopup} transparent animationType="fade">
        <View style={styles.popupContainer}>
          <View style={styles.popup}>
            <Text style={styles.popupText}>
              Service is not available in your city.
            </Text>
            <TouchableOpacity
              style={styles.popupButton}
              onPress={() => setShowUnavailablePopup(false)}
            >
              <Text style={styles.popupButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  boardingbox: {
    backgroundColor: "#F96247",
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    height: 70,
  },
  backButton: {
    zIndex: 1,
    width: 36,
    height: 36,
    position: "absolute",
    left: 10,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 50,
  },
  header: {
    fontSize: 18,
    color: "#fff",
    fontFamily: "OtomanopeeOne",
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  petsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  petItem: {
    alignItems: "center",
    marginRight: 20,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  petName: {
    marginTop: 5,
  },
  selectedPet: {
    borderColor: "#FF6347",
    borderWidth: 2,
    borderRadius: 40,
  },
  addNewPet: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF6347",
    justifyContent: "center",
    alignItems: "center",
  },
  addNewText: {
    color: "#fff",
    marginTop: 5,
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  locationsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  locationsContainerbox: {
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  locationItembox: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
  },
  locationItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    padding: 10,
    marginBottom: 10,
  },
  selectedLocation: {
    borderColor: "#FFF",
    backgroundColor: "#FFF",
  },
  locationText: {
    marginTop: 5,
  },
  locationAddress: {
    fontSize: 12,
    color: "#666",
  },
  bookButton: {
    backgroundColor: "#FF6347",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
    marginBottom: 156,
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  closeMapButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#FF6347",
    borderRadius: 5,
    padding: 10,
  },
  closeMapButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  popupContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  popup: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  popupText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  popupButton: {
    backgroundColor: "#FF6347",
    borderRadius: 5,
    padding: 10,
  },
  popupButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  dietContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 20,
  },
  dietItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  dietText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  dietSubtext: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
  selectedDiet: {
    borderColor: "#000",
    borderWidth: 2,
    borderRadius: 50,
  },
});