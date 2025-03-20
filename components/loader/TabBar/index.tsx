import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

type IconProps = {
  color: string;
};

type IconsType = {
  [key: string]: (props: IconProps) => JSX.Element;
};

interface ExtendedTabBarProps extends BottomTabBarProps {
  checkHostStatus: () => Promise<boolean>;
}

export function TabBar({
  state,
  descriptors,
  navigation,
  checkHostStatus,
}: ExtendedTabBarProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(state.index);

  // Update selectedIndex when the route changes
  useEffect(() => {
    setSelectedIndex(state.index);
  }, [state.index]);

  const icons: IconsType = {
    index: (props: IconProps) => (
      <Image
        source={
          selectedIndex === 0
            ? require("@/assets/icons/homeicon_filled.png")
            : require("@/assets/icons/homeicon.png")
        }
        style={{ width: 24, height: 24, tintColor: props.color }}
        resizeMode="contain"
      />
    ),
    "host/index": (props: IconProps) => (
      <Image
        source={
          selectedIndex === 1
            ? require("@/assets/icons/hosticon_filled.png")
            : require("@/assets/icons/hosticon.png")
        }
        style={{ width: 24, height: 24, tintColor: props.color }}
        resizeMode="contain"
      />
    ),
    "booknow/index": (props: IconProps) => (
      <Image
        source={
          selectedIndex === 2
            ? require("@/assets/icons/booknowicon.png")
            : require("@/assets/icons/booknowicon_filled.png")
        }
        style={{ width: 24, height: 24, tintColor: props.color }}
        resizeMode="contain"
      />
    ),
    "chat/index": (props: IconProps) => (
      <Image
        source={
          selectedIndex === 3
            ? require("@/assets/icons/chaticon_filled.png")
            : require("@/assets/icons/chaticon.png")
        }
        style={{ width: 24, height: 24, tintColor: props.color }}
        resizeMode="contain"
      />
    ),
    "petparents/index": (props: IconProps) => (
      <Image
        source={
          selectedIndex === 4
            ? require("@/assets/icons/profileicon_filled.png")
            : require("@/assets/icons/profileicon.png")
        }
        style={{ width: 24, height: 24, tintColor: props.color }}
        resizeMode="contain"
      />
    ),
  };

  return (
    <View style={styles.tabbar}>
      <View style={styles.tabbarItembox}>
        {state.routes
          .filter(
            (route) =>
              route.name !== "editprofile/index" &&
              route.name !== "hostsuccess/index" &&
              route.name !== "profilesuccess/index" &&
              route.name !== "hostsuccess copy/index" &&
              route.name !== "booknow/booknowtwo" &&
              route.name !== "booknow/booknowthree" &&
              route.name !== "booknow/booknowfour" &&
              route.name !== "booknow/booknowsuccess" &&
              route.name !== "profile/index" &&
              route.name !== "petparents/petparentstwo" &&
              route.name !== "petparents/petparentsthree" &&
              route.name !== "hostprofile/index" &&
              route.name !== "hostprofile/hostprofiletwo" &&
              route.name !== "hostprofile/hostprofilethree" &&
              route.name !== "hostprofile/hostprofilefour" &&
              route.name !== "hostprofile/hostprofilefive" &&
              route.name !== "chat/chattwo" &&
              route.name !== "wallet/wallet" &&
              route.name !== "wallet/withdraw" &&
              route.name !== "wallet/withdrawals" &&
              route.name !== "wallet/transactions"
          )
          .map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? (options.tabBarLabel as string)
                : options.title !== undefined
                ? (options.title as string)
                : route.name;

            const isFocused = state.index === index;

            const onPress = async () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                if (route.name === "host/index") {
                  const isHost = await checkHostStatus();
                  if (isHost) {
                    router.push("/(drawer)/(tabs)/hostprofile");
                  } else {
                    navigation.navigate(route.name, route.params);
                  }
                } else {
                  navigation.navigate(route.name, route.params);
                }
              }
              setSelectedIndex(index);
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            const IconComponent = icons[route.name];
            const customIconStyle =
              route.name === "booknow/index" ? styles.bookNowIcon : {};

            return (
              <View key={route.name} style={styles.tabbarItem}>
                <View
                  style={[
                    styles.iconContainer,
                    customIconStyle,
                    route.name === "booknow/index" && styles.bookNowFocused,
                  ]}
                >
                  <TouchableOpacity
                    onPress={onPress}
                    accessibilityRole="button"
                    accessibilityState={isFocused ? { selected: true } : {}}
                    accessibilityLabel={options.tabBarAccessibilityLabel}
                    testID={options.tabBarTestID}
                    onLongPress={onLongPress}
                    style={styles.iconTouchable}
                  >
                    <View
                      style={
                        route.name === "booknow/index"
                          ? styles.innerBlackBorder
                          : null
                      }
                    >
                      {IconComponent ? (
                        <IconComponent color={isFocused ? "#fff" : "#fff"} />
                      ) : (
                        <Feather name="alert-circle" size={24} color="#fff" />
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
                <Text
                  style={{
                    color: isFocused ? "#fff" : "#fff",
                    fontSize: 10,
                    marginTop: route.name === "booknow/index" ? 58 : 10,
                  }}
                >
                  {label}
                </Text>
                {selectedIndex === index && <View style={styles.halfCircle} />}
              </View>
            );
          })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabbar: {
    height: 110,
    width: "100%",
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
  },
  tabbarItembox: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: "75%",
    width: "95%",
    backgroundColor: "#F96247",
    paddingBottom: 20,
    paddingHorizontal: 10,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
    borderWidth: 3,
    borderColor: "#20232a",
  },
  tabbarItem: {
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    borderRadius: 100,
    marginBottom: -20,
  },
  iconTouchable: {
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    height: 70,
    borderRadius: 100,
  },
  bookNowIcon: {
    position: "absolute",
    bottom: 30,
    marginBottom: 0,
  },
  bookNowFocused: {
    backgroundColor: "#F96247",
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  innerBlackBorder: {
    backgroundColor: "#F96247",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  halfCircle: {
    position: "absolute",
    bottom: -13,
    width: 20,
    height: 10,
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    zIndex: -1,
  },
});
