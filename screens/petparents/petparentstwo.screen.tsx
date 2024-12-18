import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { Calendar } from "react-native-calendars";

type TabType = "completed" | "upcoming";

const BOOKING_DATA = {
  completed: [
    { id: 1, date: "19/1 - 24/1", petName: "Mojito", type: "Pet Boarding" },
    { id: 2, date: "19/1 - 24/1", petName: "Mojito", type: "Pet Boarding" },
    { id: 3, date: "19/1 - 24/1", petName: "Mojito", type: "Pet Boarding" },
    { id: 4, date: "19/1 - 24/1", petName: "Mojito", type: "Pet Boarding" },
    { id: 5, date: "19/1 - 24/1", petName: "Mojito", type: "Pet Boarding" },
  ],
  upcoming: [
    {
      id: 6,
      startDate: "2023-01-19",
      endDate: "2023-01-24",
      petName: "Mojito",
      type: "Pet Boarding",
    },
    {
      id: 7,
      startDate: "2023-01-19",
      endDate: "2023-01-24",
      petName: "Mojito",
      type: "Pet Boarding",
    },
  ],
};

const screenWidth = Dimensions.get("window").width;

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("completed");

  const renderBookingItem = (
    item:
      | (typeof BOOKING_DATA.completed)[0]
      | (typeof BOOKING_DATA.upcoming)[0],
    status: TabType
  ) => (
    <View key={item.id} style={styles.bookingItem}>
      <View style={styles.yellowStrip} />
      <View style={styles.bookingContent}>
        <Image
          source={{ uri: "https://placekitten.com/100/100" }}
          style={styles.petImage}
        />
        <View style={styles.bookingInfo}>
          <View style={styles.dateRow}>
            <View style={styles.calendarIcon}>
              <Text>📅</Text>
            </View>
            <Text style={styles.dateText}>
              {"startDate" in item
                ? `${item.startDate.split("-")[2]}/${
                    item.startDate.split("-")[1]
                  } - ${item.endDate.split("-")[2]}/${
                    item.endDate.split("-")[1]
                  }`
                : item.date}
            </Text>
          </View>
          <Text style={styles.petName}>{item.petName}</Text>
          <View style={styles.bottomRow}>
            <Text style={styles.bookingType}>{item.type}</Text>
            <Text
              style={[
                styles.status,
                { color: status === "completed" ? "#4CAF50" : "#FF5252" },
              ]}
            >
              {status === "completed" ? "Completed" : "Upcoming"}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsText}>View Details {">"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCalendar = () => {
    const markedDates: {
      [key: string]: {
        startingDay?: boolean;
        endingDay?: boolean;
        color: string;
      };
    } = {};
    BOOKING_DATA.upcoming.forEach((booking) => {
      markedDates[booking.startDate] = { startingDay: true, color: "#FFD700" };
      markedDates[booking.endDate] = { endingDay: true, color: "#FFD700" };

      // Mark dates in between
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      for (
        let d = new Date(start.getTime() + 86400000);
        d < end;
        d.setDate(d.getDate() + 1)
      ) {
        const dateString = d.toISOString().split("T")[0];
        if (!markedDates[dateString]) {
          markedDates[dateString] = { color: "#FFD700" };
        }
      }
    });

    return (
      <Calendar
        style={styles.calendar}
        theme={{
          backgroundColor: "#FFF8E1",
          calendarBackground: "#FFF8E1",
          textSectionTitleColor: "#666",
          selectedDayBackgroundColor: "#FFD700",
          selectedDayTextColor: "#000000",
          todayTextColor: "#FFD700",
          dayTextColor: "#2d4150",
          textDisabledColor: "#d9e1e8",
          dotColor: "#FFD700",
          selectedDotColor: "#ffffff",
          arrowColor: "#FFD700",
          monthTextColor: "#000000",
          textDayFontFamily: "monospace",
          textMonthFontFamily: "monospace",
          textDayHeaderFontFamily: "monospace",
          textDayFontWeight: "300",
          textMonthFontWeight: "bold",
          textDayHeaderFontWeight: "300",
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 16,
        }}
        markingType={"period"}
        markedDates={markedDates}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <View style={styles.backButtonCircle}>
            <ArrowLeft color="#000" size={24} />
          </View>
        </TouchableOpacity>
        <Text style={styles.title}>My Bookings</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "completed" && styles.activeTab]}
          onPress={() => setActiveTab("completed")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "completed" && styles.activeTabText,
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
          onPress={() => setActiveTab("upcoming")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "upcoming" && styles.activeTabText,
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === "upcoming" && renderCalendar()}
        {activeTab === "completed" &&
          BOOKING_DATA.completed.map((item) =>
            renderBookingItem(item, "completed")
          )}
        {activeTab === "upcoming" &&
          BOOKING_DATA.upcoming.map((item) =>
            renderBookingItem(item, "upcoming")
          )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 16,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: "#FFD700",
  },
  tabText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
  activeTabText: {
    color: "#000",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  calendar: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  bookingItem: {
    flexDirection: "row",
    marginBottom: 16,
    marginHorizontal: 16,
    backgroundColor: "#fff",
  },
  yellowStrip: {
    width: 4,
    backgroundColor: "#FFD700",
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  bookingContent: {
    flex: 1,
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  calendarIcon: {
    marginRight: 4,
  },
  dateText: {
    fontSize: 14,
    color: "#666",
  },
  petName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bookingType: {
    fontSize: 14,
    color: "#666",
  },
  status: {
    fontSize: 14,
    fontWeight: "500",
  },
  detailsButton: {
    justifyContent: "center",
  },
  detailsText: {
    color: "#666",
    fontSize: 12,
  },
});
