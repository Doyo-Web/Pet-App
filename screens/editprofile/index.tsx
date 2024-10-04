import React from "react";
import { useEffect, useState } from "react";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
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
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URI } from "@/utils/uri";
import axios from "axios";
import { Toast } from "react-native-toast-notifications";
import { router } from "expo-router";
import { Feather, FontAwesome6, Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Dimensions } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setLoading, setError } from "@/store/userSlice";

const EditProfileScreen = () => {

  const dispatch = useDispatch();
  
  const apiKey = "AIzaSyCjJZAxdNLakBt50NPO9rCXd4-plRiXLcA";

  const { width: windowWidth, height: windowHeight } = Dimensions.get("window");

  type CurrentLocationType = Location.LocationObjectCoords | null;

const [isPersonalInfo, setIsPersonalInfo] = useState(0);
const [isOldPasswordVisible, setOldPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setNewPasswordVisible] = useState(false);
  
  const [UserPassword, setUserPassword] = useState({
    oldpassword: "",
    newpassword: "",
  });


  const handlePasswordChange = async () => {
    setLoader(true);

    const accessToken = await AsyncStorage.getItem("access_token");
    const refreshToken = await AsyncStorage.getItem("refresh_token");

    try {
      const response = await axios.put(
        `${SERVER_URI}/change-password`,
        {
          avatar: image,
          oldpassword: UserPassword.oldpassword,
          newpassword: UserPassword.newpassword,
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
        router.push("/(drawer)");
      }
    } catch (error: any) {
      // Error handling
      const errorMessage =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : "Something went wrong. Please try again.";

      // Show error in toast with danger type
      Toast.show(errorMessage, {
        type: "danger",
      });
    } finally {
      setLoader(false);
    }
  };
  
  const [currentLocation, setCurrentLocation] =
    useState<CurrentLocationType>(null);
  const [isMapVisible, setIsMapVisible] = useState(false);

//  useEffect(() => {
//    (async () => {
//      // Request permission to access location
//      let { status } = await Location.requestForegroundPermissionsAsync();
//      if (status !== "granted") {
//        console.log("Permission to access location was denied");
//      } else {
//        // Get current location
//        let location = await Location.getCurrentPositionAsync({});
//        setCurrentLocation(location.coords as Location.LocationObjectCoords);
//      }
//    })();
//  }, []);

const getLocation = async () => {
  // Check for permissions
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status === "granted") {
    const location = await Location.getCurrentPositionAsync({});
    setCurrentLocation(location.coords as Location.LocationObjectCoords);
  } else {
    // Handle permission denial
    Toast.show("Location permission denied", { type: "danger" });
  }
};

useEffect(() => {
  // Get location only when in Manage Address component
  if (isPersonalInfo === 1) {
    getLocation();
  }
}, [isPersonalInfo]);
  
  const handleLocationSelect = () => {
  setIsMapVisible(true);
  };
  
  const handleMapLocationSelect = async (location: any) => {
    console.log("location", location);
    // Reverse geocoding to get the city and pincode
    const { latitude, longitude } = location;

    setCurrentLocation(location);

    console.log(latitude, longitude);

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    );

    // Check if we received results
    if (response.data.results.length > 0) {
      const addressComponents = response.data.results[0].address_components;
      const cityComponent = addressComponents.find(
        (component: { types: string | string[]; }) =>
          component.types.includes("locality") ||
          component.types.includes("administrative_area_level_1")
      );
      const pincodeComponent = addressComponents.find((component: { types: string | string[]; }) =>
        component.types.includes("postal_code")
      );

      const formattedAddress = response.data.results[0].formatted_address;
      const addressParts = formattedAddress.split(", ");

      // Assuming the address has at least 2 lines, update line1 and line2
      const line1Value = addressParts[0] || "";
      const line2Value = addressParts[1] || "";

      setLine1(line1Value);
      setLine2(line2Value);
      setPickupLocation(cityComponent ? cityComponent.long_name : "");

      setCity(cityComponent ? cityComponent.long_name : "");
      setPincode(pincodeComponent ? pincodeComponent.long_name : "");
      setIsMapVisible(false);
    }
  };

  const { user, loading, setRefetch } = useUser();
  const [isChangePassword, setIsChangePassword] = useState(false);

   const [pickuplocation, setPickupLocation] = useState("");
   const [line1, setLine1] = useState("");
   const [line2, setLine2] = useState("");
   const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  

  // State for the profile image and input fields
  const [image, setImage] = useState<any>(null);
   const [kycimage, setKycImage] = useState<any>(null);
  const [loader, setLoader] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [profession, setProfession] = useState("");

  const addresses = [
    {
      id: "1",
      label: "Home",
      location: "Mumbai",
      icon: require("@/assets/icons/managehomeicon.png"), // Replace with your icon
      shadowColor: "#FFD700", // Gold
      backgroundColor: "#FDCF00",
    },
    {
      id: "2",
      label: "Work",
      location: "Mumbai",
      icon: require("@/assets/icons/manageworkicon.png"), // Replace with your icon
      shadowColor: "#00BFFF",
      backgroundColor: "#00D0C3",
    },
    {
      id: "3",
      label: "Friend",
      location: "Delhi",
      icon: require("@/assets/icons/managefriendicon.png"), // Replace with your icon
      shadowColor: "#FF6347",
      backgroundColor: "#F96247",
    },
  ];

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

  const pickKycImage = async () => {
    // Show options to the user to choose between camera, gallery, and documents
    Alert.alert(
      "Select KYC Source",
      "Choose an option to upload an image or document.",
      [
        {
          text: "Camera",
          onPress: async () => {
            // Open the camera
            let result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.All,
              allowsEditing: true,
              quality: 1.0,
            });

            // If the user has not canceled the operation
            if (!result.canceled) {
              const base64 = await FileSystem.readAsStringAsync(
                result.assets[0].uri,
                {
                  encoding: FileSystem.EncodingType.Base64,
                }
              );
              setLoader(true);
              const base64Image = `data:image/jpeg;base64,${base64}`;
              setKycImage(base64Image);
            }
          },
        },
        {
          text: "Gallery",
          onPress: async () => {
            // Open the gallery
            let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.All,
              allowsEditing: true,
              quality: 1.0,
            });

            // If the user has not canceled the operation
            if (!result.canceled) {
              const base64 = await FileSystem.readAsStringAsync(
                result.assets[0].uri,
                {
                  encoding: FileSystem.EncodingType.Base64,
                }
              );
              setLoader(true);
              const base64Image = `data:image/jpeg;base64,${base64}`;
              setKycImage(base64Image);
            }
          },
        },
        {
          text: "Documents",
          onPress: async () => {
            // Open the document picker for PDF files
            let result = await DocumentPicker.getDocumentAsync({
              type: "application/pdf", // Only allow PDFs
            });

            // Check if the document was successfully picked or the operation was canceled
            if (!result.canceled) {
              const { uri, name, size } = result.assets[0];

              // If the user picked a file, convert it to base64
              const fileBase64 = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
              });
              setLoader(true);
              const base64Pdf = `data:application/pdf;base64,${fileBase64}`;
              setKycImage(base64Pdf);
            } else {
              // Handle the case where the user canceled the document picker
              console.log("Document picking canceled");
            }
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };


  const handleLocationUpdate = async () => {
    setLoader(true);

    const accessToken = await AsyncStorage.getItem("access_token");
    const refreshToken = await AsyncStorage.getItem("refresh_token");

    try {
      const response = await axios.put(
        `${SERVER_URI}/update-location`,
        {
          pickuplocation,
          line1,
          line2,
          city,
          pincode,
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
        // setRefetch(true);
        // router.push("/(tabs)/");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoader(false);
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
        dispatch(setUser(response.data.user));
        setRefetch(true);
        router.push("/(tabs)/");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoader(false);
    }
  };

  const handleKycUpdate = async () => {
    setLoader(true);

    const accessToken = await AsyncStorage.getItem("access_token");
    const refreshToken = await AsyncStorage.getItem("refresh_token");

    try {
      const response = await axios.put(
        `${SERVER_URI}/update-aadhar`,
        {
          aadhar: kycimage,
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
        // setRefetch(true);
        // router.push("/(tabs)/");
      }
    } catch (error: any) {
      // Error handling
      const errorMessage =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : "Something went wrong. Please try again.";

      // Show error in toast with danger type
      Toast.show(errorMessage, {
        type: "danger",
      });
    } finally {
      setLoader(false);
    }
  };

 const handleComponent = () => {
   setIsPersonalInfo((prev) => {
     if (prev < 3) {
       return prev + 1;
     }
     return prev; // Return the previous value if it's already 3 or greater
   });
   
  };
  
  const handledecrementComponent = () => {
    setIsPersonalInfo((prev) => {
      if (prev > 0) {
        return prev - 1;
      }
      return prev; // Return the previous value if it's already 0
    });
  };

  const renderAddress = ({ item }: any) => (
    <View style={[styles.addressCard, { shadowColor: item.shadowColor }]}>
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 50,
          backgroundColor: item.backgroundColor,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image source={item.icon} />
      </View>
      <View style={styles.addressText}>
        <Text style={styles.label}>{item.label}</Text>
        <View style={styles.locationbox}>
          <Image source={require("@/assets/icons/managelocation.png")} />
          <Text style={styles.location}>{item.location}</Text>
        </View>
      </View>
    </View>
  );

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
              <TouchableOpacity
                onPress={handledecrementComponent}
                disabled={isPersonalInfo === 0} // Disable if isPersonalInfo is 0
              >
                <View
                  style={[
                    styles.personalinfoiconbox,
                    isPersonalInfo === 0 && {
                      backgroundColor: "rgba(253, 207, 0, 0.4)",
                    }, // Change background color if isPersonalInfo is 0
                  ]}
                >
                  <Image source={require("@/assets/icons/personalleft.png")} />
                </View>
              </TouchableOpacity>
              <Text style={styles.sectionTitle}>
                {isPersonalInfo === 0 && "Personal Information"}
                {isPersonalInfo === 1 && "Manage Address"}
                {isPersonalInfo === 2 && "Change Password"}
                {isPersonalInfo === 3 && "KYC Details"}
              </Text>
              <TouchableOpacity
                onPress={handleComponent}
                disabled={isPersonalInfo === 3} // Disable if isPersonalInfo is 3
              >
                <View
                  style={[
                    styles.personalinfoiconbox,
                    isPersonalInfo === 3 && {
                      backgroundColor: "rgba(253, 207, 0, 0.4)",
                    }, // Change background color if isPersonalInfo is 3
                  ]}
                >
                  <Image source={require("@/assets/icons/personalright.png")} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Manage Address Component*/}

            {isPersonalInfo === 1 && (
              <View style={{ justifyContent: "center" }}>
                <FlatList
                  data={addresses}
                  renderItem={renderAddress}
                  keyExtractor={(item) => item.id}
                  numColumns={4}
                  contentContainerStyle={styles.addressList}
                />

                {/* Add New Button */}
                <TouchableOpacity style={styles.addButton}>
                  <View style={styles.addCard}>
                    <View
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 50,
                        backgroundColor: "#FDCF00",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Image
                        source={require("@/assets/icons/manageaddnew.png")}
                      />
                    </View>
                    <Text style={styles.addText}>Add New</Text>
                  </View>
                </TouchableOpacity>

                {/* Manage Address Form*/}

                <View style={styles.managecontainer}>
                  <View style={styles.manageline} />
                  <View style={styles.manageheader}>
                    <View style={styles.manageiconContainer}>
                      <Image
                        source={{
                          uri: "https://img.icons8.com/ios-filled/100/000000/home.png",
                        }} // Example home icon
                        style={styles.manageicon}
                      />
                    </View>
                  </View>

                  {isMapVisible && (
                    <MapView
                      style={{ flex: 1, height: windowHeight * 0.4 }}
                      initialRegion={{
                        latitude: currentLocation
                          ? currentLocation.latitude
                          : 37.78825, // Default latitude
                        longitude: currentLocation
                          ? currentLocation.longitude
                          : -122.4324, // Default longitude
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                      }}
                      onPress={(e) =>
                        handleMapLocationSelect(e.nativeEvent.coordinate)
                      }
                    >
                      {currentLocation && (
                        <Marker
                          coordinate={currentLocation}
                          title="Your Location"
                        />
                      )}
                    </MapView>
                  )}

                  <Text style={styles.managelabel}>Pick Location</Text>
                  <View style={styles.managelocationContainer}>
                    <View style={styles.inputGroup}>
                      <TextInput
                        style={styles.input}
                        value={pickuplocation}
                        placeholder="Mumbai"
                        onChangeText={setPickupLocation}
                      />
                      <TouchableOpacity
                        style={styles.managelocationIcon}
                        onPress={handleLocationSelect}
                      >
                        <FontAwesome6
                          name="location-crosshairs"
                          size={24}
                          color="black"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.managelabel}>Line 1</Text>
                  <TextInput
                    style={styles.manageinput}
                    placeholder="Sector 123, 6th Cross"
                    value={line1}
                    onChangeText={setLine1}
                  />

                  <Text style={styles.managelabel}>Line 2</Text>
                  <TextInput
                    style={styles.manageinput}
                    placeholder="7th Extension"
                    value={line2}
                    onChangeText={setLine2}
                  />

                  <Text style={styles.managelabel}>City</Text>
                  <TextInput
                    style={styles.manageinput}
                    value={city}
                    placeholder="Mumbai"
                    onChangeText={setCity}
                  />

                  <Text style={styles.managelabel}>Pincode</Text>
                  <TextInput
                    style={styles.manageinput}
                    placeholder="643123"
                    value={pincode}
                    keyboardType="numeric"
                    onChangeText={setPincode}
                  />
                </View>

                {/* Manage Address Form */}

                {/* Update Button */}
                <TouchableOpacity
                  style={styles.updateButton}
                  onPress={handleLocationUpdate}
                >
                  <Text style={styles.updateButtonText}>Update</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Manage Address Component*/}

            {/* Change Password Component*/}

            {isPersonalInfo === 2 && (
              <View style={{ justifyContent: "center" }}>
                {/* Change Password Form*/}

                <View style={styles.changepasscontainer}>
                  <View>
                    <TextInput
                      style={[
                        styles.changepassinput,
                        { paddingLeft: 10, marginTop: 10 },
                      ]}
                      keyboardType="default"
                      secureTextEntry={!isOldPasswordVisible}
                      placeholder="Old Password"
                      placeholderTextColor="#000000"
                      onChangeText={(value) =>
                        setUserPassword({ ...UserPassword, oldpassword: value })
                      }
                    />

                    <TouchableOpacity
                      style={styles.visibleIcon}
                      onPress={() =>
                        setOldPasswordVisible(!isOldPasswordVisible)
                      }
                    >
                      {isOldPasswordVisible ? (
                        // <Ionicons name="eye-off-outline" size={23} color={"#000"} />
                        <Image
                          style={{
                            position: "absolute",
                            right: 2,
                            top: 8,
                            width: 22,
                            height: 22,
                            objectFit: "contain",
                          }}
                          source={require("@/assets/icons/eyecuticon.png")}
                        />
                      ) : (
                        <Ionicons
                          style={{ position: "absolute", right: 2, top: 8 }}
                          name="eye-outline"
                          size={22}
                          color={"#000"}
                        />
                      )}
                    </TouchableOpacity>
                  </View>

                  <View>
                    <TextInput
                      style={[
                        styles.changepassinput,
                        { paddingLeft: 10, marginTop: 10 },
                      ]}
                      keyboardType="default"
                      secureTextEntry={!isNewPasswordVisible}
                      placeholder="New Password"
                      placeholderTextColor="#000000"
                      onChangeText={(value) =>
                        setUserPassword({ ...UserPassword, newpassword: value })
                      }
                    />

                    <TouchableOpacity
                      style={styles.visibleIcon}
                      onPress={() =>
                        setNewPasswordVisible(!isNewPasswordVisible)
                      }
                    >
                      {isNewPasswordVisible ? (
                        // <Ionicons name="eye-off-outline" size={23} color={"#000"} />
                        <Image
                          style={{
                            position: "absolute",
                            right: 2,
                            top: 8,
                            width: 22,
                            height: 22,
                            objectFit: "contain",
                          }}
                          source={require("@/assets/icons/eyecuticon.png")}
                        />
                      ) : (
                        <Ionicons
                          style={{ position: "absolute", right: 2, top: 8 }}
                          name="eye-outline"
                          size={22}
                          color={"#000"}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Change Password Form */}

                {/* Update Button */}
                <TouchableOpacity
                  style={styles.resetbutton}
                  onPress={handlePasswordChange}
                >
                  <Text style={styles.updateButtonText}>Reset Password</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Change Password Component*/}

            {/* KYC Details */}

            {isPersonalInfo === 3 && (
              <View style={{ flex: 1, alignItems: "center" }}>
                <View style={styles.kyctitle}>
                  <Text style={styles.kyctext}>Aadhar Proof</Text>
                </View>
                <View style={styles.kycheader}>
                  <View style={styles.kycavatarContainer}>
                    <Image
                      style={styles.kycavatar}
                      source={{
                        uri:
                          kycimage ||
                          user?.aadhar?.url ||
                          "https://i.sstatic.net/y9DpT.jpg",
                      }}
                    />
                    <TouchableOpacity
                      style={styles.kyceditIcon}
                      onPress={pickKycImage}
                    >
                      <Feather name="upload" size={30} color="black" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Update Button */}
                <TouchableOpacity
                  style={styles.kycupdateButton}
                  onPress={handleKycUpdate}
                >
                  <Text style={styles.updateButtonText}>Update</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* KYC Details */}

            {isPersonalInfo === 0 && (
              <View>
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
                  <Text style={styles.updateButtonText}>Update</Text>
                </TouchableOpacity>
              </View>
            )}
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

  kyctitle: {
    backgroundColor: "#FDCF00",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 50,
  },

  kyctext: {
    fontFamily: "OtomanopeeOne",
    fontWeight: "600",
  },

  kycheader: {
    width: 300,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#000",
    borderWidth: 2,
    borderRadius: 18,
  },

  kycavatarContainer: {},

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

  kycavatar: {
    width: 290,
    height: 295,
    borderRadius: 15,
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

  kyceditIcon: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: -28,
    right: 112,
    backgroundColor: "#FDCF00",
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 50,
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
    backgroundColor: "#FDCF00",
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

  locationbox: {
    flexDirection: "row",
    gap: 3,
    justifyContent: "center",
    alignItems: "center",
  },

  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
  },

  input: {
    flex: 1,
    paddingVertical: 10,
  },

  icon: {
    marginRight: 8,
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

  kycupdateButton: {
    backgroundColor: "#FDCF00",
    width: "90%",
    height: 60,
    justifyContent: "center",
    borderRadius: 10,
    marginHorizontal: 20,
    alignItems: "center",
    marginTop: 50,
    marginBottom: 60,
  },

  resetbutton: {
    backgroundColor: "#FDCF00",
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    alignItems: "center",
    marginTop: 100,
    marginBottom: 20,
  },

  updateButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },

  addressList: {
    flexGrow: 1,
    justifyContent: "center",
  },

  addressCard: {
    width: 125,
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 3,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: "#000",
  },

  addressText: {
    alignItems: "center",
  },

  location: {
    fontSize: 14,
    color: "#777",
  },

  addButton: {
    marginTop: 10,
    marginLeft: 5,
  },

  managecontainer: {
    marginTop: 100,
    padding: 10,
  },

  manageheader: {
    alignItems: "center",
    marginBottom: 20,
  },

  manageline: {
    borderBottomColor: "#FDCF00", // Color of the line
    borderBottomWidth: 1,
    marginBottom: 30, // Thickness of the line
  },

  manageiconContainer: {
    backgroundColor: "#FFD700",
    padding: 20,
    borderRadius: 50,
  },

  manageicon: {
    width: 50,
    height: 50,
    tintColor: "#000",
  },

  managelabel: {
    fontFamily: "Nunito_500Medium",
    marginTop: 10,
    marginBottom: 5,
  },

  manageinput: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 15,
  },

  managelocationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  managelocationIcon: {
    position: "absolute",
    right: 10,
  },

  addCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000",
    shadowColor: "#FDCF00",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  addText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },

  changepasscontainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    padding: 10,
  },

  changepassinput: {
    width: responsiveWidth(92),
    height: responsiveHeight(8),
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "white",
    color: "#A1A1A1",
    borderWidth: 1,
    borderColor: "#000",
  },

  visibleIcon: {
    position: "absolute",
    right: 12,
    top: 24,
  },
});

export default EditProfileScreen;
