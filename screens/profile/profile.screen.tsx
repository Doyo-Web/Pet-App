import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Image,
  Platform,
  Alert,
  ActivityIndicator
} from "react-native";
import * as FileSystem from "expo-file-system";
import Icon from "react-native-vector-icons/Ionicons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import Ionicons from "react-native-vector-icons/Ionicons";
import { AntDesign } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URI } from "@/utils/uri";
import axios from "axios";
import { Toast } from "react-native-toast-notifications";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { addPetProfile, setIsLoading, setError } from "@/store/petProfileSlice";
import { RootState } from "@/store/store";

export default function ProfileScreen() {
 
  const [isNextButtonDisabled, setIsNextButtonDisabled] = useState(true);


  const [currentStep, setCurrentStep] = useState(1);

 
   const dispatch = useDispatch();

  // Define the ImageFile interface to represent the structure of pet images
  interface ImageFile {
    uri: string; // You can include other properties as necessary
  }

  // Define the structure for the diet schedule entries
  interface DietScheduleEntry {
    time: string;
    portion: string;
  }

  // Define the structure for medication details
  interface MedicationDetails {
    nameFrequency: string;
    reason: string;
    administration: string;
  }

  // Define the structure for aggressive tendencies
  interface AggressiveTendencies {
    maleDog: boolean;
    femaleDog: boolean;
    human: boolean;
    otherAnimals: boolean;
  }

  // Define the FormState interface
  interface FormState {
    petType: string;
    petName: string;
    petBreed: string;
    petAgeYears: string;
    petAgeMonths: string;
    petGender: string;
    lastHeatCycle: string;
    isNeutered: boolean;
    neuteredDate: string;
    pottyTraining: string;
    toiletBreaks: string;
    walkPerDay: string;
    bathingFrequency: string;
    dailyCombing: boolean;
    dietSchedule: DietScheduleEntry[];
    foodAllergy: string;
    vaccinationDate: Date;
    dewormingDate: Date;
    tickTreatmentDate: Date;
    medicationDetails: MedicationDetails;
    aggressiveTendencies: AggressiveTendencies;
    resourceGuarding: boolean;
    groomingAggression: boolean;
    collarAggression: boolean;
    foodAggression: boolean;
    petImages: ImageFile[]; // Ensure this is an array of ImageFile
  }

  const [formState, setFormState] = useState({
    petType: "",
    petName: "",
    petBreed: "",
    petAgeYears: "",
    petAgeMonths: "",
    petGender: "",
    lastHeatCycle: "",
    isNeutered: false,
    neuteredDate: "",
    pottyTraining: "",
    toiletBreaks: "",
    walkPerDay: "",
    bathingFrequency: "",
    dailyCombing: false,
    dietSchedule: [{ time: "", portion: "" }],
    foodAllergy: "",
    vaccinationDate: new Date(),
    dewormingDate: new Date(),
    tickTreatmentDate: new Date(),
    medicationDetails: {
      nameFrequency: "",
      reason: "",
      administration: "",
    },
    aggressiveTendencies: {
      maleDog: false,
      femaleDog: false,
      human: false,
      otherAnimals: false,
    },
    resourceGuarding: false,
    groomingAggression: false,
    collarAggression: false,
    foodAggression: false,
    petImages: ["", "", "", ""],
  });

  // Validation functions for each step
  const validateStep1 = (): boolean => {
    return !!(
      formState.petType &&
      formState.petName &&
      formState.petBreed &&
      formState.petAgeYears &&
      formState.petAgeMonths &&
      formState.petGender &&
      formState.pottyTraining &&
      (formState.pottyTraining !== "Outdoors" || formState.toiletBreaks)
    );
  };

  const validateStep2 = (): boolean => {
    return !!(
      formState.walkPerDay &&
      formState.bathingFrequency &&
      formState.dietSchedule.length > 0 &&
      formState.dietSchedule.every((entry) => entry.time && entry.portion)
    );
  };

  const validateStep3 = (): boolean => {
    return !!(
      formState.vaccinationDate &&
      formState.dewormingDate &&
      formState.tickTreatmentDate &&
      (!medicalHistory ||
        (formState.medicationDetails.nameFrequency &&
          formState.medicationDetails.reason &&
          formState.medicationDetails.administration))
    );
  };

  const validateStep4 = (): boolean => {
    return formState.petImages.some((image) => image !== "");
  };

  // Effect to check validation on each step change or form state update
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
      default:
        isValid = false;
    }
    setIsNextButtonDisabled(!isValid);
  }, [currentStep, formState]);

  
  const [showHeatCycleDatePicker, setShowHeatCycleDatePicker] = useState(false);
  const [showNeuteredDatePicker, setShowNeuteredDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [dateheat, setDateHeat] = useState(new Date());

  const [showTimePickers, setShowTimePickers] = useState(
    formState.dietSchedule.map(() => false) // Array to track time picker visibility
  );

  const [selectedTime, setSelectedTime] = useState(new Date());

  // Define your ImageFile interface
  interface ImageFile {
    uri: string;
    type: string;
    name: string;
  }

  const isImageFile = (obj: any): obj is ImageFile => {
    return obj && typeof obj.uri === "string" && typeof obj.name === "string";
  };

  // Define the structure for the diet schedule
  interface DietScheduleEntry {
    time: string;
    portion: string;
  }

  const handleDietChange = (index: number, field: string, value: string) => {
    const updatedDietEntries = formState.dietSchedule.map((entry, i) => {
      if (i === index) {
        return { ...entry, [field]: value };
      }
      return entry;
    });
    setFormState((prevState) => ({
      ...prevState,
      dietSchedule: updatedDietEntries,
    }));
  };

  const handleTimeChange = (
    index: number,
    event: any,
    selectedDate: Date | undefined
  ) => {
    const currentDate = selectedDate || selectedTime;
    setShowTimePickers((prevState) =>
      prevState.map((show, i) => (i === index ? false : show))
    ); // Hide the time picker for the current entry

    const timeString = currentDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    handleDietChange(index, "time", timeString); // Update the specific entry
  };

  // Function to format the date as dd/MM/yyyy
  const formatDate = (date: Date) => {
    if (!date || !(date instanceof Date)) {
      return "Select Date"; // Show default text if date is not selected
    }
    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2); // Months are zero-indexed
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (key: string, selectedDate: Date | undefined) => {
    if (selectedDate) {
      setFormState((prevState) => ({
        ...prevState,
        [key]: selectedDate, // Use the key to dynamically set the value
      }));
    }
    // Close the picker based on the key
    if (key === "vaccinationDate") {
      setShowVaccinationPicker(false);
    } else if (key === "dewormingDate") {
      setShowDewormingPicker(false);
    }
  };

  const onChangeHeatCycleDate = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    const currentDate = selectedDate || dateheat;
    setShowHeatCycleDatePicker(Platform.OS === "ios"); // Hide the picker after selection for non-iOS
    setDateHeat(currentDate);
    updateFormState("lastHeatCycle", currentDate.toLocaleDateString()); // Format as needed
  };

  const onChangeNeuteredDate = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    const currentDate = selectedDate || date;
    setShowNeuteredDatePicker(Platform.OS === "ios"); // Hide the picker after selection for non-iOS
    setDate(currentDate);
    updateFormState("neuteredDate", currentDate.toLocaleDateString()); // Format as needed
  };

  const totalSteps = 4;

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

  interface CheckboxProps {
    label: string;
    checked: boolean;
    onCheck: () => void;
  }

  interface RadioButtonProps {
    label: string;
    checked: boolean;
    onCheck: () => void;
  }

  const [isBathingMandatory, setIsBathingMandatory] = useState(false);

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

  const RadioButton: React.FC<RadioButtonProps> = ({
    label,
    checked,
    onCheck,
  }) => (
    <TouchableOpacity style={styles.radioContainerscreentwo} onPress={onCheck}>
      <View style={[styles.radio, checked && styles.radioChecked]}>
        {checked && <View style={styles.radioInner} />}
      </View>
      <Text style={styles.labelscreentwo}>{label}</Text>
    </TouchableOpacity>
  );

  interface DietEntry {
    time: string;
    portion: string;
  }

  const updateFormState = (key: string, value: string | boolean | Date) => {
    setFormState((prevState) => ({ ...prevState, [key]: value }));
  };

  const handleAggressiveTendenciesChange = (type: any, value: any) => {
    setFormState((prevState) => ({
      ...prevState,
      aggressiveTendencies: {
        ...prevState.aggressiveTendencies,
        [type]: value,
      },
    }));
  };

  // For Medication Details:
  const handleMedicationChange = (field: any, value: any) => {
    setFormState((prevState) => ({
      ...prevState,
      medicationDetails: {
        ...prevState.medicationDetails,
        [field]: value,
      },
    }));
  };

  const addDietEntry = () => {
    setFormState((prevState) => ({
      ...prevState,
      dietSchedule: [...prevState.dietSchedule, { time: "", portion: "" }],
    }));
    setShowTimePickers((prevState) => [...prevState, false]); // Add a new time picker state
  };

  const [vaccinationDate, setVaccinationDate] = useState(new Date());
  const [dewormingDate, setDewormingDate] = useState(new Date());
  const [tickTreatmentDate, setTickTreatmentDate] = useState(new Date());
  const [showVaccinationPicker, setShowVaccinationPicker] = useState(false);
  const [showDewormingPicker, setShowDewormingPicker] = useState(false);
  const [showTickTreatmentPicker, setShowTickTreatmentPicker] = useState(false);
  const [medicalHistory, setMedicalHistory] = useState(false);
  const [aggressiveTendencies, setAggressiveTendencies] = useState({
    maleDog: false,
    femaleDog: false,
    human: false,
    otherAnimals: false,
  });
  const [resourceGuarding, setResourceGuarding] = useState(false);
  const [groomingAggression, setGroomingAggression] = useState(false);
  const [collarAggression, setCollarAggression] = useState(false);
  const [foodAggression, setFoodAggression] = useState(false);

  // const [isLoadings, setIsLoadings] = useState(false);

  const { petProfiles, isLoading, error } = useSelector(
    (state: RootState) => state.petProfile
  );

  console.log("store petprofile data", petProfiles);

 const handlePetProfile = async () => {

   dispatch(setIsLoading(true));

   const accessToken = await AsyncStorage.getItem("access_token");

   try {
     const response = await axios.post(
       `${SERVER_URI}/petprofile-create`,
       formState,
       {
         headers: {
           access_token: accessToken,
         },
       }
     );

     if (response.data) {
       Toast.show(response.data.message, {
         type: "success",
       });

       console.log(response.data.petProfile);

       // Add the new pet profile to Redux state
       dispatch(addPetProfile(response.data.petProfile));
       router.push("/(tabs)/profilesuccess");
     }
   } catch (error: any) {
     if (error.response) {
       console.log("Error Response Data:", error.response.data);
       console.log("Error Response Status:", error.response.status);
       dispatch(
         setError(error.response.data?.message || "Unknown error occurred.")
       );
     } else {
       console.log("Error Message:", error.message);
       dispatch(setError(error.message));
     }
   } finally {
     dispatch(setIsLoading(false));
   }
 };

  // Function to pick an image
  const pickImage = async (index: number) => {
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
      aspect: [4, 3],
      quality: 0.2,
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

      // Update the state with the base64 image
      const updatedImages = [...formState.petImages];
      updatedImages[index] = `data:${mimeType};base64,${base64}`; // Use appropriate MIME type
      setFormState((prevState) => ({
        ...prevState,
        petImages: updatedImages,
      }));
    } catch (error) {
      console.error("Error reading image file:", error);
      Alert.alert("Error", "There was an error processing the image.");
    }
  };
  
    

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View>
            <Text style={styles.label}>Choose your pet type*</Text>
            <View style={styles.petTypeContainer}>
              <TouchableOpacity
                style={[styles.petTypeButton]}
                onPress={() => updateFormState("petType", "DOG")}
              >
                <View
                  style={[
                    styles.petbackground,
                    formState.petType === "DOG" && styles.selectedPetType,
                  ]}
                ></View>
                <Image source={require("@/assets/images/dog-select.png")} />
                <Text style={styles.petTypeText}>DOG</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.petTypeButton]}
                onPress={() => updateFormState("petType", "CAT")}
              >
                <View
                  style={[
                    styles.petbackground,
                    formState.petType === "CAT" && styles.selectedPetType,
                  ]}
                ></View>
                <Image source={require("@/assets/images/cat-select.png")} />
                <Text style={styles.petTypeText}>CAT</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>What is your pet's name ?*</Text>
            <TextInput
              style={styles.input}
              value={formState.petName}
              onChangeText={(text) => updateFormState("petName", text)}
              placeholder="Bruno"
            />

            <Text style={styles.label}>What is the breed of your pet ?*</Text>
            <TextInput
              style={styles.input}
              value={formState.petBreed}
              onChangeText={(text) => updateFormState("petBreed", text)}
              placeholder="Beagle"
            />

            <Text style={styles.label}>How old is your pet ?*</Text>
            <View style={styles.ageContainer}>
              <TextInput
                style={[styles.input, styles.ageInput]}
                value={formState.petAgeYears}
                onChangeText={(text) => updateFormState("petAgeYears", text)}
                placeholder="Years"
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.ageInput]}
                value={formState.petAgeMonths}
                onChangeText={(text) => updateFormState("petAgeMonths", text)}
                placeholder="Months"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.genderContainerbox}>
              <Text style={styles.label}>Your Pet's Gender :*</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    formState.petGender === "Male" && styles.selectedGender,
                  ]}
                  onPress={() => updateFormState("petGender", "Male")}
                >
                  <Icon name="male" size={24} color={"#000"} />
                  <Text style={styles.genderText}>Male</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    formState.petGender === "Female" && styles.selectedGender,
                  ]}
                  onPress={() => updateFormState("petGender", "Female")}
                >
                  <Icon name="female" size={24} color={"#000"} />
                  <Text style={styles.genderText}>Female</Text>
                </TouchableOpacity>
              </View>
            </View>

            {formState.petGender === "Female" && (
              <View style={styles.yellowBox}>
                <Text style={styles.label}>Last heat cycle ended on ?</Text>
                <TouchableOpacity
                  onPress={() => setShowHeatCycleDatePicker(true)}
                >
                  <View style={styles.inputWithIconContainer}>
                    <TextInput
                      style={styles.dateinput}
                      value={formState.lastHeatCycle}
                      placeholder="dd/mm/yy"
                      editable={false} // Disable manual typing
                    />
                    <Icon
                      name="calendar"
                      size={24}
                      color="#000"
                      style={styles.icon}
                    />
                  </View>
                </TouchableOpacity>

                {showHeatCycleDatePicker && (
                  <DateTimePicker
                    value={dateheat}
                    mode="date"
                    display="default"
                    onChange={onChangeHeatCycleDate}
                  />
                )}

                <View style={styles.petneuteredbox}>
                  <Text style={styles.label}>Is your pet neutered ?</Text>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() =>
                      updateFormState("isNeutered", !formState.isNeutered)
                    }
                  >
                    <View
                      style={[
                        styles.checkbox,
                        formState.isNeutered && styles.checked,
                      ]}
                    >
                      {formState.isNeutered && (
                        <Icon name="checkmark" size={16} color="#000" />
                      )}
                    </View>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => setShowNeuteredDatePicker(true)}
                >
                  <View style={styles.inputWithIconContainer}>
                    <TextInput
                      style={styles.dateinput}
                      value={formState.neuteredDate}
                      placeholder="dd/mm/yy"
                      editable={false} // Disable manual typing
                    />
                    <Icon
                      name="calendar"
                      size={24}
                      color="#000"
                      style={styles.icon}
                    />
                  </View>
                </TouchableOpacity>

                {showNeuteredDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onChangeNeuteredDate}
                  />
                )}
              </View>
            )}

            <Text style={styles.label}>Is your pet potty trained ?</Text>
            <View style={styles.pottyTrainingContainer}>
              {[
                "Not Trained",
                "Outdoors",
                "Indoors",
                "Both Indoors and Outdoors",
              ].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.pottyTrainingOption]}
                  onPress={() => updateFormState("pottyTraining", option)}
                >
                  <View style={styles.radioButton}>
                    {formState.pottyTraining === option && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <Text style={styles.pottyTrainingText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {formState.pottyTraining === "Outdoors" && (
              <View style={styles.yellowBox}>
                <Text style={styles.label}>
                  Mention the no. of toilet breaks
                </Text>
                <TextInput
                  style={styles.input}
                  value={formState.toiletBreaks}
                  onChangeText={(text) => updateFormState("toiletBreaks", text)}
                  placeholder="No.s"
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionTitle}>Pet's Preference</Text>
            <Text style={styles.subtitle}>Walks per day:*</Text>
            <View style={styles.radiobuttonbbox}>
              <RadioButton
                label="Not Trained"
                checked={formState.walkPerDay === "not trained"}
                onCheck={() => updateFormState("walkPerDay", "not trained")}
              />
              <RadioButton
                label="Indoors"
                checked={formState.walkPerDay === "indoors"}
                onCheck={() => updateFormState("walkPerDay", "indoors")}
              />
              <RadioButton
                label="Outdoors"
                checked={formState.walkPerDay === "outdoors"}
                onCheck={() => updateFormState("walkPerDay", "outdoors")}
              />
              <RadioButton
                label="Both Indoors and Outdoors"
                checked={formState.walkPerDay === "both"}
                onCheck={() => updateFormState("walkPerDay", "both")}
              />
            </View>
            <Checkbox
              label="Is bathing Mandatory"
              checked={isBathingMandatory}
              onCheck={() => setIsBathingMandatory(!isBathingMandatory)}
            />
            {isBathingMandatory && (
              <View style={styles.bathingFrequency}>
                <Text style={styles.subtitle}>Bathing frequency:</Text>
                <View style={styles.bathingFrequencyboxinnner}>
                  <RadioButton
                    label="Not Trained"
                    checked={formState.bathingFrequency === "not trained"}
                    onCheck={() =>
                      updateFormState("bathingFrequency", "not trained")
                    }
                  />
                  <RadioButton
                    label="Indoors"
                    checked={formState.bathingFrequency === "indoors"}
                    onCheck={() =>
                      updateFormState("bathingFrequency", "indoors")
                    }
                  />
                  <RadioButton
                    label="Outdoors"
                    checked={formState.bathingFrequency === "outdoors"}
                    onCheck={() =>
                      updateFormState("bathingFrequency", "outdoors")
                    }
                  />
                  <RadioButton
                    label="Both Indoors and Outdoors"
                    checked={formState.bathingFrequency === "both"}
                    onCheck={() => updateFormState("bathingFrequency", "both")}
                  />
                </View>
              </View>
            )}
            <Checkbox
              label="Is daily combing required ?"
              checked={formState.dailyCombing}
              onCheck={() =>
                updateFormState("dailyCombing", !formState.dailyCombing)
              }
            />
            <View style={styles.horizontalLine} />
            <Text style={styles.sectionTitle}>Pet's Diet</Text>
            <Text style={styles.sectionDesc}>
              Please provide the diet schedule and the food portions below*
            </Text>
            <View style={styles.dietEntrytitlebox}>
              <Text style={styles.dietEntrytitleboxtext}>Time</Text>
              <Text style={styles.dietEntrytitleboxtext}>Diet + Portion</Text>
            </View>

            <>
              {formState.dietSchedule &&
                formState.dietSchedule.map((entry, index) => (
                  <View key={index} style={styles.dietEntry}>
                    <TouchableOpacity
                      onPress={() => {
                        // Show the time picker only for the respective entry
                        setShowTimePickers((prevState) =>
                          prevState.map((show, i) =>
                            i === index ? true : show
                          )
                        );
                      }}
                      style={styles.timePickerContainer}
                    >
                      <TextInput
                        style={styles.dietEntryinput}
                        placeholder="Time"
                        value={entry.time} // Access entry.time directly
                        editable={false} // Make TextInput non-editable
                      />
                      <AntDesign
                        name="calendar"
                        size={20}
                        color="black"
                        style={styles.timeicon}
                      />
                    </TouchableOpacity>

                    {showTimePickers[index] && (
                      <DateTimePicker
                        value={selectedTime}
                        mode="time"
                        display="default"
                        onChange={(event, selectedDate) =>
                          handleTimeChange(index, event, selectedDate)
                        }
                      />
                    )}

                    <TextInput
                      style={styles.dietEntryinput}
                      placeholder="chicken - 2kg + Rice 1/2 cup"
                      value={entry.portion} // Access entry.portion directly
                      onChangeText={(text) =>
                        handleDietChange(index, "portion", text)
                      }
                    />
                  </View>
                ))}

              <TouchableOpacity style={styles.addButton} onPress={addDietEntry}>
                <Text style={styles.addButtonText}>+ Add more</Text>
              </TouchableOpacity>
            </>
            <View style={styles.foodallergybox}>
              <Text style={styles.foodallergyboxtext}>
                Does your pet have any food allergy ?
              </Text>
              <TextInput
                style={styles.allergyinput}
                placeholder="Does your pet have any food allergy?"
                onChangeText={(text) => updateFormState("foodAllergy", text)}
              />
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepthreesection}>
              <Text style={styles.sectionTitle}>Pet's Medication</Text>

              <Text style={styles.stepthreelabel}>Last Vaccination date ?</Text>
              <TouchableOpacity
                style={styles.stepthreedateInput}
                onPress={() => setShowVaccinationPicker(true)}
              >
                <Text>{formatDate(formState.vaccinationDate)}</Text>
                <Ionicons name="calendar-outline" size={24} color="black" />
              </TouchableOpacity>

              <Text style={styles.stepthreelabel}>Last Deworming date ?</Text>
              <TouchableOpacity
                style={styles.stepthreedateInput}
                onPress={() => setShowDewormingPicker(true)}
              >
                <Text>{formatDate(formState.dewormingDate)}</Text>
                <Ionicons name="calendar-outline" size={24} color="black" />
              </TouchableOpacity>

              <Text style={styles.stepthreelabel}>
                When was the last anti tick treatment done ?
              </Text>
              <TouchableOpacity
                style={styles.stepthreedateInput}
                onPress={() => setShowTickTreatmentPicker(true)}
              >
                <Text>{formatDate(formState.tickTreatmentDate)}</Text>
                <Ionicons name="calendar-outline" size={24} color="black" />
              </TouchableOpacity>

              <View style={styles.stepthreecheckboxContainer}>
                <Text style={styles.stepthreelabel}>
                  Does your pet have any Medical history ?
                </Text>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    medicalHistory && styles.stepthreecheckboxChecked,
                  ]}
                  onPress={() => setMedicalHistory(!medicalHistory)}
                >
                  {medicalHistory && (
                    <Ionicons name="checkmark" size={24} color="#000" />
                  )}
                </TouchableOpacity>
              </View>

              {medicalHistory && (
                <View>
                  <TextInput
                    style={styles.stepthreetextInput}
                    placeholder="Name and Frequency of medication:"
                    value={formState.medicationDetails.nameFrequency}
                    onChangeText={(text) =>
                      handleMedicationChange("nameFrequency", text)
                    }
                  />
                  <TextInput
                    style={styles.stepthreetextInput}
                    placeholder="Reason for medication:"
                    value={formState.medicationDetails.reason}
                    onChangeText={(text) =>
                      handleMedicationChange("reason", text)
                    }
                  />
                  <TextInput
                    style={styles.stepthreetextInput}
                    placeholder="How to administer the medication ?"
                    value={formState.medicationDetails.administration}
                    onChangeText={(text) =>
                      handleMedicationChange("administration", text)
                    }
                  />
                </View>
              )}
            </View>

            <View style={styles.horizontalLine} />

            <View style={styles.stepthreesection}>
              <Text style={styles.sectionTitle}>Pet's Behavioral Analysis</Text>

              <Text style={styles.label}>
                Any aggressive tendencies towards
              </Text>
              <View style={styles.stepthreecheckboxGroup}>
                <View style={styles.stepthreecheckboxItem}>
                  <Text style={styles.stepthreelabeltext}>Male dog</Text>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      formState.aggressiveTendencies.maleDog &&
                        styles.checkboxChecked,
                    ]}
                    onPress={() =>
                      handleAggressiveTendenciesChange(
                        "maleDog",
                        !formState.aggressiveTendencies.maleDog
                      )
                    }
                  >
                    {formState.aggressiveTendencies.maleDog && (
                      <Ionicons name="checkmark" size={24} color="#000" />
                    )}
                  </TouchableOpacity>
                </View>
                <View style={styles.stepthreecheckboxItem}>
                  <Text style={styles.stepthreelabeltext}>Female dog</Text>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      formState.aggressiveTendencies.femaleDog &&
                        styles.checkboxChecked,
                    ]}
                    onPress={() =>
                      handleAggressiveTendenciesChange(
                        "femaleDog",
                        !formState.aggressiveTendencies.femaleDog
                      )
                    }
                  >
                    {formState.aggressiveTendencies.femaleDog && (
                      <Ionicons name="checkmark" size={24} color="#000" />
                    )}
                  </TouchableOpacity>
                </View>
                <View style={styles.stepthreecheckboxItem}>
                  <Text style={styles.stepthreelabeltext}>Human</Text>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      formState.aggressiveTendencies.human &&
                        styles.checkboxChecked,
                    ]}
                    onPress={() =>
                      handleAggressiveTendenciesChange(
                        "human",
                        !formState.aggressiveTendencies.human
                      )
                    }
                  >
                    {formState.aggressiveTendencies.human && (
                      <Ionicons name="checkmark" size={24} color="#000" />
                    )}
                  </TouchableOpacity>
                </View>
                <View style={styles.stepthreecheckboxItem}>
                  <Text style={styles.stepthreelabeltext}>Other animals</Text>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      formState.aggressiveTendencies.otherAnimals &&
                        styles.checkboxChecked,
                    ]}
                    onPress={() =>
                      handleAggressiveTendenciesChange(
                        "otherAnimals",
                        !formState.aggressiveTendencies.otherAnimals
                      )
                    }
                  >
                    {formState.aggressiveTendencies.otherAnimals && (
                      <Ionicons name="checkmark" size={24} color="#000" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.stepthreecheckboxContainer}>
                <Text style={styles.stepthreelabelwidth}>
                  Does your pet have any tendencies of resource guarding?
                </Text>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    formState.resourceGuarding && styles.checkboxChecked,
                  ]}
                  onPress={() =>
                    updateFormState(
                      "resourceGuarding",
                      !formState.resourceGuarding
                    )
                  }
                >
                  {formState.resourceGuarding && (
                    <Ionicons name="checkmark" size={24} color="#000" />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.stepthreecheckboxContainer}>
                <Text style={styles.stepthreelabelwidth}>
                  Any aggression while grooming?
                </Text>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    formState.groomingAggression && styles.checkboxChecked,
                  ]}
                  onPress={() =>
                    updateFormState(
                      "groomingAggression",
                      !formState.groomingAggression
                    )
                  }
                >
                  {formState.groomingAggression && (
                    <Ionicons name="checkmark" size={24} color="#000" />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.stepthreecheckboxContainer}>
                <Text style={styles.stepthreelabelwidth}>
                  Does he/she have aggression while putting on collar or leash?
                </Text>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    formState.collarAggression && styles.checkboxChecked,
                  ]}
                  onPress={() =>
                    updateFormState(
                      "collarAggression",
                      !formState.collarAggression
                    )
                  }
                >
                  {formState.collarAggression && (
                    <Ionicons name="checkmark" size={24} color="#000" />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.stepthreecheckboxContainer}>
                <Text style={styles.stepthreelabelwidth}>
                  Does your pet have any food aggression?
                </Text>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    formState.foodAggression && styles.checkboxChecked,
                  ]}
                  onPress={() =>
                    updateFormState("foodAggression", !formState.foodAggression)
                  }
                >
                  {formState.foodAggression && (
                    <Ionicons name="checkmark" size={24} color="#000" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {showVaccinationPicker && (
              <DateTimePicker
                value={
                  formState.vaccinationDate
                    ? new Date(formState.vaccinationDate)
                    : new Date()
                }
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowVaccinationPicker(false); // Close the picker first
                  handleDateChange("vaccinationDate", selectedDate); // Update state after
                }}
              />
            )}
            {showDewormingPicker && (
              <DateTimePicker
                value={
                  formState.dewormingDate
                    ? new Date(formState.dewormingDate)
                    : new Date()
                }
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDewormingPicker(false);
                  handleDateChange("dewormingDate", selectedDate);
                }}
              />
            )}
            {showTickTreatmentPicker && (
              <DateTimePicker
                value={
                  formState.tickTreatmentDate
                    ? new Date(formState.tickTreatmentDate)
                    : new Date()
                }
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowTickTreatmentPicker(false);
                  handleDateChange("tickTreatmentDate", selectedDate);
                }}
              />
            )}
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepfourgalleryText}>Pet's Gallery</Text>
            <View style={styles.stepfourimageContainer}>
              {formState.petImages.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.stepfourimagePicker}
                  onPress={() => pickImage(index)}
                >
                  {image ? (
                    <Image
                      source={{ uri: image }}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Text style={styles.stepfourplusIcon}>+</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
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
          <Text style={styles.headerTitle}>Pet Profile</Text>
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
                {currentStep === 2 && "Next to Pet's Medication"}
                {currentStep === 3 && "Next to Pet's Gallery"}
              </Text>
              <Ionicons name="arrow-forward" size={24} color="black" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.button,
                isNextButtonDisabled && styles.disabledButton,
              ]}
              onPress={() => handlePetProfile()}
              disabled={isNextButtonDisabled}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Almost done</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { height, width: screenWidth } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 20,
    marginTop: 30,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 130, // Add extra padding at the bottom for the fixed navigation
  },

  header: {
    backgroundColor: "#FDCF00",
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
    backgroundColor: "#FDCF00",
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
    borderRadius: 50,
    borderColor: "#000",
    borderWidth: 2,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "semibold",
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
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },

  icon: {
    marginLeft: 10, // Adds some space between the input and the icon
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
    backgroundColor: "#FDCF00",
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
    backgroundColor: "#FDCF00",
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
    width: (screenWidth - 80) / 2,
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
});

function setPetImages(updatedImages: any[]) {
  throw new Error("Function not implemented.");
}

