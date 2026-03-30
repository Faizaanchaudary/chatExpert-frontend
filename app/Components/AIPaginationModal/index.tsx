import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { hp, wp } from "../../utils/reponsiveness";
import AIPaginationService, {
  ChatMessage,
  PaginationResult,
  PaginationConfig,
} from "../../services/aiPaginationService";

// Custom Slider Component
interface CustomSliderProps {
  value: number;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  onValueChange: (value: number) => void;
  style?: any;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  value,
  minimumValue,
  maximumValue,
  step = 0.01,
  onValueChange,
  style,
}) => {
  const [sliderWidth, setSliderWidth] = useState(200);

  const handlePress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const percentage = locationX / sliderWidth;
    const newValue = minimumValue + percentage * (maximumValue - minimumValue);

    let finalValue = newValue;
    if (step > 0.01) {
      finalValue = Math.round(newValue / step) * step;
    }

    finalValue = Math.max(minimumValue, Math.min(maximumValue, finalValue));
    onValueChange(finalValue);
  };

  const thumbPosition =
    ((value - minimumValue) / (maximumValue - minimumValue)) * sliderWidth;

  return (
    <View
      style={[{ height: 40, justifyContent: "center" }, style]}
      onLayout={(event) => setSliderWidth(event.nativeEvent.layout.width)}
    >
      <TouchableOpacity
        style={{
          height: 4,
          backgroundColor: "#ddd",
          borderRadius: 2,
          position: "relative",
        }}
        onPress={handlePress}
        activeOpacity={1}
      >
        <View
          style={{
            height: 4,
            backgroundColor: "#4688BA",
            borderRadius: 2,
            width: thumbPosition,
          }}
        />
        <View
          style={{
            position: "absolute",
            left: thumbPosition - 10,
            top: -8,
            width: 20,
            height: 20,
            backgroundColor: "#4688BA",
            borderRadius: 10,
            borderWidth: 2,
            borderColor: "#fff",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.3,
            shadowRadius: 2,
            elevation: 3,
          }}
        />
      </TouchableOpacity>
    </View>
  );
};

interface AIPaginationModalProps {
  visible: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onPaginationComplete: (pages: ChatMessage[][], metrics: any) => void;
  bookSpecs?: any;
  currentConfig?: Partial<PaginationConfig>;
}

