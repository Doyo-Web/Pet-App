import React, { Key, useCallback, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
  TextInput,
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
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setBookingData } from "@/store/bookingSlice";
import { useFocusEffect } from "@react-navigation/native";
import {
  widthPixel,
  heightPixel,
  fontPixel,
  pixelSizeVertical,
  pixelSizeHorizontal,
} from "../../utils/responsive";

interface Pet {
  petName: string;
  petImages: any;
  _id: Key | null | undefined;
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
  city: string;
  location: Location;
  diet: "packed" | "home";
}

export default function BookingScreen(): JSX.Element {
  const dispatch = useDispatch();

  const [bookData, setBookData] = useState<BookData>({
    pets: [],
    startDate: new Date(),
    startTime: new Date(),
    endDate: new Date(),
    endTime: new Date(),
    city: "",
    location: { type: "Home", address: "Mumbai" },
    diet: "packed",
  });

  const [showMap, setShowMap] = useState<boolean>(false);
  const [showUnavailablePopup, setShowUnavailablePopup] =
    useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [datePickerMode, setDatePickerMode] = useState<"date" | "time">("date");
  const [currentDatePickerField, setCurrentDatePickerField] =
    useState<
      keyof Pick<BookData, "startDate" | "startTime" | "endDate" | "endTime">
    >("startDate");
  const [petProfiles, setPetProfiles] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchPetProfiles = async () => {
        try {
          setIsLoading(true);
          const accessToken = await AsyncStorage.getItem("access_token");
          const response = await axios.get(`${SERVER_URI}/petprofile-get`, {
            headers: { access_token: accessToken },
          });
          if (response.data.success) {
            setPetProfiles(response.data.data);
          } else {
            setError("Failed to fetch pet profiles");
          }
        } catch (error) {
          setError("An error occurred while fetching pet profiles");
        } finally {
          setIsLoading(false);
        }
      };

      fetchPetProfiles();
    }, [])
  );

  // const { petProfiles, isLoading, error } = useSelector(
  //   (state: RootState) => state.petProfile
  // );

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

  const handleInputChange = (newCity: string) => {
    setBookData((prev) => ({
      ...prev,
      city: newCity,
    }));
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
        dispatch(setBookingData(response.data.booking));
        router.push("./booknowtwo");
      } else {
        console.log("Booking failed:", response.data.message);
        Alert.alert(
          "Booking Failed",
          response.data.message ||
            "An error occurred while booking. Please try again."
        );
      }
    } catch (error) {
      console.log("Error during booking:", error);
      if (axios.isAxiosError(error)) {
        console.log("Axios error details:", error.response?.data);
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.boardingbox}>
          <TouchableOpacity style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.header}>Boarding</Text>
        </View>

        <Text style={styles.sectionTitle}>Choose your pet(s)</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.petsContainer}
        >
          {petProfiles.map((pet) => (
            <TouchableOpacity
              key={pet._id}
              onPress={() =>
                togglePetSelection({
                  id: pet.id,
                  name: pet.petName,
                  image: pet.petImages[0]?.url ?? null,
                  _id: undefined,
                  petName: "",
                  petImages: undefined,
                })
              }
              style={[
                styles.petItem,
                bookData.pets.some((p) => p.id === pet._id) && styles.petImage,
              ]}
            >
              <Image
                source={{ uri: pet.petImages[0]?.url }}
                style={[styles.petImage, styles.selectedPet]}
              />
              <Text>{pet.petName}</Text>
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

        <View style={styles.inputContainer}>
          <Text style={styles.label}>City</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={bookData.city}
              onChangeText={(text) => handleInputChange(text)}
              placeholder="Enter city"
            />
            <Icon name="business" size={20} color="#999" style={styles.icon} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Pick your Location</Text>
        <View style={styles.locationsContainer}>
          {["Home", "Work", "Friend"].map((locationType) => (
            <View style={styles.locationItem} key={locationType}>
              <TouchableOpacity
                style={[
                  styles.locationButton,
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
                  size={fontPixel(50)}
                  color="#000"
                />
              </TouchableOpacity>
              <Text style={styles.locationText}>{locationType}</Text>
              <Text style={styles.locationAddress}>Mumbai</Text>
            </View>
          ))}

          <View style={styles.locationItem}>
            <TouchableOpacity
              style={[styles.locationButton, { backgroundColor: "#FDCF00" }]}
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
    paddingHorizontal: pixelSizeHorizontal(20),
  },
  boardingbox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: pixelSizeVertical(20),
    backgroundColor: "#F96247",
    borderRadius: widthPixel(6),
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
    fontSize: fontPixel(18),
    color: "#fff",
    fontFamily: "OtomanopeeOne",
  },
  sectionTitle: {
    fontSize: fontPixel(16),
    fontFamily: "Nunito_700Bold",
    marginTop: pixelSizeVertical(20),
    marginBottom: pixelSizeVertical(10),
    textAlign: "center",
  },
  petsContainer: {
    flexDirection: "row",
    marginBottom: pixelSizeVertical(20),
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
    borderRadius: 100,
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
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  noPetsText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: widthPixel(5),
    padding: pixelSizeHorizontal(10),
    marginBottom: pixelSizeVertical(10),
  },
  locationsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: pixelSizeVertical(20),
  },
  locationItem: {
    alignItems: "center",
    width: "25%",
    marginBottom: pixelSizeVertical(10),
  },
  locationButton: {
    width: widthPixel(60),
    height: heightPixel(60),
    borderRadius: widthPixel(30),
    justifyContent: "center",
    alignItems: "center",
  },
  selectedLocation: {
    borderWidth: 2,
    borderColor: "#000",
  },
  locationText: {
    marginTop: pixelSizeVertical(5),
    fontSize: fontPixel(12),
  },
  locationAddress: {
    fontSize: fontPixel(10),
    color: "#666",
  },
  bookButton: {
    backgroundColor: "#F96247",
    borderRadius: widthPixel(5),
    padding: pixelSizeVertical(15),
    alignItems: "center",
    marginBottom: pixelSizeVertical(175),
  },
  bookButtonText: {
    color: "#fff",
    fontSize: fontPixel(16),
    fontWeight: "bold",
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  closeMapButton: {
    backgroundColor: "#F96247",
    padding: pixelSizeHorizontal(10),
    borderRadius: widthPixel(5),
    margin: pixelSizeVertical(10),
  },
  closeMapButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  popupContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    backgroundColor: "#fff",
    padding: pixelSizeHorizontal(20),
    borderRadius: widthPixel(10),
    alignItems: "center",
  },
  popupText: {
    fontSize: fontPixel(16),
    marginBottom: pixelSizeVertical(10),
    textAlign: "center",
  },
  popupButton: {
    backgroundColor: "#F96247",
    padding: pixelSizeHorizontal(10),
    borderRadius: widthPixel(5),
  },
  popupButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  dietContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: pixelSizeVertical(20),
  },
  dietItem: {
    alignItems: "center",
    width: "48%",
  },
  iconContainer: {
    width: widthPixel(80),
    height: heightPixel(80),
    borderRadius: widthPixel(40),
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: pixelSizeVertical(10),
  },
  dietText: {
    fontSize: fontPixel(14),
    fontWeight: "bold",
  },
  dietSubtext: {
    fontSize: fontPixel(12),
    color: "#666",
  },
  selectedDiet: {
    borderColor: "#000",
    borderWidth: 2,
    borderRadius: 50,
  },
  inputContainer: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },

  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
  },

  icon: {
    marginLeft: -30,
  },
});
