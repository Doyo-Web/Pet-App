import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Drawer } from "expo-router/drawer";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { DrawerContentComponentProps } from "@react-navigation/drawer"; // Type for drawer props
import { router, usePathname } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useUser from "@/hooks/auth/useUser";

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const pathname = usePathname();
  const { user } = useUser();

   const logoutHandler = async () => {
     await AsyncStorage.removeItem("access_token");
     await AsyncStorage.removeItem("refresh_token");
     router.push("/(routes)/login");
   };

  return (
    <DrawerContentScrollView {...props}>
      <TouchableOpacity
        style={styles.drawerarrowcontainer}
        onPress={() => props.navigation.closeDrawer()}
      >
        <AntDesign name="arrowleft" size={26} color="black" />
      </TouchableOpacity>

      <View style={styles.draweruserdetailscontainer}>
        {/* <Image source={require("@/assets/images/profilepic.png")} /> */}

        <View style={styles.avatarbox}>
          <Image
            style={styles.avatar}
            source={{
              uri: user?.avatar?.url
                ? user?.avatar?.url
                : "https://archive.org/download/placeholder-image/placeholder-image.jpg",
            }}
          />
        </View>

        <View style={styles.draweruserdetailsbox}>
          <Text style={styles.draweruserdetailstext}>{user?.fullname}</Text>
          <Text>{user?.phonenumber}</Text>
          <TouchableOpacity
            onPress={() => {
              router.push("/(tabs)/editprofile");
            }}
          >
            <Text style={styles.linkText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <DrawerItem
        icon={({ color, size }) => (
          <Image
            style={styles.drawericon}
            source={
              pathname == "/support"
                ? require("@/assets/icons/supportfill.png")
                : require("@/assets/icons/support.png")
            }
          />
        )}
        label={"Support"}
        labelStyle={[
          styles.navItemLabel,
          { color: pathname == "/support" ? "#F96247" : "rgba(0, 0, 0, 0.6)" },
        ]}
        onPress={() => {
          router.push("/(drawer)/support");
        }}
      />
      <DrawerItem
        icon={({ color, size }) => (
          <Image
            style={styles.drawericon}
            source={
              pathname == "/contactus"
                ? require("@/assets/icons/contactusfill.png")
                : require("@/assets/icons/contactus.png")
            }
          />
        )}
        label={"Contact Us"}
        labelStyle={[
          styles.navItemLabel,
          {
            color: pathname == "/contactus" ? "#F96247" : "rgba(0, 0, 0, 0.6)",
          },
        ]}
        onPress={() => {
          router.push("/(drawer)/contactus");
        }}
      />
      <DrawerItem
        icon={({ color, size }) => (
          <Image
            style={styles.drawericon}
            source={
              pathname == "/faq"
                ? require("@/assets/icons/faqfill.png")
                : require("@/assets/icons/faq.png")
            }
          />
        )}
        label={"FAQ"}
        labelStyle={[
          styles.navItemLabel,
          { color: pathname == "/faq" ? "#F96247" : "rgba(0, 0, 0, 0.6)" },
        ]}
        onPress={() => {
          router.push("/(drawer)/faq");
        }}
      />
      <DrawerItem
        icon={({ color, size }) => (
          <Image
            style={styles.drawericon}
            source={
              pathname == "/privacypolicy"
                ? require("@/assets/icons/privacypolicyfill.png")
                : require("@/assets/icons/privacypolicy.png")
            }
          />
        )}
        label={"Privacy Policy"}
        labelStyle={[
          styles.navItemLabel,
          {
            color:
              pathname == "/privacypolicy" ? "#F96247" : "rgba(0, 0, 0, 0.6)",
          },
        ]}
        onPress={() => {
          router.push("/(drawer)/privacypolicy");
        }}
      />
      <DrawerItem
        icon={({ color, size }) => (
          <Image
            style={styles.drawericon}
            source={
              pathname == "/termsandconditions"
                ? require("@/assets/icons/termsfill.png")
                : require("@/assets/icons/terms.png")
            }
          />
        )}
        label={"Terms and Conditions"}
        labelStyle={[
          styles.navItemLabel,
          {
            color:
              pathname == "/termsandconditions"
                ? "#F96247"
                : "rgba(0, 0, 0, 0.6)",
          },
        ]}
        onPress={() => {
          router.push("/(drawer)/termsandconditions");
        }}
      />
      <DrawerItem
        icon={({ color, size }) => (
          <Image
            style={styles.drawericon}
            source={
              pathname == "/deletemyaccount"
                ? require("@/assets/icons/deletefill.png")
                : require("@/assets/icons/delete.png")
            }
          />
        )}
        label={"Delete my Account"}
        labelStyle={[
          styles.navItemLabel,
          {
            color:
              pathname == "/deletemyaccount" ? "#F96247" : "rgba(0, 0, 0, 0.6)",
          },
        ]}
        onPress={() => {
          router.push("/(drawer)/deletemyaccount");
        }}
      />
      <DrawerItem
        icon={({ color, size }) => (
          <Image
            style={styles.drawericon}
            source={
              pathname == "/logout"
                ? require("@/assets/icons/logoutfill.png")
                : require("@/assets/icons/logout.png")
            }
          />
        )}
        label={"Log out"}
        labelStyle={[
          styles.navItemLabel,
          {
            color: pathname == "/logout" ? "#F96247" : "rgba(0, 0, 0, 0.6)",
          },
        ]}
        onPress={() => {
          logoutHandler();
        }}
      />

      <View style={styles.drawerfooter}>
        <Image source={require("@/assets/images/footerlogo.png")} />
        <Text style={styles.drawercopyright}>
          Copyright @ 2024 Doyo . All Rights Reserved
        </Text>
      </View>
    </DrawerContentScrollView>
  );
};

