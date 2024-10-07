import React, { useState } from "react";
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
  Platform
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

export default function ProfileScreen() {

  const { height } = Dimensions.get("window");
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showHeatCycleDatePicker, setShowHeatCycleDatePicker] = useState(false);
  const [showNeuteredDatePicker, setShowNeuteredDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [dateheat, setDateHeat] = useState(new Date());

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
    if (currentStep < totalSteps) {
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
  const [walkPreference, setWalkPreference] = useState("");
  const [bathingFrequency, setBathingFrequency] = useState("");
  const [dietSchedule, setDietSchedule] = useState([{ time: "", portion: "" }]);

  const addDietEntry = () => {
    setDietSchedule([...dietSchedule, { time: "", portion: "" }]);
  };

  const handleDietChange = (
    index: number,
    key: "time" | "portion",
    value: string
  ) => {
    const updatedDiet = [...dietSchedule];
    updatedDiet[index][key] = value;
    setDietSchedule(updatedDiet);
  };

  const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onCheck }) => (
    <TouchableOpacity
      style={styles.checkboxContainerscreentwo}
      onPress={onCheck}
    >
      <View
        style={[styles.checkboxscreentwo, checked && styles.checkedscreentwo]}
      >
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.labelscreentwo}>{label}</Text>
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
  });

  const updateFormState = (key: string, value: string | boolean) => {
    setFormState((prevState) => ({ ...prevState, [key]: value }));
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
            <RadioButton
              label="Not Trained"
              checked={walkPreference === "not-trained"}
              onCheck={() => setWalkPreference("not-trained")}
            />
            <RadioButton
              label="Indoors"
              checked={walkPreference === "indoors"}
              onCheck={() => setWalkPreference("indoors")}
            />
            <RadioButton
              label="Outdoors"
              checked={walkPreference === "outdoors"}
              onCheck={() => setWalkPreference("outdoors")}
            />
            <RadioButton
              label="Both Indoors and Outdoors"
              checked={walkPreference === "both"}
              onCheck={() => setWalkPreference("both")}
            />

            <Checkbox
              label="Is bathing Mandatory"
              checked={isBathingMandatory}
              onCheck={() => setIsBathingMandatory(!isBathingMandatory)}
            />

            {isBathingMandatory && (
              <View style={styles.bathingFrequency}>
                <Text style={styles.subtitle}>Bathing frequency:</Text>
                <RadioButton
                  label="Not Trained"
                  checked={bathingFrequency === "not-trained"}
                  onCheck={() => setBathingFrequency("not-trained")}
                />
                <RadioButton
                  label="Indoors"
                  checked={bathingFrequency === "indoors"}
                  onCheck={() => setBathingFrequency("indoors")}
                />
                <RadioButton
                  label="Outdoors"
                  checked={bathingFrequency === "outdoors"}
                  onCheck={() => setBathingFrequency("outdoors")}
                />
                <RadioButton
                  label="Both Indoors and Outdoors"
                  checked={bathingFrequency === "both"}
                  onCheck={() => setBathingFrequency("both")}
                />
              </View>
            )}

            <Checkbox
              label="Is daily combing required ?"
              checked={false}
              onCheck={() => {}}
            />

            <Text style={styles.sectionTitle}>Pet's Diet</Text>
            <Text>
              Please provide the diet schedule and the food portions below*
            </Text>

            {dietSchedule.map((entry, index) => (
              <View key={index} style={styles.dietEntry}>
                <TextInput
                  style={styles.input}
                  placeholder="Time"
                  value={entry.time}
                  onChangeText={(text) => handleDietChange(index, "time", text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Diet + Portion"
                  value={entry.portion}
                  onChangeText={(text) =>
                    handleDietChange(index, "portion", text)
                  }
                />
              </View>
            ))}

            <TouchableOpacity style={styles.addButton} onPress={addDietEntry}>
              <Text style={styles.addButtonText}>+ Add more</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Does your pet have any food allergy?"
            />
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Step 3</Text>
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Step 4</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={prevStep}
          style={styles.arrowcontainer}
        >
          <Icon name="arrow-back" size={24} color="#000" />
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}

        <View style={styles.bottomNavigation}>
          {currentStep < totalSteps ? (
            <TouchableOpacity style={styles.button} onPress={nextStep}>
              <Text style={styles.buttonText}>Next to Preferences</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => console.log(formState)}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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

  arrowcontainer: {
    backgroundColor: "#FDCF00",
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    height: 30,
    borderRadius: 15,
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
    backgroundColor: "#000",
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
    paddingVertical: 20,
    paddingHorizontal: 20,
  },

  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  button: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FDCF00",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },

  dietEntry: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  addButton: {
    backgroundColor: "#FFD700",
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
  },
  addButtonText: {
    color: "#000",
    fontWeight: "bold",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 8,
  },
  checkboxContainerscreentwo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkboxscreentwo: {
    width: 20,
    height: 20,
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
    borderColor: "yellow",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "yellow",
  },
  labelscreentwo: {
    fontSize: 16,
  },
  bathingFrequency: {
    backgroundColor: "#FFFFE0",
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
});