const AIPaginationModal: React.FC<AIPaginationModalProps> = ({
  visible,
  onClose,
  messages,
  onPaginationComplete,
  bookSpecs,
  currentConfig = {},
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paginationService] = useState(
    () => new AIPaginationService(bookSpecs)
  );
  const [config, setConfig] = useState<PaginationConfig>({
    targetFillRatio: 0.7,
    minMessagesPerPage: 4,
    maxMessagesPerPage: 20,
    allowSplitLongMessages: true,
    prioritizeBalance: true,
    ...currentConfig,
  });
  const [previewResult, setPreviewResult] = useState<PaginationResult | null>(
    null
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (visible && messages.length > 0) {
      generatePreview();
    }
  }, [visible, messages, config]);

  const generatePreview = async () => {
    try {
      setIsProcessing(true);

      // Update service configuration
      paginationService.updateConfig(config);

      // Generate pagination preview
      const result = await new Promise<PaginationResult>((resolve) => {
        setTimeout(() => {
          const paginationResult = paginationService.paginateMessages(messages);
          resolve(paginationResult);
        }, 500); // Small delay to show loading state
      });

      setPreviewResult(result);
    } catch (error) {
      console.error("Error generating pagination preview:", error);
      Alert.alert(
        "Error",
        "Failed to generate pagination preview. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const applyPagination = () => {
    if (!previewResult) {
      Alert.alert(
        "Error",
        "No pagination result available. Please generate a preview first."
      );
      return;
    }

    Alert.alert(
      "Apply AI Pagination",
      `This will create ${
        previewResult.metrics.totalPages
      } pages with an average fill of ${(
        previewResult.metrics.averageFill * 100
      ).toFixed(1)}%. Continue?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Apply",
          onPress: () => {
            onPaginationComplete(previewResult.pages, previewResult.metrics);
            onClose();
          },
        },
      ]
    );
  };

  const resetToDefaults = () => {
    setConfig({
      targetFillRatio: 0.7,
      minMessagesPerPage: 3,
      maxMessagesPerPage: 20,
      allowSplitLongMessages: true,
      prioritizeBalance: true,
    });
  };

  const getFillColor = (value: number): string => {
    if (value < 0.5) return "#F44336"; // Red - too low
    if (value >= 0.65 && value <= 0.7) return "#4CAF50"; // Green - optimal fill (updated for 80% target)
    if (value >= 0.6 && value <= 0.75) return "#FF9800"; // Orange - acceptable fill
    return "#F44336"; // Red - too high or too low
  };

  const getImbalanceColor = (value: number): string => {
    if (value < 0.2) return "#4CAF50"; // Green - good balance
    if (value < 0.4) return "#FF9800"; // Orange - moderate imbalance
    return "#F44336"; // Red - poor balance
  };

  const renderMetrics = () => {
    if (!previewResult) return null;

    const { metrics, recommendations } = previewResult;

    return (
      <View style={{ marginVertical: hp(2) }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            marginBottom: hp(1),
            color: "#333",
          }}
        >
          Pagination Analysis
        </Text>

        {/* Metrics Cards */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: hp(2),
          }}
        >
          <View style={[styles.metricCard, { backgroundColor: "#E3F2FD" }]}>
            <Text style={styles.metricValue}>{metrics.totalPages}</Text>
            <Text style={styles.metricLabel}>Total Pages</Text>
          </View>

          <View
            style={[
              styles.metricCard,
              { backgroundColor: getFillColor(metrics.averageFill) + "20" },
            ]}
          >
            <Text
              style={[
                styles.metricValue,
                { color: getFillColor(metrics.averageFill) },
              ]}
            >
              {(metrics.averageFill * 100).toFixed(1)}%
            </Text>
            <Text style={styles.metricLabel}>Avg Fill</Text>
          </View>

          <View
            style={[
              styles.metricCard,
              {
                backgroundColor:
                  getImbalanceColor(metrics.imbalanceFactor) + "20",
              },
            ]}
          >
            <Text
              style={[
                styles.metricValue,
                { color: getImbalanceColor(metrics.imbalanceFactor) },
              ]}
            >
              {metrics.imbalanceFactor.toFixed(2)}
            </Text>
            <Text style={styles.metricLabel}>Balance</Text>
          </View>
        </View>

        {/* Messages per page distribution */}
        <View style={{ marginBottom: hp(2) }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              marginBottom: hp(1),
              color: "#666",
            }}
          >
            Messages per page: {metrics.messagesPerPage.join(", ")}
          </Text>
        </View>

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <View style={{ marginBottom: hp(2) }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                marginBottom: hp(1),
                color: "#333",
              }}
            >
              AI Recommendations
            </Text>
            {recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Text style={styles.recommendationText}>• {rec}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderConfigControls = () => (
    <View style={{ marginVertical: hp(2) }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: hp(2),
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#333" }}>
          AI Configuration
        </Text>
        <TouchableOpacity onPress={() => setShowAdvanced(!showAdvanced)}>
          <Text style={{ color: "#4688BA", fontSize: 14 }}>
            {showAdvanced ? "Hide Advanced" : "Show Advanced"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Target Fill Ratio */}
      <View style={styles.configItem}>
        <Text style={styles.configLabel}>
          Target Page Fill: {(config.targetFillRatio * 100).toFixed(0)}%
        </Text>
        <CustomSlider
          style={{ width: "100%", height: 40 }}
          minimumValue={0.7}
          maximumValue={0.85}
          value={config.targetFillRatio}
          onValueChange={(value: number) =>
            setConfig((prev) => ({ ...prev, targetFillRatio: value }))
          }
        />
        <Text style={styles.configHint}>
          Higher values create fuller pages, lower values leave more white space
        </Text>
      </View>

      {/* Split Long Messages */}
      <View
        style={[
          styles.configItem,
          {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.configLabel}>Split Long Messages</Text>
          <Text style={styles.configHint}>
            Automatically break very long messages into smaller chunks
          </Text>
        </View>
        <Switch
          value={config.allowSplitLongMessages}
          onValueChange={(value) =>
            setConfig((prev) => ({ ...prev, allowSplitLongMessages: value }))
          }
          trackColor={{ false: "#ddd", true: "#4688BA" }}
          thumbColor="#fff"
        />
      </View>

      {/* Prioritize Balance */}
      <View
        style={[
          styles.configItem,
          {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.configLabel}>Prioritize Balance</Text>
          <Text style={styles.configHint}>
            Optimize for even distribution across pages
          </Text>
        </View>
        <Switch
          value={config.prioritizeBalance}
          onValueChange={(value) =>
            setConfig((prev) => ({ ...prev, prioritizeBalance: value }))
          }
          trackColor={{ false: "#ddd", true: "#4688BA" }}
          thumbColor="#fff"
        />
      </View>

      {/* Advanced Controls */}
      {showAdvanced && (
        <>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>
              Min Messages per Page: {config.minMessagesPerPage}
            </Text>
            <CustomSlider
              style={{ width: "100%", height: 40 }}
              minimumValue={2}
              maximumValue={8}
              step={1}
              value={config.minMessagesPerPage}
              onValueChange={(value: number) =>
                setConfig((prev) => ({
                  ...prev,
                  minMessagesPerPage: Math.round(value),
                }))
              }
            />
          </View>

          <View style={styles.configItem}>
            <Text style={styles.configLabel}>
              Max Messages per Page: {config.maxMessagesPerPage}
            </Text>
            <CustomSlider
              style={{ width: "100%", height: 40 }}
              minimumValue={5}
              maximumValue={25}
              step={1}
              value={config.maxMessagesPerPage}
              onValueChange={(value: number) =>
                setConfig((prev) => ({
                  ...prev,
                  maxMessagesPerPage: Math.round(value),
                }))
              }
            />
          </View>
        </>
      )}

      {/* Reset Button */}
      <TouchableOpacity style={styles.resetButton} onPress={resetToDefaults}>
        <Text style={styles.resetButtonText}>Reset to Defaults</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>AI Pagination Assistant</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Info Section */}
            <View style={styles.infoSection}>
              <Text style={styles.infoText}>
                AI will analyze your {messages.length} messages and create
                optimally balanced pages based on content size, device
                specifications, and readability best practices.
              </Text>
            </View>

            {/* Configuration Controls */}
            {renderConfigControls()}

            {/* Processing Indicator */}
            {isProcessing && (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color="#4688BA" />
                <Text style={styles.processingText}>Analyzing messages...</Text>
              </View>
            )}

            {/* Metrics Display */}
            {!isProcessing && renderMetrics()}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.previewButton]}
              onPress={generatePreview}
              disabled={isProcessing}
            >
              <Text style={styles.previewButtonText}>
                {isProcessing ? "Analyzing..." : "Generate Preview"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.applyButton,
                !previewResult && styles.disabledButton,
              ]}
              onPress={applyPagination}
              disabled={!previewResult || isProcessing}
            >
              <Text
                style={[
                  styles.applyButtonText,
                  !previewResult && styles.disabledButtonText,
                ]}
              >
                Apply Pagination
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    width: wp(90),
    maxHeight: hp(85),
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: wp(5),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: "#333",
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#666",
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: wp(5),
  },
  infoSection: {
    backgroundColor: "#E3F2FD",
    padding: wp(4),
    borderRadius: 10,
    marginVertical: hp(2),
  },
  infoText: {
    fontSize: 14,
    color: "#1976D2",
    textAlign: "center" as const,
    lineHeight: 20,
  },
  metricCard: {
    flex: 1,
    padding: wp(3),
    borderRadius: 10,
    alignItems: "center" as const,
    marginHorizontal: wp(1),
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#333",
  },
  metricLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  recommendationItem: {
    backgroundColor: "#FFF3E0",
    padding: wp(3),
    borderRadius: 8,
    marginBottom: hp(1),
    borderLeftWidth: 3,
    borderLeftColor: "#FF9800",
  },
  recommendationText: {
    fontSize: 13,
    color: "#E65100",
    lineHeight: 18,
  },
  configItem: {
    marginBottom: hp(2.5),
  },
  configLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#333",
    marginBottom: hp(0.5),
  },
  configHint: {
    fontSize: 12,
    color: "#666",
    marginTop: hp(0.5),
    lineHeight: 16,
  },
  resetButton: {
    backgroundColor: "#f0f0f0",
    padding: wp(3),
    borderRadius: 8,
    alignItems: "center" as const,
    marginTop: hp(1),
  },
  resetButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500" as const,
  },
  processingContainer: {
    alignItems: "center" as const,
    paddingVertical: hp(4),
  },
  processingText: {
    marginTop: hp(1),
    fontSize: 16,
    color: "#4688BA",
  },
  actionButtons: {
    flexDirection: "row" as const,
    padding: wp(5),
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    gap: wp(3),
  },
  button: {
    flex: 1,
    paddingVertical: hp(1.5),
    borderRadius: 10,
    alignItems: "center" as const,
  },
  previewButton: {
    backgroundColor: "#E3F2FD",
  },
  previewButtonText: {
    color: "#1976D2",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  applyButton: {
    backgroundColor: "#4688BA",
  },
  applyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  disabledButton: {
    backgroundColor: "#f0f0f0",
  },
  disabledButtonText: {
    color: "#999",
  },
};

export default AIPaginationModal;