const Layout: React.FC = () => {
  const navigation = useNavigation();

  // Function to open the drawer
  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          width: "100%", // Full-screen drawer
        },

        headerTitle: "",

        headerTransparent: true,

        headerLeft: () => (
          <TouchableOpacity
            style={styles.customHamburgerContainer}
            onPress={openDrawer} // Open the drawer when pressed
          >
            <Image source={require("@/assets/icons/hamburger.png")} />
          </TouchableOpacity>
        ),

        headerRight: () => (
          <Image
            source={require("@/assets/images/header-logo.png")} // Replace with your logo image
            style={styles.headerLogo} // Style the logo
          />
        ),
      }}
    />
  );
};

export default Layout;

const styles = StyleSheet.create({
  headerLogo: {
    width: 80, // Set the width of the logo
    height: 80, // Set the height of the logo
    objectFit: "contain",
    marginRight: 15, // Add space on the right side
    marginTop: 20,
  },

  customHamburgerContainer: {
    width: 50,
    height: 50,
    borderRadius: 25, // Full circle
    backgroundColor: "rgba(249, 98, 71, 0.2)", // #F96247 with 20% opacity
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15, // Spacing from the left edge
    marginTop: 20,
  },

  drawericon: {
    width: 20,
    height: 20,
    objectFit: "contain",
  },

  drawerarrowcontainer: {
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: "#F96247",
    marginStart: 12,
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  draweruserdetailscontainer: {
    paddingVertical: 10,
    backgroundColor: "#fff",
    marginLeft: 20,
    width: "90%",
    borderRadius: 7,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 40,
    gap: 20,
    borderColor: "#000",
    paddingStart: 12,
    borderWidth: 1,
    shadowColor: "#F96247",
    shadowOffset: { width: 15, height: 15 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 10,
  },

  draweruserdetailsbox: {
    gap: 3,
  },

  draweruserdetailstext: {
    fontFamily: "OtomanopeeOne",
    fontSize: 22,
  },

  avatarbox: {
    width: 80,
    height: 80,
    objectFit: "cover",
    borderRadius: 50,
    borderColor: "#F96247",
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },

  avatar: {
    width: 50,
    height: 50,
  },

  linkText: {
    color: "#F96247",
    textDecorationLine: "underline",
  },

  navItemLabel: {
    marginLeft: -20,
    fontSize: 16,
    fontFamily: "OtomanopeeOne",
  },

  drawerfooter: {
    marginTop: 40,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  drawercopyright: {
    color: "rgba(0, 0, 0, 0.6)",
  },
});
