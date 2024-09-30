import React, { useEffect, useState } from "react";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_700Bold,
  Nunito_600SemiBold,
} from "@expo-google-fonts/nunito";
import Svg, { Line } from "react-native-svg";
import useUser from "@/hooks/auth/useUser";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URI } from "@/utils/uri";
import axios from "axios";
import { Toast } from "react-native-toast-notifications";
import { router } from "expo-router";

const EditProfileScreen = () => {
  const { user, loading, setRefetch } = useUser();

  // State for the profile image and input fields
  const [image, setImage] = useState<any>(null);
  const [loader, setLoader] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [profession, setProfession] = useState("");

   useEffect(() => {
     if (user) {
       setFullName(user.fullname || "");
       setPhoneNumber(user.phonenumber || "");
       setEmail(user.email || "");
       setProfession(user.profession || "");
       setImage(user.avatar?.url || "");
     }
   }, [user]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true, // Allows resizing or cropping the image before selection
      aspect: [4, 3], // Aspect ratio (optional)
      quality: 0.2, // Reduce quality to 50%, you can adjust this
    });

    if (!result.canceled) {
      const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setLoader(true);
      const base64Image = `data:image/jpeg;base64,${base64}`;
      setImage(base64Image);
    }
  };

  const handleUpdate = async () => {
    setLoader(true);

    const accessToken = await AsyncStorage.getItem("access_token");
    const refreshToken = await AsyncStorage.getItem("refresh_token");

    try {
      const response = await axios.put(
        `${SERVER_URI}/update-user`,
        {
          avatar: image,
          fullname: fullName,
          phonenumber: phoneNumber,
          email: email,
          profession: profession,
        },
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
        setRefetch(true);
        router.push("/(tabs)/");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoader(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={{ flex: 1 }}>
        {/* Header Section with Avatar and Edit Button */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image
              style={styles.avatar}
              source={{
                uri:
                  image ||
                  user?.avatar?.url ||
                  "https://res.cloudinary.com/dshp9jnuy/image/upload/v1665822253/avatars/nrxsg8sd9iy10bbsoenn.png",
              }}
            />
            <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
              <MaterialIcon name="photo-camera" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.maincontent}>
          {/* Personal Information Section */}
          <View style={styles.personalinfo}>
            <View style={styles.personalinfoicon}>
              <View style={styles.personalinfoiconbox}>
                <Image source={require("@/assets/icons/personalleft.png")} />
              </View>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View
                style={[
                  styles.personalinfoiconbox,
                  { backgroundColor: "#FDCF00" },
                ]}
              >
                <Image source={require("@/assets/icons/personalright.png")} />
              </View>
            </View>
            <View style={styles.form}>
              {/* Full Name Input */}
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="Gary Joseph"
                  value={fullName}
                  onChangeText={setFullName}
                />
                <Image
                  source={require("@/assets/icons/fullnameicon.png")}
                  style={styles.icon}
                />
              </View>

              {/* Phone Number Input */}
              <Text style={styles.label}>Phone no.</Text>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="9843378670"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />

                <Image
                  source={require("@/assets/icons/phonenumbericon.png")}
                  style={styles.icon}
                />
              </View>

              {/* Email Input */}
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="garyjosiee234@gmail.com"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />

                <Image
                  source={require("@/assets/icons/emailicon.png")}
                  style={styles.icon}
                />
              </View>

              {/* Profession Input */}

              <Text style={styles.label}>Profession</Text>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="Freelancer"
                  value={profession}
                  onChangeText={setProfession}
                />

                <Image
                  source={require("@/assets/icons/freelancericon.png")}
                  style={styles.icon}
                />
              </View>
            </View>

            {/* Update Button */}
            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleUpdate}
            >
              <Text style={styles.updateButtonText}>
                Update
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 140,
    backgroundColor: "rgba(253, 207, 0, 0.4)",
  },

  maincontent: {
    marginTop: 40,
    height: "100%",
  },

  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    position: "absolute",
    top: 60,
    left: 140,
    zIndex: 999,
    borderColor: "#000",
    borderWidth: 2,
    borderRadius: 60,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
  },

  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 10,
    backgroundColor: "#FDCF00",
    borderColor: "#000",
    borderWidth: 1,
    padding: 5,
    borderRadius: 20,
  },

  personalinfo: {
    marginTop: 80,
    height: " 100%",
    backgroundColor: "#fff",
    borderTopRightRadius: 48,
    borderTopLeftRadius: 48,
    paddingTop: 70,
  },

  personalinfoicon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
    marginBottom: 16,
  },

  personalinfoiconbox: {
    width: 36,
    height: 36,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(253, 207, 0, 0.4)",
  },

  sectionTitle: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 16,
  },
  form: {
    paddingHorizontal: 20,
  },

  label: {
    fontSize: 14, // Customize font size
    color: "#000", // Text color
    marginBottom: 5, // Space between label and input group
  },

  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
  },
  updateButton: {
    backgroundColor: "#FDCF00",
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
});

export default EditProfileScreen;