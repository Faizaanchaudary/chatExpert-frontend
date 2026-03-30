import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { hp, wp } from "../../utils/reponsiveness";
import ChatViewer from "../A4ChatViewer";

// Sample messages for demonstration
const sampleMessages = [
  {
    id: "1",
    item: {
      sender: true,
      senderName: "John",
      text: "Hello! How are you doing today?",
      sendingTime: "10:30 AM",
    },
    fontSize: 14,
    fontFamily: "Roboto-Medium",
    senderTextColor: "#000",
    senderBackground: "#E3F2FD",
  },
  {
    id: "2",
    item: {
      sender: false,
      receiverName: "Alice",
      text: "I'm doing great! Just finished a long project at work. How about you?",
      sendingTime: "10:32 AM",
    },
    fontSize: 14,
    fontFamily: "Roboto-Medium",
    receiverTextColor: "#000",
    receiverBackground: "#F1F8E9",
  },
  {
    id: "3",
    item: {
      sender: true,
      senderName: "John",
      text: "That's awesome! I've been working on some new features for our app. The AI pagination system is really coming together nicely.",
      sendingTime: "10:35 AM",
    },
    fontSize: 14,
    fontFamily: "Roboto-Medium",
    senderTextColor: "#000",
    senderBackground: "#E3F2FD",
  },
  {
    id: "4",
    item: {
      sender: false,
      receiverName: "Alice",
      text: "AI pagination sounds interesting! How does it work?",
      sendingTime: "10:37 AM",
    },
    fontSize: 14,
    fontFamily: "Roboto-Medium",
    receiverTextColor: "#000",
    receiverBackground: "#F1F8E9",
  },
  {
    id: "5",
    item: {
      sender: true,
      senderName: "John",
      text: "It analyzes the content of messages and automatically distributes them across pages based on device specifications, content size, and readability best practices. The AI considers factors like message length, media content, and optimal page fill ratios to create balanced pages.",
      sendingTime: "10:40 AM",
    },
    fontSize: 14,
    fontFamily: "Roboto-Medium",
    senderTextColor: "#000",
    senderBackground: "#E3F2FD",
  },
  {
    id: "6",
    item: {
      sender: false,
      receiverName: "Alice",
      text: "That sounds really smart! Can users customize the pagination settings?",
      sendingTime: "10:42 AM",
    },
    fontSize: 14,
    fontFamily: "Roboto-Medium",
    receiverTextColor: "#000",
    receiverBackground: "#F1F8E9",
  },
  {
    id: "7",
    item: {
      sender: true,
      senderName: "John",
      text: "Absolutely! Users can adjust target page fill ratios, minimum and maximum messages per page, enable/disable long message splitting, and prioritize balance vs density. The AI provides real-time previews and recommendations.",
      sendingTime: "10:45 AM",
    },
    fontSize: 14,
    fontFamily: "Roboto-Medium",
    senderTextColor: "#000",
    senderBackground: "#E3F2FD",
  },
  {
    id: "8",
    item: {
      sender: false,
      receiverName: "Alice",
      text: "Wow, that's comprehensive! I'd love to try it out.",
      sendingTime: "10:47 AM",
    },
    fontSize: 14,
    fontFamily: "Roboto-Medium",
    receiverTextColor: "#000",
    receiverBackground: "#F1F8E9",
  },
];

