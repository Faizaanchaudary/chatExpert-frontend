import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  View,
  Dimensions,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import moment from "moment";

const { height } = Dimensions.get("window");
const PAGE_HEIGHT = height - 240; // Same as in A4ChatViewer
const MIN_SPACE_REQUIRED = 150; // Same as in A4ChatViewer

interface MessageMeasurerProps {
  messages: any[];
  onMeasured: (pages: any[][]) => void;
}

interface ChatBubbleProps {
  message: any;
  onMeasure?: (height: number) => void;
  indexOfPage?: number;
}

const MessageMeasurer: React.FC<MessageMeasurerProps> = ({
  messages,
  onMeasured,
}) => {
  const [measuredMessages, setMeasuredMessages] = useState<any[]>([]);
  const [pendingMeasurements, setPendingMeasurements] = useState(
    messages.length
  );

  useEffect(() => {
    // Reset measurements when messages change
    setMeasuredMessages([]);
    setPendingMeasurements(messages.length);
  }, [messages]);

  const handleMeasure = (index: number, height: number) => {
    setMeasuredMessages((prev) => {
      const newMeasured = [...prev];
      newMeasured[index] = { ...messages[index], height };
      return newMeasured;
    });
    setPendingMeasurements((prev) => prev - 1);
  };

  useEffect(() => {
    if (
      pendingMeasurements === 0 &&
      measuredMessages.length === messages.length
    ) {
      console.log(
        "Starting pagination with messages:",
        measuredMessages.length
      );
      // All messages have been measured, now paginate
      let currentPage: any[] = [];
      let currentHeight = 0;
      let allPages: any[][] = [];

      measuredMessages.forEach((message, index) => {
        console.log(`Processing message ${index}, height: ${message.height}`);
        // Check if this is an empty page marker
        if (message.isEmpty) {
          if (currentPage.length > 0) {
            console.log("Adding page with", currentPage.length, "messages");
            allPages.push([...currentPage]);
            currentPage = [];
            currentHeight = 0;
          }
          console.log("Adding empty page marker");
          allPages.push([message]);
          currentPage = [];
          currentHeight = 0;
          return;
        }

        // Normal message handling
        if (currentHeight + message.height + MIN_SPACE_REQUIRED > PAGE_HEIGHT) {
          console.log(
            "Page full, adding page with",
            currentPage.length,
            "messages"
          );
          allPages.push([...currentPage]);
          currentPage = [];
          currentHeight = 0;
        }
        currentPage.push(message);
        currentHeight += message.height;
      });

      if (currentPage.length > 0) {
        console.log("Adding final page with", currentPage.length, "messages");
        allPages.push([...currentPage]);
      }

      console.log("Total pages created:", allPages.length);
      onMeasured(allPages);
    }
  }, [measuredMessages, pendingMeasurements, messages.length, onMeasured]);

  const ChatBubble: React.FC<ChatBubbleProps> = ({
    message,
    onMeasure,
    indexOfPage,
  }) => {
    const navigation = useNavigation();

    const isImage = (path: string | undefined): boolean => {
      if (!path || typeof path !== "string") return false;

      // Common image extensions
      const imageExtensions = [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "bmp",
        "webp",
        "svg",
        "heic",
        "heif",
      ];

      // Extract extension from path
      const extension = path.split(".").pop()?.toLowerCase();
      if (!extension) return false;

      return imageExtensions.includes(extension);
    };

    if (
      message?.type === "toptext" ||
      message?.type === "middleimage" ||
      message?.type === "bottomtext"
    ) {
      return (
        <View
          style={{
            justifyContent: "space-evenly",
            alignContent: "space-between",
          }}
        >
          {message?.type === "toptext" && (
            <Pressable
              style={{
                width: "100%",
                height: 20,
                borderWidth: 1,
                borderStyle: "dotted",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: message.item?.sender
                    ? message?.senderTextColor
                    : message?.receiverTextColor
                    ? message?.receiverTextColor
                    : "black",
                  fontSize: message?.fontSize,
                  fontWeight: message?.fontStyle === "bold" ? "bold" : "normal",
                  fontStyle:
                    message?.fontStyle === "italic" ? "italic" : "normal",
                  fontFamily: message?.fontFamily,
                  textDecorationLine:
                    message?.fontStyle === "underline" ? "underline" : "none",
                }}
              >
                {message?.topText ? message?.topText : "+"}
              </Text>
            </Pressable>
          )}

          {message?.type === "middleimage" && (
            <Pressable
              style={{
                width: "100%",
                height: 200,
                borderWidth: !message?.middleimage ? 1 : 0,
                borderStyle: "dotted",
                alignItems: "center",
                justifyContent: "center",
                marginVertical: 80,
              }}
            >
              {!message?.middleimage ? (
                <Text
                  style={{
                    color: message.item?.sender
                      ? message?.senderTextColor
                      : message?.receiverTextColor
                      ? message?.receiverTextColor
                      : "black",
                    fontSize: message?.fontSize,
                    fontWeight:
                      message?.fontStyle === "bold" ? "bold" : "normal",
                    fontStyle:
                      message?.fontStyle === "italic" ? "italic" : "normal",
                    fontFamily: message?.fontFamily,
                    textDecorationLine:
                      message?.fontStyle === "underline" ? "underline" : "none",
                  }}
                >
                  {message?.middleimage ? message?.middleimage : "+"}
                </Text>
              ) : (
                <Image
                  source={{ uri: message?.middleimage }}
                  style={{ width: "100%", height: 200 }}
                  resizeMode="stretch"
                />
              )}
            </Pressable>
          )}

          {message?.type === "bottomtext" && (
            <Pressable
              style={{
                width: "100%",
                height: 20,
                borderWidth: 1,
                borderStyle: "dotted",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: message.item?.sender
                    ? message?.senderTextColor
                    : message?.receiverTextColor
                    ? message?.receiverTextColor
                    : "black",
                  fontSize: message?.fontSize,
                  fontWeight: message?.fontStyle === "bold" ? "bold" : "normal",
                  fontStyle:
                    message?.fontStyle === "italic" ? "italic" : "normal",
                  fontFamily: message?.fontFamily,
                  textDecorationLine:
                    message?.fontStyle === "underline" ? "underline" : "none",
                }}
              >
                {message?.bottomtext ? message?.bottomtext : "+"}
              </Text>
            </Pressable>
          )}
        </View>
      );
    }

    return (
      <Pressable
        onLayout={(event) => {
          if (onMeasure) {
            onMeasure(event.nativeEvent.layout.height);
          }
        }}
      >
        <Text
          style={{
            color: message.item?.sender
              ? message?.senderTextColor
              : message?.receiverTextColor,
            fontSize: message?.fontSize,
            fontWeight: message?.fontStyle === "bold" ? "bold" : "normal",
            fontStyle: message?.fontStyle === "italic" ? "italic" : "normal",
            fontFamily: message?.fontFamily,
            textDecorationLine:
              message?.fontStyle === "underline" ? "underline" : "none",
            alignSelf: message.item?.sender ? "flex-end" : "flex-start",
          }}
        >
          {message.item?.senderName
            ? message.item?.senderName
            : message.item?.receiverName}{" "}
          {"  "}{" "}
          {moment(message?.item?.sendingTime, "DD/MM/YYYY, h:mm:ss A").format(
            "hh:mm A"
          )}
        </Text>
        <View
          style={{
            backgroundColor: message.item?.path
              ? "white"
              : message.item?.sender
              ? message?.senderBackground
              : message?.receiverBackground,
            padding: 10,
            marginVertical: 5,
            borderRadius: 10,
            alignSelf: message.item?.sender ? "flex-end" : "flex-start",
          }}
        >
          {!message.item?.path ? (
            <Text
              style={{
                color: message.item?.sender
                  ? message?.senderTextColor
                  : message?.receiverTextColor,
                fontSize: message?.fontSize,
                fontWeight: message?.fontStyle === "bold" ? "bold" : "normal",
                fontStyle:
                  message?.fontStyle === "italic" ? "italic" : "normal",
                fontFamily: message?.fontFamily,
                textDecorationLine:
                  message?.fontStyle === "underline" ? "underline" : "none",
              }}
            >
              {message.item?.text || message?.text}
            </Text>
          ) : (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              {isImage(message?.item?.path) ? (
                <Image
                  style={{ width: 100, height: 100 }}
                  source={{ uri: message?.item?.path }}
                />
              ) : null}
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={{ position: "absolute", left: -9999, width: "100%" }}>
      {messages.map((message, index) => (
        <View
          key={message.id || index}
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            handleMeasure(index, height);
          }}
        >
          <ChatBubble
            message={message}
            onMeasure={(height) => handleMeasure(index, height)}
            indexOfPage={index}
          />
          <ActivityIndicator style={{ position: "absolute" }} />
        </View>
      ))}
    </View>
  );
};

export default MessageMeasurer;
