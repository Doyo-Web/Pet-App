import React, { useRef, useState } from "react";
import { AntDesign, FontAwesome } from "@expo/vector-icons"; // Ensure correct import for FontAwesome
import { useFonts } from "expo-font"; // Correct import
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ListRenderItemInfo,
  FlatList,
} from "react-native";
import Carousel from "react-native-reanimated-carousel"; // Ensure it's installed correctly
import Swiper from "react-native-swiper"; // Ensure this is installed via npm or yarn
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

const { width } = Dimensions.get("window");

interface CarouselItem {
  image: any; 
}

interface Testimonial {
  id: string;
  name: string;
  location: string;
  title: string;
  description: string;
  image: any;
}

const HomeScreen: React.FC = () => {

  const { user } = useUser();
  console.log(user);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const flatListRef = useRef<FlatList<Testimonial>>(null);

  const handleNext = () => {
    if (currentIndex < testimonials.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      // When reaching the last slide, go back to the first slide
      flatListRef.current?.scrollToIndex({ index: 0 });
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1 });
      setCurrentIndex(currentIndex - 1);
    } else {
      // When at the first slide, move to the last slide
      flatListRef.current?.scrollToIndex({ index: testimonials.length - 1 });
      setCurrentIndex(testimonials.length - 1);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };
 
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_700Bold,
    Nunito_600SemiBold,
    OtomanopeeOne: require("../../assets/fonts/OtomanopeeOne-Regular.ttf"), // Ensure correct font path
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"), // Ensure correct font path
  });

  
  if (!fontsLoaded) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#00d3a3" />
      </View>
    );
  }

  const carouselData: CarouselItem[] = [
    {
      image: require("@/assets/images/banner_1.png"),
    },
    {
      image: require("@/assets/images/banner_2.png"),
    },
    {
      image: require("@/assets/images/banner_3.png"),
    },
  ];

  const testimonials: Testimonial[] = [
    {
      id: "1",
      name: "Priya S",
      location: "Pet Parent, Mumbai",
      title: "Doyo Pets has truly changed the way I think about pet boarding!",
      description:
        "Leaving my furry baby behind used to be the most stressful part of traveling. But ever since I discovered Doyo Pets, it's been a breeze!  My dog, Max, absolutely loves his stays with his host, Sarah. She treats him like family, and I get regular photo updates that show how much fun he's having. It's such a relief knowing he's in good hands. Doyo Pets has truly changed the way I think about pet boarding!",
      image: require("@/assets/images/priya.png"),
    },
    {
      id: "2",
      name: "Rohit M",
      location: "Pet Parent, Pune",
      title: "Doyo Pets has truly changed the way I think about pet boarding!",
      description:
        "Leaving my furry baby behind used to be the most stressful part of traveling. But ever since I discovered Doyo Pets, it's been a breeze!  My dog, Max, absolutely loves his stays with his host, Sarah. She treats him like family, and I get regular photo updates that show how much fun he's having. It's such a relief knowing he's in good hands. Doyo Pets has truly changed the way I think about pet boarding!",
      image: require("@/assets/images/priya.png"),
    },
    {
      id: "3",
      name: "Anita R",
      location: "Pet Parent, Delhi",
      title: "Doyo Pets has truly changed the way I think about pet boarding!",
      description:
        "Leaving my furry baby behind used to be the most stressful part of traveling. But ever since I discovered Doyo Pets, it's been a breeze!  My dog, Max, absolutely loves his stays with his host, Sarah. She treats him like family, and I get regular photo updates that show how much fun he's having. It's such a relief knowing he's in good hands. Doyo Pets has truly changed the way I think about pet boarding!",
      image: require("@/assets/images/priya.png"),
    },
  ];


  const renderCarouselItem = (item: CarouselItem) => {
    return (
      <View style={styles.carouselItem}>
        <Image source={item.image} style={styles.carouselImage} />
      </View>
    );
  };

  const getBackgroundColor = (index: number) => {
    switch (index) {
      case 0:
        return "rgba(249, 98, 71, 0.8)"; // First card color
      case 1:
        return "rgba(253, 207, 0, 0.8)"; // Second card color
      case 2:
        return "rgba(0, 208, 195, 0.8)"; // Third card color
      default:
        return "rgba(249, 98, 71, 0.8)"; // Fallback color
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={{ flex: 1 }}>
        {/* Home page Shape */}
        <Image
          style={styles.homeshape}
          source={require("@/assets/images/homepageshape.png")}
        />


        <View style={styles.maincontent}>
          {/* Reanimated Carousel */}
          <Carousel
            loop
            width={width}
            height={300}
            autoPlay={true}
            data={carouselData}
            renderItem={({ item }) => renderCarouselItem(item)}
          />

          {/* Services */}
          <View style={styles.servicecontainer}>
            <Text style={styles.sectionTitle}>Services</Text>
            <View style={styles.iconupperbox}>
              <View style={styles.iconboxitem}>
                <Image
                  style={styles.icon}
                  source={require("@/assets/icons/Boarding.png")} // Ensure correct image path
                />
                <Text>Boarding</Text>
              </View>

              <View style={styles.iconboxitem}>
                <Image
                  style={styles.icon}
                  source={require("@/assets/icons/daycare.png")} // Ensure correct image path
                />
                <Text>Day Care</Text>
              </View>
            </View>
          </View>

          {/* Become a Host Card */}
          <View style={styles.card}>
            <Image
              style={styles.hostshape}
              source={require("@/assets/images/hostshape.png")}
            />

            {/* Left side text */}
            <View style={styles.textContainer}>
              <Text style={styles.title}>Become a host</Text>
              <Text style={styles.description}>
                Earn extra income and unlock new opportunities by sharing your
                space with love for pets.
              </Text>
              <TouchableOpacity style={styles.ctaButton}>
                <Text style={styles.ctaText}>Join our Community</Text>
              </TouchableOpacity>
            </View>

            {/* Right side image */}
            <View style={styles.imageContainer}>
              <Image
                source={require("@/assets/images/hostbannerimage.png")} // Ensure correct image path
                style={styles.image}
              />
            </View>
          </View>

          {/* Testimonial Section */}
          <View style={styles.testimonialcontainer}>
            <Text style={styles.testimonialTitle}>
              What our pet parents say
            </Text>
            <FlatList
              data={testimonials}
              ref={flatListRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              renderItem={({
                item,
                index,
              }: ListRenderItemInfo<Testimonial>) => (
                <View
                  style={[
                    styles.testimonialCard,
                    { backgroundColor: getBackgroundColor(index) }, // Applying different background colors
                  ]}
                >
                  <View style={styles.userprofilebox}>
                    <Image source={item.image} style={styles.image} />
                    <View>
                      <Text style={styles.name}>{item.name}</Text>
                      <Text style={styles.location}>{item.location}</Text>
                      <View style={styles.starbox}>
                        <Image
                          style={styles.star}
                          source={require("@/assets/icons/star.png")}
                        />
                        <Image
                          style={styles.star}
                          source={require("@/assets/icons/star.png")}
                        />
                        <Image
                          style={styles.star}
                          source={require("@/assets/icons/star.png")}
                        />
                        <Image
                          style={styles.star}
                          source={require("@/assets/icons/star.png")}
                        />
                        <Image
                          style={styles.star}
                          source={require("@/assets/icons/star.png")}
                        />
                      </View>
                    </View>
                  </View>

                  <Text style={styles.testimonialText}>"{item.title}"</Text>
                  <Text style={styles.testimonialdescription}>
                    {item.description}
                  </Text>
                </View>
              )}
              keyExtractor={(item) => item.id}
            />

            <View style={styles.arrowsContainer}>
              <TouchableOpacity
                onPress={handlePrev}
                disabled={currentIndex === 0}
                style={styles.arrowButton}
              >
                <Text style={styles.arrowText}>
                  <AntDesign name="arrowleft" size={24} color="#fff" />
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleNext}
                disabled={currentIndex === testimonials.length - 1}
                style={styles.arrowButton}
              >
                <Text style={styles.arrowText}>
                  <AntDesign name="arrowright" size={24} color="#fff" />
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Testimonial Section */}

          {/* How it works Section */}
          <View style={styles.howcontainer}>
            <Text style={styles.howtitle}>How it works ?</Text>
            <View style={styles.howitsiconlistcontainer}>
              {/* First Icon */}
              <View style={styles.howcontainerbox}>
                <View style={styles.howiconContainer}>
                  <Image
                    source={require("@/assets/icons/book.png")} // Replace with your local path
                    style={styles.howicon}
                  />
                </View>

                <View style={styles.howcontainertext}>
                  <Text style={styles.howitstitletext}>Book</Text>
                  <Text style={styles.howitstitledesc}>
                    Borem ipsum dolor sit amet, consectetur adipiscing elit.
                  </Text>
                </View>
              </View>
              {/* Dotted Line */}
              <Svg height="2" width={width / 10} style={styles.dottedLine}>
                <Line
                  x1="0"
                  y1="0"
                  x2={width / 3}
                  y2="0"
                  stroke="orange"
                  strokeWidth="2"
                  strokeDasharray="4,4" // Makes the line dotted
                />
              </Svg>

              {/* Second Icon */}
              <View style={styles.howcontainerbox}>
                <View style={styles.howiconContainer}>
                  <Image
                    source={require("@/assets/icons/match.png")} // Replace with your local path
                    style={styles.howicon}
                  />
                </View>

                <View style={styles.howcontainertext}>
                  <Text style={styles.howitstitletext}>Match</Text>
                  <Text style={styles.howitstitledesc}>
                    Borem ipsum dolor sit amet, consectetur adipiscing elit.
                  </Text>
                </View>
              </View>
              {/* Dotted Line */}
              <Svg height="2" width={width / 10} style={styles.dottedLine}>
                <Line
                  x1="0"
                  y1="0"
                  x2={width / 3}
                  y2="0"
                  stroke="orange"
                  strokeWidth="2"
                  strokeDasharray="4,4" // Makes the line dotted
                />
              </Svg>

              {/* Third Icon */}
              <View style={styles.howcontainerbox}>
                <View style={styles.howiconContainer}>
                  <Image
                    source={require("@/assets/icons/relax.png")} // Replace with your local path
                    style={styles.howicon}
                  />
                </View>

                <View style={styles.howcontainertext}>
                  <Text style={styles.howitstitletext}>Relax</Text>
                  <Text style={styles.howitstitledesc}>
                    Borem ipsum dolor sit amet, consectetur adipiscing elit.
                  </Text>
                </View>
              </View>
            </View>
          </View>
          {/* How it works Section */}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1, // This ensures the content grows and allows scrolling
    paddingBottom: 140, // Padding at the bottom to avoid clipping
  },

  maincontent: {
    marginTop: 120,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  homeshape: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  header: {
    position: "absolute", // Fixes the header in place
    top: 0, // Aligns the header to the top of the screen
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    zIndex: 1,
  },
  iconbox: {
    justifyContent: "center",
    alignItems: "center",
    width: 52,
    height: 52,
    borderRadius: 50,
    backgroundColor: "rgba(249, 98, 71, 0.2)",
  },
  icon: {
    zIndex: 999,
  },
  carouselItem: {
    alignItems: "center",
  },
  carouselImage: {
    width: wp("95%"),
    height: hp("30%"),
    resizeMode: "cover",
  },
  sectionTitle: {
    fontSize: hp("2.3%"),
    fontFamily: "OtomanopeeOne",
    marginVertical: 20,
    paddingLeft: 20,
  },
  servicecontainer: {
    paddingHorizontal: 10,
    marginTop: -45,
  },
  iconupperbox: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 10,
    gap: 25,
  },
  iconboxitem: {
    gap: 5,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 208, 195, 0.2)",
    borderRadius: 12,
    padding: 20,
    justifyContent: "space-between",
    alignItems: "center",
    margin: 20,
  },

  hostshape: {
    position: "absolute",
    top: 0,
    right: 0,
  },

  textContainer: {
    flex: 1,
    paddingRight: 20,
  },
  title: {
    fontSize: hp("2.6%"),
    color: "#000",
    fontFamily: "Nunito_700Bold",
  },
  description: {
    fontSize: hp("2%"),
    color: "#000",
    marginVertical: 10,
    fontFamily: "Nunito_400Regular",
  },

  ctaButton: {
    width: responsiveWidth(60),
    paddingVertical: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00D0C3",
    borderRadius: 10,
    marginTop: 10,
  },

  ctaText: {
    fontSize: hp("2%"),
    color: "#fff",
    fontFamily: "OtomanopeeOne",
  },
  imageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  testimonialcontainer: {
    height: 600,
    flex: 1,
    justifyContent: "center",
  },

  testimonialTitle: {
    fontSize: hp("2.5%"),
    fontFamily: "OtomanopeeOne",
    marginVertical: 20,
    paddingLeft: 20,
  },

  testimonialCard: {
    width: responsiveWidth(90),
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f04f47",
    borderRadius: 10,
    marginStart: 22,
    marginEnd: 18,
    color: "white",
  },

  userprofilebox: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginBottom: 20,
  },

  image: {
    width: responsiveWidth(30),
    height: responsiveHeight(15),
    borderRadius: 10,
  },
  name: {
    fontSize: hp("2.2%"),
    fontWeight: "bold",
    color: "white",
  },
  location: {
    fontSize: hp("1.8%"),
    color: "white",
    marginBottom: 10,
  },

  starbox: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#fff",
    padding: 5,
    borderRadius: 5,
  },

  star: {
    width: 18,
    height: 18,
  },

  testimonialText: {
    fontSize: hp("2.2%"),
    color: "white",
    fontFamily: "OtomanopeeOne",
    marginBottom: 5,
    lineHeight: 24,
  },

  testimonialdescription: {
    fontSize: hp("1.9%"),
    color: "white",
    fontFamily: "Nunito_500Medium",
  },

  arrowsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    position: "absolute",
    bottom: 20,
    paddingHorizontal: 20,
  },
  arrowButton: {
    padding: 10,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 30,
  },
  arrowText: {
    fontSize: 24,
    color: "#fff",
  },

  howitsiconlistcontainer: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },

  howcontainer: {
    flex: 1,
    justifyContent: "center",
    marginVertical: 20,
    paddingHorizontal: 20,
  },

  howcontainertext: {
    width: 100,
    justifyContent: "center",
    alignItems: "center",
  },

  howitstitletext: {
    fontFamily: "Nunito_700Bold",
  },

  howitstitledesc: {
    textAlign: "center",
    fontFamily: "Nunito_400Regular",
  },

  howtitle: {
    fontSize: hp("2.5%"),
    color: "#000",
    fontFamily: "OtomanopeeOne",
    marginBottom: 20, // Increased margin for better spacing
    textAlign: "center", // Center the title
  },

  howcontainerbox: {
    alignItems: "center",
    justifyContent: "center",
  },

  howiconContainer: {
    width: responsiveWidth(18),
    height: responsiveHeight(9),
    borderRadius: 50,
    borderColor: "#000",
    borderWidth: 1,
    backgroundColor: "#F96247", // Orange background
    justifyContent: "center",
    alignItems: "center",
  },

  howicon: {
    width: responsiveWidth(20), // Adjust based on your image size
    height: responsiveHeight(3), // Adjust based on your image size
    objectFit: "contain",
  },

  dottedLine: {
    marginBottom: 80,
  },
});

export default HomeScreen;
