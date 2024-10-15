import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  SafeAreaView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import MapView, { Marker } from "react-native-maps";
import Icon from "react-native-vector-icons/Ionicons";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

export default function HostScreen() {

  const apiKey = "AIzaSyCjJZAxdNLakBt50NPO9rCXd4-plRiXLcA";

  const [currentStep, setCurrentStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 19.076,
    longitude: 72.8777,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [profile, setProfile] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    age: "",
    gender: "",
    dateOfBirth: new Date(),
    profession: "",
    location: "",
    line1: "",
    line2: "",
    city: "",
    pincode: "",
    residenceType: "",
    builtUpArea: "",
  });

  const handleInputChange = (name: string, value: string) => {
    setProfile((prevProfile) => ({ ...prevProfile, [name]: value }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setProfile((prevProfile) => ({
        ...prevProfile,
        dateOfBirth: selectedDate,
      }));
    }
  };

 const handleMapPress = async (event: any) => {
   const { latitude, longitude } = event.nativeEvent.coordinate;

   // Update the map region with the new marker position
   setMapRegion({
     latitude,
     longitude,
     latitudeDelta: 0.0922,
     longitudeDelta: 0.0421,
   });

   try {
     // Use reverse geocoding to get the address based on lat/lng
     const response = await axios.get(
       `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
     );

     if (response.data.results.length > 0) {
       const addressComponents = response.data.results[0].address_components;

       // Get city and pincode from the response
       const cityComponent = addressComponents.find(
         (component: { types: string | string[] }) =>
           component.types.includes("locality") ||
           component.types.includes("administrative_area_level_1")
       );
       const pincodeComponent = addressComponents.find(
         (component: { types: string | string[] }) =>
           component.types.includes("postal_code")
       );

       const formattedAddress = response.data.results[0].formatted_address;
       const addressParts = formattedAddress.split(", ");

       // Assuming the address has at least 2 lines
       const line1Value = addressParts[0] || "";
       const line2Value = addressParts[1] || "";

       // Update profile with location details
       setProfile((prevProfile) => ({
         ...prevProfile,
         location: cityComponent ? cityComponent.long_name : "",
         line1: line1Value,
         line2: line2Value,
         city: cityComponent ? cityComponent.long_name : "",
         pincode: pincodeComponent ? pincodeComponent.long_name : "",
       }));

       setShowMap(false);
     }
   } catch (error) {
     console.error("Error getting location data:", error);
   }

   setShowMap(false);
 };


  const totalSteps = 3;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prevStep) => prevStep - 1); // Use functional state update for reliable results
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <Text style={styles.steponetext}>About yourself</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={profile.fullName}
                  onChangeText={(text) => handleInputChange("fullName", text)}
                  placeholder="John Sebastian"
                />
                <Icon
                  name="person"
                  size={20}
                  color="#999"
                  style={styles.icon}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone number</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={profile.phoneNumber}
                  onChangeText={(text) =>
                    handleInputChange("phoneNumber", text)
                  }
                  placeholder="+91 xxxxxxxxxx"
                  keyboardType="phone-pad"
                />
                <Icon name="call" size={20} color="#999" style={styles.icon} />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={profile.email}
                  onChangeText={(text) => handleInputChange("email", text)}
                  placeholder="john@gmail.com"
                  keyboardType="email-address"
                />
                <Icon name="mail" size={20} color="#999" style={styles.icon} />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Age</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={profile.age}
                  onValueChange={(itemValue) =>
                    handleInputChange("age", itemValue)
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Select age" value="" />
                  {[...Array(100)].map((_, i) => (
                    <Picker.Item
                      key={i}
                      label={`${i + 1} years`}
                      value={`${i + 1}`}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={profile.gender}
                  onValueChange={(itemValue) =>
                    handleInputChange("gender", itemValue)
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Select gender" value="" />
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Other" value="other" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date of Birth</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text>{profile.dateOfBirth.toDateString()}</Text>
                <Icon name="calendar" size={20} color="#999" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={profile.dateOfBirth}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Profession</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={profile.profession}
                  onChangeText={(text) => handleInputChange("profession", text)}
                  placeholder="Enter your profession"
                />
                <Icon
                  name="briefcase"
                  size={20}
                  color="#999"
                  style={styles.icon}
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Your Address</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Pick your location</Text>
              <TouchableOpacity
                style={styles.locationButton}
                onPress={() => setShowMap(true)}
              >
                <Text>{profile.location || "Select location"}</Text>
                <Icon name="map" size={20} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Line 1</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={profile.line1}
                  onChangeText={(text) => handleInputChange("line1", text)}
                  placeholder="Enter address line 1"
                />
                <Icon name="home" size={20} color="#999" style={styles.icon} />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Line 2</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={profile.line2}
                  onChangeText={(text) => handleInputChange("line2", text)}
                  placeholder="Enter address line 2"
                />
                <Icon name="home" size={20} color="#999" style={styles.icon} />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>City</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={profile.city}
                  onChangeText={(text) => handleInputChange("city", text)}
                  placeholder="Enter city"
                />
                <Icon
                  name="business"
                  size={20}
                  color="#999"
                  style={styles.icon}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Pincode</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={profile.pincode}
                  onChangeText={(text) => handleInputChange("pincode", text)}
                  placeholder="Enter pincode"
                  keyboardType="numeric"
                />
                <Icon name="pin" size={20} color="#999" style={styles.icon} />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Residence type</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={profile.residenceType}
                  onValueChange={(itemValue) =>
                    handleInputChange("residenceType", itemValue)
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Select residence type" value="" />
                  <Picker.Item label="800-2000 sq ft" value="800-2000" />
                  <Picker.Item label="2000-3000 sq ft" value="2000-3000" />
                  <Picker.Item label="3000+ sq ft" value="3000+" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Built up area of residence ( in sq.ft )
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={profile.builtUpArea}
                  onValueChange={(itemValue) =>
                    handleInputChange("builtUpArea", itemValue)
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Select built up area" value="" />
                  <Picker.Item label="800-2000 sq ft" value="800-2000" />
                  <Picker.Item label="2000-3000 sq ft" value="2000-3000" />
                  <Picker.Item label="3000+ sq ft" value="3000+" />
                </Picker>
              </View>
            </View>

            <Modal visible={showMap} animationType="slide">
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  region={mapRegion}
                  onPress={handleMapPress}
                >
                  <Marker coordinate={mapRegion} />
                </MapView>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowMap(false)}
                >
                  <Text style={styles.closeButtonText}>Close Map</Text>
                </TouchableOpacity>
              </View>
            </Modal>
          </>
        );
      case 2:
        return (
          <View>
            <Text>Step 2</Text>
          </View>
        );
      case 3:
        return (
          <View>
            <Text>Step 3</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={prevStep}>
        <View style={styles.header}>
          <TouchableOpacity onPress={prevStep} style={styles.arrowTouchable}>
            <View style={styles.arrowcontainer}>
              <Icon name="arrow-back" size={24} color="#000" />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Host Profile</Text>
          <View style={styles.progressContainer}>
            {Array.from({ length: totalSteps }, (_, i) => (
              <React.Fragment key={i}>
                {i > 0 && (
                  <View
                    style={[
                      styles.progressLine,
                      i < currentStep
                        ? styles.progressLineCompleted
                        : styles.progressLineFuture,
                    ]}
                  />
                )}
                <View
                  style={[
                    styles.progressDot,
                    i + 1 === currentStep
                      ? styles.progressDotCurrent
                      : i + 1 < currentStep
                      ? styles.progressDotCompleted
                      : styles.progressDotFuture,
                  ]}
                />
              </React.Fragment>
            ))}
          </View>
        </View>
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}

        <View style={styles.bottomNavigation}>
          {currentStep < totalSteps ? (
            <TouchableOpacity style={styles.button} onPress={nextStep}>
              <Text style={styles.buttonText}>
                {currentStep === 1 && "Next to Preferences"}{" "}
                {currentStep === 2 && "Next to Pet’s Medication"}
              </Text>
              <Ionicons name="arrow-forward" size={24} color="black" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={() => {}}>
              <Text style={styles.buttonText}>Almost done</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  steponetext: {
    fontSize: 18,
    fontFamily: "OtomanopeeOne",
    marginBottom: 6,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 4,
    paddingVertical: 4,
  },

  pickerWrapper: {
    paddingVertical: 4,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 4,
  },
  picker: {
    height: 40,
  },

  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },

  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#20B2AA",
    fontWeight: "bold",
  },

  dateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },

  locationButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },

  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 20,
    marginTop: 30,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 130,
    marginTop: 20, // Add extra padding at the bottom for the fixed navigation
  },

  header: {
    backgroundColor: "#00D0C3",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },

  arrowTouchable: {
    padding: 5, // Increase the clickable area
    justifyContent: "center",
    alignItems: "center",
  },

  arrowcontainer: {
    zIndex: 99,
    backgroundColor: "#00D0C3",
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
    borderRadius: 50,
    borderColor: "#000",
    borderWidth: 2,
  },

  headerTitle: {
    fontSize: 18,
    fontFamily: "OtomanopeeOne",
  },

  petneuteredbox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginBottom: 10,
  },

  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
  },

  inputWithIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  dateinput: {
    flex: 1, // Takes up remaining space, pushing the icon to the right
    paddingVertical: 8,
  },

  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
  },

  icon: {
    padding: 10,
  },

  petTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  petTypeButton: {
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    marginTop: 20,
  },

  selectedPetType: {
    backgroundColor: "#FDCF00CC",
  },

  petbackground: {
    position: "absolute",
    top: -20,
    left: -16,
    width: 90,
    height: 90,
    borderRadius: 100,
    backgroundColor: "#FDCF0033",
  },

  petTypeText: {
    fontWeight: "bold",
  },
  ageContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ageInput: {
    width: "48%",
  },

  genderContainerbox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },

  genderContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  genderButton: {
    backgroundColor: "#FDCF0066",
    alignItems: "center",
    justifyContent: "center",
    width: 75,
    height: 75,
    borderRadius: 100,
    padding: 10,
    borderColor: "#000",
    borderWidth: 2,
  },
  selectedGender: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FDCF00",
    width: 75,
    height: 75,
    borderRadius: 100,
    padding: 10,
    borderColor: "#000",
    borderWidth: 2,
  },
  genderText: {
    marginTop: 5,
  },
  yellowBox: {
    backgroundColor: "#FFFACD",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: "#000",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checked: {
    backgroundColor: "#FFD700",
  },
  pottyTrainingContainer: {
    marginBottom: 20,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  pottyTrainingOption: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFD700",
  },
  selectedPottyTraining: {
    backgroundColor: "#FFD700",
    borderRadius: 5,
    padding: 5,
  },
  pottyTrainingText: {
    marginLeft: 10,
  },
  nextButton: {
    backgroundColor: "#FFD700",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },

  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },

  inputContainer: {
    marginBottom: 15,
  },

  radioContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  radioButtonSelected: {
    backgroundColor: "#e6e6e6",
  },
  radioButtonText: {
    fontSize: 16,
  },

  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  checkboxChecked: {
    backgroundColor: "#FDCF00",
  },

  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },

  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  progressDotCurrent: {
    backgroundColor: "#000",
  },
  progressDotCompleted: {
    backgroundColor: "#666",
  },
  progressDotFuture: {
    backgroundColor: "#666",
  },

  progressLine: {
    width: 10,
    height: 2,
  },
  progressLineCompleted: {
    backgroundColor: "#666",
  },
  progressLineFuture: {
    backgroundColor: "#000",
  },

  bottomNavigation: {
    backgroundColor: "#fff",
  },

  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00D0C3",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    gap: 5,
  },

  buttonText: {
    color: "#000",
    fontSize: 16,
    fontFamily: "OtomanopeeOne",
  },

  horizontalLine: {
    borderBottomColor: "rgba(253, 207, 0, 0.6)",
    borderBottomWidth: 2,
    marginVertical: 16,
  },

  sectionTitle: {
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
    fontFamily: "OtomanopeeOne",
  },

  sectionDesc: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    marginBottom: 10,
  },

  dietEntrytitlebox: {
    flexDirection: "row",
    gap: 110,
    marginBottom: 10,
  },

  dietEntrytitleboxtext: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
  },

  dietEntry: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  timePickerContainer: {
    width: "40%",
    flexDirection: "row",
    alignItems: "center",
  },

  dietEntryinput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 4,
    backgroundColor: "#fff",
  },

  addButton: {
    width: "40%",
    backgroundColor: "rgba(253, 207, 0, 0.6)",
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
  },
  addButtonText: {
    color: "#000",
    fontWeight: "bold",
    textAlign: "center",
  },

  foodallergybox: {
    gap: 10,
  },

  foodallergyboxtext: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
  },

  subtitle: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    marginTop: 12,
    marginBottom: 8,
  },

  radiobuttonbbox: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    marginTop: 10,
  },

  checkboxContainerscreentwo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  checkboxscreentwo: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: "black",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkedscreentwo: {
    backgroundColor: "yellow",
  },
  checkmark: {
    color: "black",
  },
  radioContainerscreentwo: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "black",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  radioChecked: {
    borderColor: "#000",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FDCF00",
  },
  labelscreentwo: {
    fontSize: 16,
  },

  checkboxlabelscreentwo: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
  },

  bathingFrequency: {
    backgroundColor: "#FFFFE0",
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },

  bathingFrequencyboxinnner: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  allergyinput: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingVertical: 8,
  },

  timeicon: {
    position: "absolute",
    right: 10,
  },

  stepthreesection: {
    // padding: 5,
  },

  stepthreelabel: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
  },

  stepthreecheckboxChecked: {
    backgroundColor: "#FDCF00",
  },

  stepthreedateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },

  stepthreetextInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },

  stepthreecheckboxContainer: {
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  stepthreecheckboxGroup: {
    flexWrap: "wrap",
    marginBottom: 16,
    paddingLeft: 10,
  },

  stepthreecheckboxItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "70%",
    marginBottom: 8,
  },

  stepthreelabeltext: {
    color: "rgba(0, 0, 0, 0.6)",
  },

  stepthreelabelwidth: {
    width: "80%",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
  },

  stepfourgalleryText: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
  },

  stepfourimageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  stepfourimagePicker: {
    width: 150,
    height: 150,
    borderWidth: 2,
    borderColor: "#FFD700",
    borderRadius: 10,
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  stepfourimage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  stepfourplusIcon: {
    fontSize: 40,
    color: "#FFD700",
  },

  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },

  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
});
