import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function ProfileScreen () {
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="arrow-back" size={24} color="#000" />
        <Text style={styles.headerTitle}>Pet Profile</Text>
        <Icon name="ellipsis-horizontal" size={24} color="#000" />
      </View>

      <Text style={styles.label}>Choose your pet type*</Text>
      <View style={styles.petTypeContainer}>
        <TouchableOpacity
          style={[
            styles.petTypeButton,
            formState.petType === "DOG" && styles.selectedPetType,
          ]}
          onPress={() => updateFormState("petType", "DOG")}
        >
          <Text style={styles.petTypeText}>DOG</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.petTypeButton,
            formState.petType === "CAT" && styles.selectedPetType,
          ]}
          onPress={() => updateFormState("petType", "CAT")}
        >
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

      <Text style={styles.label}>Your Pet's Gender :*</Text>
      <View style={styles.genderContainer}>
        <TouchableOpacity
          style={[
            styles.genderButton,
            formState.petGender === "Male" && styles.selectedGender,
          ]}
          onPress={() => updateFormState("petGender", "Male")}
        >
          <Icon
            name="male"
            size={24}
            color={formState.petGender === "Male" ? "#FFD700" : "#000"}
          />
          <Text style={styles.genderText}>Male</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.genderButton,
            formState.petGender === "Female" && styles.selectedGender,
          ]}
          onPress={() => updateFormState("petGender", "Female")}
        >
          <Icon
            name="female"
            size={24}
            color={formState.petGender === "Female" ? "#FFD700" : "#000"}
          />
          <Text style={styles.genderText}>Female</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.yellowBox}>
        <Text style={styles.label}>Last heat cycle ended on ?</Text>
        <TextInput
          style={styles.input}
          value={formState.lastHeatCycle}
          onChangeText={(text) => updateFormState("lastHeatCycle", text)}
          placeholder="dd/mm/yy"
        />

        <Text style={styles.label}>Is your pet neutered ?</Text>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => updateFormState("isNeutered", !formState.isNeutered)}
        >
          <View
            style={[styles.checkbox, formState.isNeutered && styles.checked]}
          >
            {formState.isNeutered && (
              <Icon name="checkmark" size={16} color="#000" />
            )}
          </View>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={formState.neuteredDate}
          onChangeText={(text) => updateFormState("neuteredDate", text)}
          placeholder="dd/mm/yy"
        />
      </View>

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
            style={[
              styles.pottyTrainingOption,
              formState.pottyTraining === option &&
                styles.selectedPottyTraining,
            ]}
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

      <View style={styles.yellowBox}>
        <Text style={styles.label}>Mention the no. of toilet breaks</Text>
        <TextInput
          style={styles.input}
          value={formState.toiletBreaks}
          onChangeText={(text) => updateFormState("toiletBreaks", text)}
          placeholder="No.s"
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.nextButton}>
        <Text style={styles.nextButtonText}>next to Preferences</Text>
        <Icon name="arrow-forward" size={24} color="#000" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  petTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  petTypeButton: {
    backgroundColor: "#FFD700",
    padding: 20,
    borderRadius: 50,
  },
  selectedPetType: {
    backgroundColor: "#FFA500",
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
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  genderButton: {
    alignItems: "center",
  },
  selectedGender: {
    backgroundColor: "#FFD700",
    borderRadius: 50,
    padding: 10,
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
    width: 20,
    height: 20,
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
  },
  pottyTrainingOption: {
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
});