const AIPaginationDemo: React.FC = () => {
  const chatViewerRef = useRef<any>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [currentMessages, setCurrentMessages] = useState(sampleMessages);

  const bookSpecs = {
    title: "Standard Book",
    // Add other book specifications as needed
  };

  const handleReturnPages = (newPages: any[]) => {
    setPages(newPages);
    console.log("Pages updated:", newPages.length);
  };

  const handleReturnChat = (chat: any[]) => {
    console.log("Chat updated:", chat.length);
  };

  const triggerAIPagination = () => {
    if (chatViewerRef.current) {
      chatViewerRef.current.showAIPagination();
    }
  };

  const addMoreMessages = () => {
    const additionalMessages = [
      {
        id: `${Date.now()}_1`,
        item: {
          sender: true,
          senderName: "John",
          text: "Here are some additional messages to test the AI pagination with more content.",
          sendingTime: "11:00 AM",
        },
        fontSize: 14,
        fontFamily: "Roboto-Medium",
        senderTextColor: "#000",
        senderBackground: "#E3F2FD",
      },
      {
        id: `${Date.now()}_2`,
        item: {
          sender: false,
          receiverName: "Alice",
          text: "Perfect! This will help us see how the AI handles larger conversations and optimizes the page distribution.",
          sendingTime: "11:02 AM",
        },
        fontSize: 14,
        fontFamily: "Roboto-Medium",
        receiverTextColor: "#000",
        receiverBackground: "#F1F8E9",
      },
      {
        id: `${Date.now()}_3`,
        item: {
          sender: true,
          senderName: "John",
          text: 'The AI should automatically adjust the pagination strategy based on the content characteristics. It might use a "bulk" strategy for many messages or "large_content" strategy for longer messages.',
          sendingTime: "11:05 AM",
        },
        fontSize: 14,
        fontFamily: "Roboto-Medium",
        senderTextColor: "#000",
        senderBackground: "#E3F2FD",
      },
    ];

    setCurrentMessages((prev) => [...prev, ...additionalMessages]);
  };

  const resetMessages = () => {
    setCurrentMessages(sampleMessages);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Pagination Demo</Text>
        <Text style={styles.headerSubtitle}>
          Test the intelligent pagination system
        </Text>
      </View>

      {/* Control Panel */}
      <View style={styles.controlPanel}>
        <Text style={styles.controlTitle}>Demo Controls</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={triggerAIPagination}
          >
            <Text style={styles.primaryButtonText}>🤖 AI Pagination</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={addMoreMessages}
          >
            <Text style={styles.secondaryButtonText}>➕ Add Messages</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={resetMessages}>
          <Text style={styles.resetButtonText}>🔄 Reset to Sample</Text>
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentMessages.length}</Text>
            <Text style={styles.statLabel}>Messages</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{pages.length}</Text>
            <Text style={styles.statLabel}>Pages</Text>
          </View>
        </View>
      </View>

      {/* Chat Viewer */}
      <View style={styles.chatContainer}>
        <ChatViewer
          ref={chatViewerRef}
          messages={currentMessages}
          returnPages={handleReturnPages}
          returnChat={handleReturnChat}
          extendedView={false}
          importTool={() => {}}
          setCurrentPage={() => {}}
          stoploader={false}
          setExtendedView={() => {}}
          bookSpecs={bookSpecs}
        />
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>How to Use:</Text>
        <Text style={styles.instructionsText}>
          1. Tap "AI Pagination" to open the intelligent pagination assistant
          {"\n"}
          2. Adjust settings like target page fill and message limits{"\n"}
          3. Preview the AI's pagination strategy and metrics{"\n"}
          4. Apply the optimized pagination to your chat
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#4688BA",
    padding: wp(5),
    paddingTop: hp(6),
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginTop: hp(0.5),
  },
  controlPanel: {
    backgroundColor: "white",
    margin: wp(4),
    padding: wp(4),
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  controlTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: hp(2),
  },
  buttonRow: {
    flexDirection: "row",
    gap: wp(3),
    marginBottom: hp(2),
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#4688BA",
    padding: wp(3),
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#E3F2FD",
    padding: wp(3),
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#1976D2",
    fontSize: 16,
    fontWeight: "600",
  },
  resetButton: {
    backgroundColor: "#f0f0f0",
    padding: wp(3),
    borderRadius: 8,
    alignItems: "center",
    marginBottom: hp(2),
  },
  resetButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: hp(2),
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4688BA",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  chatContainer: {
    flex: 1,
    margin: wp(4),
    marginTop: 0,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  instructions: {
    backgroundColor: "white",
    margin: wp(4),
    marginTop: 0,
    padding: wp(4),
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: hp(1),
  },
  instructionsText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});

export default AIPaginationDemo;
