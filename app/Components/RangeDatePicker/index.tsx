import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import DatePicker from "react-native-date-picker";

const DateRangePicker = ({
  onFromDateChange,
  onToDateChange,
  onSubmit,
  onCancel,
  initialFromDate = null,
  initialToDate = null,
  buttonStyle = {},
  textStyle = {},
  containerStyle = {},
  submitButtonStyle = {},
  submitTextStyle = {},
  cancelButtonStyle = {},
  cancelTextStyle = {},
}) => {
  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(initialToDate);
  const [isFromPickerOpen, setFromPickerOpen] = useState(false);
  const [isToPickerOpen, setToPickerOpen] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      if (!fromDate) {
        setFromPickerOpen(true);
      }
    }
  }, [isFocused]);

  // Handle From Date selection
  const handleFromConfirm = (date) => {
    setFromDate(date);
    onFromDateChange && onFromDateChange(date);
    setFromPickerOpen(false);

    if (toDate && date >= toDate) {
      setToDate(null); // Reset To Date if invalid
      onToDateChange && onToDateChange(null);
    }
    setToPickerOpen(true);
  };

  // Handle To Date selection
  const handleToConfirm = (date) => {
    if (fromDate && date < fromDate) {
      Alert.alert(
        "Invalid Date",
        'The "To Date" must be greater than the "From Date".'
      );
    } else {
      setToDate(date);
      onToDateChange && onToDateChange(date);
    }
    setToPickerOpen(false);
    onSubmit({ fromDate, date });
  };

  return (
    <View
      style={[styles.container, containerStyle, { backgroundColor: "white" }]}
    >
      <ActivityIndicator />
      <Text style={{ color: "black" }}>Loading</Text>
      {/* From Date Picker */}
      {/* <TouchableOpacity
        style={[styles.button, buttonStyle]}
        onPress={() => setFromPickerOpen(true)}
      >
        <Text style={[styles.buttonText, textStyle]}>
          {fromDate
            ? `From: ${fromDate.toLocaleDateString()}`
            : "Select From Date"}
        </Text>
      </TouchableOpacity> */}
      <DatePicker
        modal
        open={isFromPickerOpen}
        confirmText="Confirm (From Date)"
        date={fromDate || new Date()}
        mode="date"
        title={"Select the starting date"}
        onConfirm={handleFromConfirm}
        onCancel={() => {
          setFromPickerOpen(false);

          onCancel && onCancel();
        }}
        style={styles.datePickerModal}
      />

      {/* To Date Picker */}
      {/* {fromDate && (
        <TouchableOpacity
          style={[styles.button, buttonStyle]}
          onPress={() => setToPickerOpen(true)}
        >
          <Text style={[styles.buttonText, textStyle]}>
            {toDate ? `To: ${toDate.toLocaleDateString()}` : "Select To Date"}
          </Text>
        </TouchableOpacity>
      )} */}
      <DatePicker
        modal
        open={isToPickerOpen}
        title={"Select the ending date"}
        date={toDate || new Date()}
        mode="date"
        confirmText="Confirm (To Date)"
        minimumDate={fromDate} // Ensures To Date can't be earlier than From Date
        onConfirm={handleToConfirm}
        onCancel={() => {
          setToPickerOpen(false);
          onCancel && onCancel();
        }}
        style={styles.datePickerModal}
      />

      {/* Submit Button */}
      {/* <TouchableOpacity
        style={[
          styles.submitButton,
          submitButtonStyle,
          { backgroundColor: fromDate && toDate ? "#10B981" : "#6B7280" }, // Green if enabled, gray if disabled
        ]}
        disabled={!fromDate || !toDate}
        onPress={() => onSubmit && onSubmit({ fromDate, toDate })}
      >
        <Text style={[styles.submitText, submitTextStyle]}>
          {fromDate && toDate ? "Submit" : "Select Dates to Submit"}
        </Text>
      </TouchableOpacity> */}

      {/* Cancel Button */}
      {/* <TouchableOpacity
        style={[styles.cancelButton, cancelButtonStyle]}
        onPress={() => {
          setFromDate(null);
          setToDate(null);
          onCancel && onCancel();
        }}
      >
        <Text style={[styles.cancelText, cancelTextStyle]}>Cancel</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF", // White background
    borderRadius: 12,
    width: "80%",
    alignSelf: "center",
  },
  button: {
    backgroundColor: "#1F2937", // Sleek dark button
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    width: "90%",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#FFFFFF", // White text
    textAlign: "center",
  },
  submitButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    width: "90%",
    alignItems: "center",
  },
  submitText: {
    fontSize: 16,
    color: "#FFFFFF", // White text
    textAlign: "center",
  },
  cancelButton: {
    marginTop: 10,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#F87171", // Red for cancel
    width: "90%",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 16,
    color: "#FFFFFF", // White text
    textAlign: "center",
  },
  datePickerModal: {
    backgroundColor: "#FFFFFF", // White modal background
    // width: "80%", // Limit modal width
  },
});

export default DateRangePicker;
