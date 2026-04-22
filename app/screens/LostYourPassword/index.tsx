import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { styles } from "./style";
import { img } from "../../assets/img";
import CustomInputField from "../../Components/CustomInputField";
import CustomButton from "../../Components/CustomButton";
import EmailVerificationModal from "../../Components/EmailVerificationModal";
import { icn } from "../../assets/icons";
import { validateEmail } from "../../utils/reponsiveness";
import { CommonActions } from "@react-navigation/native";
import { forgotPassword, vertifyOtp } from "../../services/calls";
interface LostYourPasswordProps {
  navigation?: any;
}
const LostYourPassword: React.FC<LostYourPasswordProps> = ({ navigation }) => {
  let timer = useRef<any>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [codeHere, setCodeHere] = useState("");
  const [resendTime, setResendTime] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const startTimer = () => {
    if (resendTime > 0) {
      timer.current = setInterval(() => {
        setResendTime((prevTime) => {
          if (prevTime > 0) {
            return prevTime - 1;
          } else {
            clearInterval(timer.current);
            return 0;
          }
        });
      }, 1000);
    }
    return () => clearInterval(timer?.current);
  };

  useEffect(() => {
    if (!showModal) {
      clearInterval(timer?.current);
      setResendTime(0);
    }
  }, [showModal]);

  useEffect(() => {
    if (resendTime == 60) {
      setShowModal(true);
      startTimer();
    }
  }, [resendTime]);

  const startTheTimer = () => {
    setResendTime(60);
  };
  const closeModal = () => {
    setShowModal(false);
    navigation.navigate("CreateNewPassword", email);
    clearInterval(timer?.current);
    setResendTime(0);
  };

  const onConfirm = async () => {
    // Check if any field is empty
    if (!codeHere) {
      Alert.alert("", "Please fill in all fields.");
      return;
    }
    // Check if email is invalid

    try {
      setLoading(true);
      const response = await vertifyOtp(codeHere, email);

      if (response?.status == 200 || response?.status == 201) {
        closeModal();
      } else {
        Alert.alert("Failure", "Something went wrong");
      }

      // navigation.navigate("BottomTabNavigation", { screen: "Home" });
    } catch (err: any) {
      console.log("err", err?.response);
      if (err?.response?.data?.error) {
        Alert.alert("Failure", err?.response?.data?.error);
      } else {
        Alert.alert("Failure", "Failed to login, please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  const onContinue = async () => {
    if (!email || !name) {
      Alert.alert("", "Please fill in all fields.");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("", "Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const response = await forgotPassword(email, name);

      if (response?.status == 200 || response?.status == 201) {
        startTheTimer();
      } else {
        Alert.alert("Failure", "Something went wrong");
      }
    } catch (err: any) {
      if (err?.response?.data?.error) {
        Alert.alert("Failure", err?.response?.data?.error);
      } else {
        Alert.alert("Failure", "Failed to send reset code, please try again");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.mainContainer}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <Image source={img.backGroundImg} style={styles.backGroundImgStyle} />
      </ScrollView>
      <View style={styles.innerContainerView}>
        <View style={styles.barStyle}></View>
        <Text style={styles.lostYourAccountTxt}>Lost your password</Text>
        <CustomInputField
          placeHolder={"Name"}
          value={name}
          onChangeText={(txt: any) => setName(txt)}
          rightIcn={name !== "" && true}
          source={icn.tickIcn}
        />
        <CustomInputField
          placeHolder={"Email"}
          value={email}
          onChangeText={(txt: any) => setEmail(txt)}
          rightIcn={email !== "" && true}
          source={icn.tickIcn}
        />
        <View style={styles.customButtonContainer}>
          <CustomButton
            testId={"continueButton"}
            text="Continue"
            onPress={() => onContinue()}
            animating={loading}
          />
        </View>
        <Text style={styles.doNotHaveAccountStyle}>
          Don’t have an account?
          <Text
            onPress={() => navigation.navigate("CreateAccount")}
            style={styles.signUpTextStyle}
          >
            {" "}
            Sign up
          </Text>
        </Text>
      </View>
      <EmailVerificationModal
        visible={showModal}
        value={codeHere}
        loading={loading}
        onChangeText={(txt: any) => setCodeHere(txt)}
        resendTime={resendTime}
        confirmOnPress={onConfirm}
        testId={"code"}
        sendAgain={onContinue}
        withOutFeedback={() => {
          setShowModal(false);
          clearInterval(timer?.current);
          setResendTime(0);
        }}
      />
    </View>
  );
};

export default React.memo(LostYourPassword);
