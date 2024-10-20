import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  SafeAreaView,
  DimensionValue,
  FlatList,
  Image,
  Alert,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import MapView, { Marker } from "react-native-maps";
import Icon from "react-native-vector-icons/Ionicons";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { CheckBox, Input, Button } from "@rneui/themed";
import * as ImagePicker from "expo-image-picker";
import { Toast } from "react-native-toast-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URI } from "@/utils/uri";

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

  // Add new state for button disabled status
  const [isNextButtonDisabled, setIsNextButtonDisabled] = useState(true);

  const dogBreeds = [
    "Beagle",
    "Labrador",
    "German Shepherd",
    "Golden Retriever",
    "Poodle",
  ];

  type Pet = {
    name: string;
    breed: string;
    age: string;
    gender: "Male" | "Female" | "";
    isSterlized: boolean;
    temperament: {
      dogs: boolean;
      human: boolean;
      cats: boolean;
    };
    uncomfortableWith: string;
  };

  const initialPet: Pet = {
    name: "",
    breed: "",
    age: "",
    gender: "",
    isSterlized: false,
    temperament: {
      dogs: false,
      human: false,
      cats: false,
    },
    uncomfortableWith: "",
  };

  interface Profile {
    fullName: string;
    phoneNumber: string;
    email: string;
    age: string;
    gender: string;
    dateOfBirth: Date;
    profession: string;
    location: string;
    line1: string;
    line2: string;
    city: string;
    pincode: string;
    residenceType: string;
    builtUpArea: string;
    petSize: string;
    petGender: string;
    petCount: string;
    willingToWalk: string;
    hasAreaRestrictions: string;
    areaRestrictions: string;
    walkFrequency: string;
    walkDuration: string;
    willingToCook: string;
    cookingOptions: string[];
    groomPet: boolean;
    hasPet: string;
    pets: Pet[];
    hasVetNearby: string;
    vetInfo: {
      name: string;
      clinic: string;
      phone: string;
      address: string;
    };

    HostProfile: {
      profileImage: string;
      bio: string;
      idProof: string;
      facilityPictures: string[];
      petPictures: string[];
      pricingDaycare: string;
      pricingBoarding: string;
      pricingVegMeal: string;
      pricingNonVegMeal: string;
    };
    paymentDetails: {
      accountHolderName: string;
      accountNumber: string;
      ifscCode: string;
      bankName: string;
      upiid: string;
    };
  }

  const pickImage = async (
    field: keyof typeof profile.HostProfile,
    index?: number
  ) => {
    // Request permission to access the media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow access to your photo library to select images."
      );
      return;
    }

    // Launch the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    // Handle cancellation or errors
    if (result.canceled) {
      console.log("Image picker was canceled");
      return; // Exit if the user cancels the image picker
    }

    try {
      // Convert the selected image to base64
      const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Determine the image's MIME type
      const mimeType = result.assets[0].uri.endsWith(".png")
        ? "image/png"
        : "image/jpeg";

      const base64Image = `data:${mimeType};base64,${base64}`;

      // Update the state with the base64 image
      setProfile((prev) => {
        if (typeof index === "number") {
          // Handle array fields like facilityPictures and petPictures
          return {
            ...prev,
            HostProfile: {
              ...prev.HostProfile,
              [field]: (prev.HostProfile[field] as string[]).map((img, i) =>
                i === index ? base64Image : img
              ),
            },
          };
        } else {
          // Handle single image fields like profileImage or idProof
          return {
            ...prev,
            HostProfile: {
              ...prev.HostProfile,
              [field]: base64Image,
            },
          };
        }
      });
    } catch (error) {
      console.error("Error reading image file:", error);
      Alert.alert("Error", "There was an error processing the image.");
    }
  };

  type ProfileValue = string | Date | string[] | boolean;

  const [profile, setProfile] = useState<Profile>({
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
    petSize: "",
    petGender: "",
    petCount: "",
    willingToWalk: "",
    hasAreaRestrictions: "",
    areaRestrictions: "",
    walkFrequency: "",
    walkDuration: "",
    willingToCook: "",
    cookingOptions: [],
    groomPet: false,
    hasPet: "",
    pets: [{ ...initialPet }],
    hasVetNearby: "",
    vetInfo: {
      name: "",
      clinic: "",
      phone: "",
      address: "",
    },

    HostProfile: {
      profileImage: "",
      bio: "",
      idProof: "",
      facilityPictures: ["", "", "", ""],
      petPictures: ["", ""],
      pricingDaycare: "",
      pricingBoarding: "",
      pricingVegMeal: "",
      pricingNonVegMeal: "",
    },
    paymentDetails: {
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      upiid: "",
    },
  });

  // Validation functions
  const validateStep1 = (): boolean => {
    return !!(
      profile.fullName &&
      profile.phoneNumber &&
      profile.email &&
      profile.age &&
      profile.gender &&
      profile.dateOfBirth &&
      profile.profession &&
      // profile.location &&
      profile.line1 &&
      profile.city &&
      profile.pincode &&
      profile.residenceType &&
      profile.builtUpArea
    );
  };

  const validateStep2 = (): boolean => {
    return !!(
      profile.petSize &&
      profile.petGender &&
      profile.petCount &&
      profile.willingToWalk &&
      (profile.willingToWalk === "No" ||
        (profile.walkFrequency && profile.walkDuration)) &&
      profile.hasAreaRestrictions &&
      (profile.hasAreaRestrictions === "No" || profile.areaRestrictions) &&
      profile.willingToCook &&
      (profile.willingToCook === "No" || profile.cookingOptions.length > 0)
    );
  };

  const validateStep3 = (): boolean => {
    if (profile.hasPet === "Yes") {
      return !!(
        profile.pets.every(
          (pet) =>
            pet.name &&
            pet.breed &&
            pet.age &&
            pet.gender &&
            Object.values(pet.temperament).some((value) => value)
        ) &&
        profile.hasVetNearby &&
        (profile.hasVetNearby === "No" ||
          (profile.vetInfo.name &&
            profile.vetInfo.clinic &&
            profile.vetInfo.phone &&
            profile.vetInfo.address))
      );
    }
    return !!(profile.hasPet === "No" && profile.hasVetNearby);
  };

  const validateStep4 = (): boolean => {
    const hasFacilityPicture = profile.HostProfile.facilityPictures.some(
      (pic) => pic !== ""
    );
    const hasPetPicture = profile.HostProfile.petPictures.some(
      (pic) => pic !== ""
    );

    return !!(
      profile.HostProfile.profileImage &&
      profile.HostProfile.bio &&
      profile.HostProfile.idProof &&
      hasFacilityPicture &&
      (profile.hasPet === "No" || hasPetPicture) &&
      profile.HostProfile.pricingDaycare &&
      profile.HostProfile.pricingBoarding &&
      profile.HostProfile.pricingVegMeal &&
      profile.HostProfile.pricingNonVegMeal
    );
  };

  const validateStep5 = (): boolean => {
    return !!(
      profile.paymentDetails.accountHolderName &&
      profile.paymentDetails.bankName &&
      profile.paymentDetails.accountNumber &&
      profile.paymentDetails.ifscCode &&
      profile.paymentDetails.upiid
    );
  };

  // Effect to check validation on each step change or profile update
  useEffect(() => {
    let isValid = false;
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
      case 5:
        isValid = validateStep5();
        break;
      default:
        isValid = false;
    }
    setIsNextButtonDisabled(!isValid);
  }, [currentStep, profile]);

  const updatePaymentDetails = (
    field: keyof Profile["paymentDetails"],
    value: string
  ) => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      paymentDetails: {
        ...prevProfile.paymentDetails,
        [field]: value,
      },
    }));
  };

  const [isPetFormOpen, setIsPetFormOpen] = useState(true);

  const handleSubmitPetForm = () => {
    setIsPetFormOpen(false);
  };

  const [activeTab, setActiveTab] = useState(0); // Track active tab

  const CircularCheckbox = ({
    title,
    checked,
    onPress,
    width = "48%",
  }: {
    title: string;
    checked: boolean;
    onPress: () => void;
    width?: string;
  }) => (
    <View style={{ width: width as DimensionValue }}>
      <TouchableOpacity style={[styles.checkboxContainer]} onPress={onPress}>
        <View style={[styles.checkbox, checked && styles.checkedCheckbox]}>
          {checked && <View style={styles.innerCircle} />}
        </View>
        <Text style={styles.checkboxLabel}>{title}</Text>
      </TouchableOpacity>
    </View>
  );

  const SelectBox = ({
    options,
    selectedValue,
    onSelect,
    placeholder,
  }: {
    options: string[];
    selectedValue: string;
    onSelect: (value: string) => void;
    placeholder: string;
  }) => {
    const [modalVisible, setModalVisible] = useState(false);

    return (
      <View>
        <TouchableOpacity
          style={styles.selectBox}
          onPress={() => setModalVisible(true)}
        >
          <Text
            style={
              selectedValue ? styles.selectBoxText : styles.placeholderText
            }
          >
            {selectedValue || placeholder}
          </Text>
          <Ionicons name="chevron-down-outline" size={24} color="#000" />
        </TouchableOpacity>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <FlatList
                data={options}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.optionItem}
                    onPress={() => {
                      onSelect(item);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.optionText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  interface CheckboxProps {
    label: string;
    checked: boolean;
    onCheck: () => void;
  }

  const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onCheck }) => (
    <TouchableOpacity
      style={styles.checkboxContainerscreentwo}
      onPress={onCheck}
    >
      <Text style={styles.checkboxlabelscreentwo}>{label}</Text>
      <View
        style={[styles.checkboxscreentwo, checked && styles.checkedscreentwo]}
      >
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </TouchableOpacity>
  );

  // const handleInputChange = (name: keyof Profile, value: ProfileValue) => {
  //   setProfile((prevProfile) => ({ ...prevProfile, [name]: value }));
  // };

  const handleInputChange = (
    name: keyof typeof profile,
    value: string | Date | string[] | boolean
  ) => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const toggleOption = (option: string, field: keyof Profile) => {
    const updatedOptions = (profile[field] as string[]).includes(option)
      ? (profile[field] as string[]).filter((item) => item !== option)
      : [...(profile[field] as string[]), option];
    handleInputChange(field, updatedOptions);
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

  const totalSteps = 5;

  const nextStep = () => {
    if (currentStep < totalSteps && !isNextButtonDisabled) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prevStep) => prevStep - 1); // Use functional state update for reliable results
    }
  };

  const addPet = () => {
    setProfile((prev) => ({
      ...prev,
      pets: [...prev.pets, { ...initialPet }],
    }));
  };

  const updatePet = (index: number, field: keyof Pet, value: any) => {
    setProfile((prev) => ({
      ...prev,
      pets: prev.pets.map((pet, i) =>
        i === index ? { ...pet, [field]: value } : pet
      ),
    }));
  };

  const updateTemperament = (
    index: number,
    field: keyof Pet["temperament"],
    value: boolean
  ) => {
    setProfile((prev) => ({
      ...prev,
      pets: prev.pets.map((pet, i) =>
        i === index
          ? { ...pet, temperament: { ...pet.temperament, [field]: value } }
          : pet
      ),
    }));
  };

  const handleHostProfile = async () => {
    console.log("Host Profile State:", profile); // Log profile state

    const accessToken = await AsyncStorage.getItem("access_token");
    const refreshToken = await AsyncStorage.getItem("refresh_token");

    try {
      // Send the profile data directly as JSON
      const response = await axios.post(
        `${SERVER_URI}/hostprofile-create`,
        profile, // Send profile object directly
        {
          headers: {
            "Content-Type": "application/json", // Indicate JSON content
            access_token: accessToken,
          },
        }
      );

      if (response.data) {
        Toast.show(response.data.message, {
          type: "success",
        });
        console.log(response.data.hostProfile);
      }
    } catch (error: any) {
      // Log error details
      if (error.response) {
        console.log("Error Response Data:", error.response.data); // Logs the response from the server
        console.log("Error Response Status:", error.response.status); // Logs the status code
      } else {
        console.log("Error Message:", error.message); // Logs general error messages
      }
    } finally {
      // setLoader(false); // Handle loader state if applicable
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
            <View style={styles.casetwosection}>
              <Text style={styles.casetwosectionTitle}>Your Preference</Text>

              <Text style={styles.label}>
                What size of pet do you wish to host?*
              </Text>
              <View style={styles.casetwooptionsContainer}>
                {[
                  "Small (<8 Kgs)",
                  "Medium (8-20 Kgs)",
                  "Large (20-40 Kgs)",
                  "Giant (>40 Kgs)",
                ].map((size) => (
                  <CircularCheckbox
                    key={size}
                    title={size}
                    checked={profile.petSize === size}
                    onPress={() => handleInputChange("petSize", size)}
                    width="50%"
                  />
                ))}
              </View>

              <Text style={styles.label}>
                What gender of pet do you wish to host?*
              </Text>
              <View style={styles.casetwooptionsContainer}>
                {["Male", "Female", "Both"].map((gender) => (
                  <CircularCheckbox
                    key={gender}
                    title={gender}
                    checked={profile.petGender === gender}
                    onPress={() => handleInputChange("petGender", gender)}
                    width="33%"
                  />
                ))}
              </View>

              <Text style={styles.label}>
                How many pets can you board at a time?*
              </Text>
              <View style={styles.casetwooptionsContainer}>
                {["1", "2", "3", "4", "5", ">5"].map((count) => (
                  <CircularCheckbox
                    key={count}
                    title={count}
                    checked={profile.petCount === count}
                    onPress={() => handleInputChange("petCount", count)}
                    width="33%"
                  />
                ))}
              </View>

              <Text style={styles.label}>Willing to take pet on walks?*</Text>
              <View style={styles.casetwooptionsContainer}>
                <CircularCheckbox
                  title="Yes"
                  checked={profile.willingToWalk === "Yes"}
                  onPress={() => handleInputChange("willingToWalk", "Yes")}
                  width="48%"
                />
                <CircularCheckbox
                  title="No"
                  checked={profile.willingToWalk === "No"}
                  onPress={() => handleInputChange("willingToWalk", "No")}
                  width="48%"
                />
              </View>

              {profile.willingToWalk === "Yes" && (
                <View style={styles.coloredBox}>
                  <Text style={styles.label}>How many times in a day?</Text>
                  <SelectBox
                    options={[
                      "1 time",
                      "2 times",
                      "3 times",
                      "4 times",
                      "5+ times",
                    ]}
                    selectedValue={profile.walkFrequency}
                    onSelect={(value) =>
                      handleInputChange("walkFrequency", value)
                    }
                    placeholder="Select frequency"
                  />
                  <Text style={styles.label}>For how long?</Text>
                  <SelectBox
                    options={[
                      "15 minutes",
                      "30 minutes",
                      "45 minutes",
                      "1 hour",
                      "1+ hours",
                    ]}
                    selectedValue={profile.walkDuration}
                    onSelect={(value) =>
                      handleInputChange("walkDuration", value)
                    }
                    placeholder="Select duration"
                  />
                </View>
              )}

              <Text style={styles.label}>
                Any area restrictions for pets at home?*
              </Text>
              <View style={styles.casetwooptionsContainer}>
                <CircularCheckbox
                  title="Yes"
                  checked={profile.hasAreaRestrictions === "Yes"}
                  onPress={() =>
                    handleInputChange("hasAreaRestrictions", "Yes")
                  }
                  width="48%"
                />
                <CircularCheckbox
                  title="No"
                  checked={profile.hasAreaRestrictions === "No"}
                  onPress={() => handleInputChange("hasAreaRestrictions", "No")}
                  width="48%"
                />
              </View>

              {profile.hasAreaRestrictions === "Yes" && (
                <View style={styles.casetwocoloredBox}>
                  <Text style={styles.label}>Please mention in brief</Text>
                  <TextInput
                    style={styles.textInput}
                    multiline={true}
                    numberOfLines={4} // Adjust the number of lines as needed
                    placeholder="Type here"
                    value={profile.areaRestrictions}
                    onChangeText={(text) =>
                      handleInputChange("areaRestrictions", text)
                    }
                  />
                </View>
              )}

              <Text style={styles.label}>Willing to cook food?*</Text>
              <View style={styles.casetwooptionsContainer}>
                <CircularCheckbox
                  title="Yes"
                  checked={profile.willingToCook === "Yes"}
                  onPress={() => handleInputChange("willingToCook", "Yes")}
                  width="48%"
                />
                <CircularCheckbox
                  title="No"
                  checked={profile.willingToCook === "No"}
                  onPress={() => handleInputChange("willingToCook", "No")}
                  width="48%"
                />
              </View>

              {profile.willingToCook === "Yes" && (
                <View style={styles.casetwocoloredBox}>
                  <Text style={styles.label}>Select cooking options:</Text>
                  <View style={styles.checkboxRow}>
                    {["Vegetarian", "Non-vegetarian", "Eggs", "Others"].map(
                      (option, index) => (
                        <CircularCheckbox
                          key={option}
                          title={option}
                          checked={profile.cookingOptions.includes(option)}
                          onPress={() => toggleOption(option, "cookingOptions")}
                          width="48%" // Use 48% to fit two in a row with space
                        />
                      )
                    )}
                  </View>
                </View>
              )}

              <Checkbox
                label="Will you be able to groom the pet?"
                checked={profile.groomPet}
                onCheck={() => handleInputChange("groomPet", !profile.groomPet)}
              />
            </View>
          </View>
        );
      case 3:
        return (
          <View>
            <View style={styles.casethreesection}>
              <Text style={styles.casethreesectionTitle}>About your pet</Text>
              <Text>Do you have a pet at home?</Text>
              <View style={styles.casethreerow}>
                <CircularCheckbox
                  title="Yes"
                  checked={profile.hasPet === "Yes"}
                  onPress={() => {
                    setProfile((prev) => ({ ...prev, hasPet: "Yes" }));
                    setIsPetFormOpen(true); // Reopen the form if the user says "Yes"
                  }}
                  width="48%"
                />
                <CircularCheckbox
                  title="No"
                  checked={profile.hasPet === "No"}
                  onPress={() =>
                    setProfile((prev) => ({
                      ...prev,
                      hasPet: "No",
                      pets: [{ ...initialPet }],
                    }))
                  }
                  width="48%"
                />
              </View>
            </View>

            {profile.hasPet === "Yes" && isPetFormOpen && (
              <View style={styles.petFormContainer3}>
                {/* Tab Navigation */}
                <View style={styles.tabContainer3}>
                  {profile.pets.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.tabButton,
                        activeTab === index && styles.activeTabButton, // Highlight active tab
                      ]}
                      onPress={() => setActiveTab(index)} // Switch tab
                    >
                      <Text style={styles.tabButtonText}>Pet #{index + 1}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={styles.addPetButton}
                    onPress={addPet}
                  >
                    <Text style={styles.addPetButtonText}>
                      + Add another pet
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Render the form for the active tab */}
                <View key={activeTab} style={styles.petForm}>
                  <View style={styles.inputContainer3}>
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                      style={styles.input3}
                      value={profile.pets[activeTab].name}
                      onChangeText={(text) =>
                        updatePet(activeTab, "name", text)
                      }
                      placeholder="Enter pet name"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Breed</Text>
                    <View style={styles.pickerContainer3}>
                      <Picker
                        selectedValue={profile.pets[activeTab].breed}
                        onValueChange={(value) =>
                          updatePet(activeTab, "breed", value)
                        }
                        style={styles.picker3}
                      >
                        <Picker.Item label="Select breed" value="" />
                        {dogBreeds.map((breed) => (
                          <Picker.Item
                            key={breed}
                            label={breed}
                            value={breed}
                          />
                        ))}
                      </Picker>
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Age</Text>
                    <TextInput
                      style={styles.input3}
                      value={profile.pets[activeTab].age}
                      onChangeText={(text) => updatePet(activeTab, "age", text)}
                      placeholder="Enter pet age"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.genderContainer}>
                      <CircularCheckbox
                        title="Male"
                        checked={profile.pets[activeTab].gender === "Male"}
                        onPress={() =>
                          updatePet(
                            activeTab,
                            "gender",
                            profile.pets[activeTab].gender === "Male"
                              ? ""
                              : "Male"
                          )
                        }
                        width="48%"
                      />

                      <CircularCheckbox
                        title="Female"
                        checked={profile.pets[activeTab].gender === "Female"}
                        onPress={() =>
                          updatePet(
                            activeTab,
                            "gender",
                            profile.pets[activeTab].gender === "Female"
                              ? ""
                              : "Female"
                          )
                        }
                        width="48%"
                      />
                    </View>
                  </View>

                  <Checkbox
                    label="Is your pet sterilized?"
                    checked={profile.pets[activeTab].isSterlized}
                    onCheck={() =>
                      updatePet(
                        activeTab,
                        "isSterlized",
                        !profile.pets[activeTab].isSterlized
                      )
                    }
                  />

                  <Text style={styles.label}>Temperament towards</Text>
                  <View style={styles.temperamentContainer3}>
                    <CircularCheckbox
                      title="Dogs"
                      checked={profile.pets[activeTab].temperament.dogs}
                      onPress={() =>
                        updateTemperament(
                          activeTab,
                          "dogs",
                          !profile.pets[activeTab].temperament.dogs
                        )
                      }
                      width="33%"
                    />

                    <CircularCheckbox
                      title="Human"
                      checked={profile.pets[activeTab].temperament.human}
                      onPress={() =>
                        updateTemperament(
                          activeTab,
                          "human",
                          !profile.pets[activeTab].temperament.human
                        )
                      }
                      width="33%"
                    />

                    <CircularCheckbox
                      title="Cats"
                      checked={profile.pets[activeTab].temperament.cats}
                      onPress={() =>
                        updateTemperament(
                          activeTab,
                          "cats",
                          !profile.pets[activeTab].temperament.cats
                        )
                      }
                      width="33%"
                    />
                  </View>

                  <View style={styles.inputContainer3}>
                    <Text style={styles.label}>
                      Is there anything your pet uncomfortable with?
                    </Text>
                    <TextInput
                      style={[styles.input3, styles.multilineInput3]}
                      value={profile.pets[activeTab].uncomfortableWith}
                      onChangeText={(text) =>
                        updatePet(activeTab, "uncomfortableWith", text)
                      }
                      placeholder="Type here"
                      multiline
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.submitButton3}
                  onPress={handleSubmitPetForm} // Define your submit logic here
                >
                  <Text style={styles.submitButtonText3}>Submit</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.casethreesection}>
              <Text>Do you have any veterinary clinic nearby?</Text>
              <View style={styles.casethreerow}>
                <CircularCheckbox
                  title="Yes"
                  checked={profile.hasVetNearby === "Yes"}
                  onPress={() =>
                    setProfile((prev) => ({ ...prev, hasVetNearby: "Yes" }))
                  }
                  width="48%"
                />
                <CircularCheckbox
                  title="No"
                  checked={profile.hasVetNearby === "No"}
                  onPress={() =>
                    setProfile((prev) => ({
                      ...prev,
                      hasVetNearby: "No",
                      vetInfo: { name: "", clinic: "", phone: "", address: "" },
                    }))
                  }
                  width="48%"
                />
              </View>
            </View>

            {profile.hasVetNearby === "Yes" && (
              <View style={styles.casethreevetForm}>
                <Text style={styles.label}>Name of the vet</Text>
                <TextInput
                  style={styles.input3}
                  placeholder="Name of the vet"
                  value={profile.vetInfo.name}
                  onChangeText={(value) =>
                    setProfile((prev) => ({
                      ...prev,
                      vetInfo: { ...prev.vetInfo, name: value },
                    }))
                  }
                />
                <Text style={styles.label}>Name of the clinic</Text>
                <TextInput
                  style={styles.input3}
                  placeholder="Name of the clinic"
                  value={profile.vetInfo.clinic}
                  onChangeText={(value) =>
                    setProfile((prev) => ({
                      ...prev,
                      vetInfo: { ...prev.vetInfo, clinic: value },
                    }))
                  }
                />
                <Text style={styles.label}>Phone number (Doctor/Clinic)</Text>
                <TextInput
                  style={styles.input3}
                  placeholder="Phone number (Doctor/Clinic)"
                  value={profile.vetInfo.phone}
                  onChangeText={(value) =>
                    setProfile((prev) => ({
                      ...prev,
                      vetInfo: { ...prev.vetInfo, phone: value },
                    }))
                  }
                  keyboardType="phone-pad"
                />
                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={styles.input3}
                  placeholder="Address"
                  value={profile.vetInfo.address}
                  onChangeText={(value) =>
                    setProfile((prev) => ({
                      ...prev,
                      vetInfo: { ...prev.vetInfo, address: value },
                    }))
                  }
                  multiline
                />
              </View>
            )}
          </View>
        );
      case 4:
        return (
          <View>
            <Text style={styles.sectionTitle}>Upload your Profile</Text>
            <TouchableOpacity
              style={styles.profileImageContainer}
              onPress={() => pickImage("profileImage")}
            >
              {profile.HostProfile.profileImage ? (
                <Image
                  source={{ uri: profile.HostProfile.profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Ionicons name="person-outline" size={40} color="#00CED1" />
                </View>
              )}
              <View style={styles.uploadIconContainer}>
                <Ionicons name="cloud-upload-outline" size={20} color="white" />
              </View>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Bio</Text>
            <TextInput
              style={styles.bioInput}
              placeholder="Write about yourself and your Pup!"
              multiline
              value={profile.HostProfile.bio}
              onChangeText={(text) =>
                setProfile((prev) => ({
                  ...prev,
                  HostProfile: { ...prev.HostProfile, bio: text },
                }))
              }
            />

            <Text style={styles.sectionTitle}>KYC VERIFICATION</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => pickImage("idProof")}
            >
              <Text style={styles.uploadButtonText}>
                Upload your ID Proof (Aadhar)
              </Text>
              <View style={styles.cloudbox}>
                <Ionicons name="cloud-upload-outline" size={24} color="#000" />
              </View>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Facility Picture</Text>
            <View style={styles.imageGridone}>
              {[...Array(4)].map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.imageUploadBox}
                  onPress={() => pickImage("facilityPictures", index)}
                >
                  {profile.HostProfile.facilityPictures[index] ? (
                    <Image
                      source={{
                        uri: profile.HostProfile.facilityPictures[index],
                      }}
                      style={styles.uploadedImage}
                    />
                  ) : (
                    <Ionicons name="add" size={40} color="#00CED1" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {profile.hasPet === "Yes" && (
              <>
                <Text style={styles.sectionTitle}>Your pet's picture</Text>
                <View style={styles.imageGridtwo}>
                  {profile.HostProfile.petPictures.map((img, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.imageUploadBox}
                      onPress={() => pickImage("petPictures", index)}
                    >
                      {img ? (
                        <Image
                          source={{ uri: img }}
                          style={styles.uploadedImage}
                        />
                      ) : (
                        <Text style={styles.plusIcon}>+</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <Text style={styles.sectionTitle}>Pricing</Text>
            <Text style={styles.pricingLabel}>Pricing for Daycare (8 hrs)</Text>
            <TextInput
              style={styles.pricingInput}
              placeholder="Enter your pricing here"
              keyboardType="numeric"
              value={profile.HostProfile.pricingDaycare}
              onChangeText={(text) =>
                setProfile((prev) => ({
                  ...prev,
                  HostProfile: { ...prev.HostProfile, pricingDaycare: text },
                }))
              }
            />
            <Text style={styles.pricingRange}>
              (Your price range varies form Rs. 400 - Rs.800 /day (Pricing based
              on the city))
            </Text>

            <Text style={styles.pricingLabel}>
              Pricing for Boarding (Overnight)
            </Text>
            <TextInput
              style={styles.pricingInput}
              placeholder="Enter your pricing here"
              keyboardType="numeric"
              value={profile.HostProfile.pricingBoarding}
              onChangeText={(text) =>
                setProfile((prev) => ({
                  ...prev,
                  HostProfile: {
                    ...prev.HostProfile, // Spread the previous HostProfile object
                    pricingBoarding: text, // Update the specific field
                  },
                }))
              }
            />
            <Text style={styles.pricingRange}>
              (Your price range varies form Rs. 600 - Rs.1200 /day (Pricing
              based on the city))
            </Text>

            <Text style={styles.pricingLabel}>
              Pricing for Home cooked Food
            </Text>
            <TextInput
              style={styles.pricingInput}
              placeholder="Veg Meal (Range: Rs.50 - Rs.120)"
              keyboardType="numeric"
              value={profile.HostProfile.pricingVegMeal}
              onChangeText={(text) =>
                setProfile((prev) => ({
                  ...prev,
                  HostProfile: {
                    ...prev.HostProfile,
                    pricingVegMeal: text,
                  },
                }))
              }
            />

            <TextInput
              style={styles.pricingInput}
              placeholder="Non-Veg Meal (Range: Rs.100 - Rs.200)"
              keyboardType="numeric"
              value={profile.HostProfile.pricingNonVegMeal}
              onChangeText={(text) =>
                setProfile((prev) => ({
                  ...prev,
                  HostProfile: {
                    ...prev.HostProfile,
                    pricingNonVegMeal: text,
                  },
                }))
              }
            />
          </View>
        );
      case 5:
        return (
          <View style={styles.content}>
            <Text style={styles.title}>Payment Details</Text>

            <Text style={styles.label}>Beneficiary Name</Text>
            <TextInput
              style={styles.inputcasefive}
              placeholder="Beneficiary Name"
              value={profile.paymentDetails.accountHolderName}
              onChangeText={(text) =>
                updatePaymentDetails("accountHolderName", text)
              }
            />

            <Text style={styles.label}>Bank Name</Text>
            <TextInput
              style={styles.inputcasefive}
              placeholder="Bank Name"
              keyboardType="numeric"
              value={profile.paymentDetails.bankName}
              onChangeText={(text) => updatePaymentDetails("bankName", text)}
            />

            <Text style={styles.label}>Account Number</Text>
            <TextInput
              style={styles.inputcasefive}
              placeholder="Account Number"
              autoCapitalize="characters"
              value={profile.paymentDetails.accountNumber}
              onChangeText={(text) =>
                updatePaymentDetails("accountNumber", text)
              }
            />

            <Text style={styles.label}>IFSC Code</Text>
            <TextInput
              style={styles.inputcasefive}
              placeholder="IFSC Code"
              value={profile.paymentDetails.ifscCode}
              onChangeText={(text) => updatePaymentDetails("ifscCode", text)}
            />

            <Text style={styles.label}>UPI Id</Text>
            <TextInput
              style={styles.inputcasefive}
              placeholder="UPI Id"
              value={profile.paymentDetails.upiid}
              onChangeText={(text) => updatePaymentDetails("upiid", text)}
            />
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
            <TouchableOpacity
              style={[
                styles.button,
                isNextButtonDisabled && styles.disabledButton,
              ]}
              onPress={nextStep}
              disabled={isNextButtonDisabled}
            >
              <Text style={styles.buttonText}>
                {currentStep === 1 && "Next to Preferences"}
                {currentStep === 2 && "Next to Pet's"}
                {currentStep === 3 && "Next to your profile"}
                {currentStep === 4 && "Almost Done !"}
              </Text>
              <Ionicons name="arrow-forward" size={24} color="black" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.button,
                isNextButtonDisabled && styles.disabledButton,
              ]}
              onPress={() => handleHostProfile()}
              disabled={isNextButtonDisabled}
            >
              <Text style={styles.buttonText}>All done</Text>
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

  textInput: {
    height: 50, // Adjust the height to your needs
    borderColor: "#000",
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
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
    marginBottom: 10,
  },
  checkbox: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
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

  disabledButton: {
    opacity: 0.5,
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
    marginTop: 10,
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
    backgroundColor: "#00D0C3",
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

  casetwosection: {
    padding: 16,
  },

  casetwosectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  casetwooptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  casetwocoloredBox: {
    backgroundColor: "#00D0C366",
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },

  checkboxRow: {
    flexDirection: "row",
    justifyContent: "space-between", // Distributes space evenly
    flexWrap: "wrap", // Allows items to wrap to the next line if necessary
  },

  checkedCheckbox: {
    backgroundColor: "#00CED1",
  },
  innerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  checkboxLabel: {
    fontSize: 14,
  },

  selectBoxContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  selectOption: {
    borderWidth: 1,
    borderColor: "#00CED1",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: "#00CED1",
  },
  selectOptionText: {
    color: "#00CED1",
  },
  selectedOptionText: {
    color: "white",
  },

  selectBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  selectBoxText: {
    fontSize: 16,
    color: "#000",
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: "50%",
  },
  optionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: {
    fontSize: 16,
  },

  coloredBox: {
    backgroundColor: "#00D0C366",
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },

  casethreesection: {
    marginBottom: 20,
  },

  casethreesectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  casethreerow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },

  casethreebutton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  casethreeselectedButton: {
    backgroundColor: "#00CED1",
  },

  casethreepetForm: {
    marginTop: 20,
  },

  casethreepetSection: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
  },
  casethreepetTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },

  casethreevetForm: {
    padding: 20,
    marginVertical: 20,
    backgroundColor: "#E0F7F9",
  },

  petFormContainer3: {
    padding: 20,
    backgroundColor: "#E0F7F9", // light blue background similar to the UI
    borderRadius: 10,
  },
  tabContainer3: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: "#00B4D8", // Tab border color
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 2,
    borderBottomColor: "transparent", // Default color for inactive tabs
  },
  activeTabButton: {
    borderBottomColor: "#00B4D8", // Active tab border color
  },
  tabButtonText: {
    fontSize: 16,
    color: "#007EA7", // Tab text color
    fontWeight: "bold",
  },
  addPetButton: {
    backgroundColor: "#00B4D8", // Button background color
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  addPetButtonText: {
    color: "#fff", // Button text color
    fontSize: 16,
  },
  petForm: {
    borderRadius: 10,
  },
  inputContainer3: {
    width: "100%",
    marginBottom: 15,
  },
  label3: {
    fontSize: 14,
    color: "#007EA7",
    marginBottom: 5,
  },
  input3: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 15,
  },
  pickerContainer3: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#007EA7",
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 5,
    justifyContent: "center",
  },
  picker3: {
    height: 40,
    width: "100%",
  },
  genderContainer3: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  genderButton3: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#007EA7",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedGender3: {
    backgroundColor: "#00B4D8",
  },
  genderButtonText3: {
    color: "#007EA7",
    fontWeight: "bold",
  },
  temperamentContainer3: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 15,
  },
  multilineInput3: {
    height: 80,
    textAlignVertical: "top",
  },

  submitButton3: {
    backgroundColor: "#00E0D3", // Teal button background color
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },

  submitButtonText3: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },

  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E0FFFF",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E0FFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#00CED1",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  bioInput: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
    padding: 10,
    height: 100,
    textAlignVertical: "top",
  },
  uploadButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 10,
  },
  uploadButtonText: {
    color: "#000",
  },

  cloudbox: {
    width: 45,
    height: 45,
    backgroundColor: "#FDCF0066",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#000",
  },

  imageGridone: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 0, // Reduced gap after Facility Picture
  },

  imageGridtwo: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 0, // Reduced gap after Facility Picture
  },

  imageUploadBox: {
    width: "48%",
    aspectRatio: 1,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#00CED1",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },

  plusIcon: {
    fontSize: 40,
    color: "#00CED1",
  },

  pricingLabel: {
    fontSize: 14,
    marginTop: 10,
  },
  pricingInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    marginBottom: 5,
  },
  pricingRange: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
  },

  content: {
    padding: 8,
  },
  title: {
    fontFamily: "OtomanopeeOne",
    fontSize: 18,
  },

  inputcasefive: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
});
