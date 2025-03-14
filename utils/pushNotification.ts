import { Expo } from "expo-server-sdk";
import userModel from "../models/user.model";

// Create an Expo SDK client
const expo = new Expo();

export const sendPushNotification = async (
  pushToken: string,
  title: string,
  body: string,
  data?: { [key: string]: any }
) => {
  try {
    // Check if the token is valid
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      return false;
    }

    const message = {
      to: pushToken,
      sound: "default" as const,
      title,
      body,
      data: data || {},
    };

    const receipts = await expo.sendPushNotificationsAsync([message]);
    console.log(
      `Push notification sent successfully to ${pushToken}`,
      receipts
    );
    return true;
  } catch (error) {
    console.error(`Error sending push notification to ${pushToken}:`, error);
    return false;
  }
};

// Function to notify user of a new message
export const notifyNewMessage = async (
  userId: string,
  senderName: string,
  messageContent: string
) => {
  try {
    const user = await userModel.findById(userId);
    if (!user || !user.pushToken) {
      console.log(`No push token found for user ${userId}`);
      return;
    }

    const title = `New Message from ${senderName}`;
    const body =
      messageContent.length > 100
        ? `${messageContent.substring(0, 97)}...`
        : messageContent;

    await sendPushNotification(user.pushToken, title, body, {
      senderId: userId,
    });
  } catch (error) {
    console.error(`Error notifying user ${userId}:`, error);
  }
};
