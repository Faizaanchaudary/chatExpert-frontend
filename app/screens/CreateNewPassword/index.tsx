import {
  CommonActions,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { icn } from "../../assets/icons";
import CustomButton from "../../Components/CustomButton";
import CustomHeader from "../../Components/CustomHeader";
import CustomInputField from "../../Components/CustomInputField";
import { resetPassword } from "../../services/calls";
import { hp } from "../../utils/reponsiveness";
import { styles } from "./style";

const CreateNewPassword: React.FC<any> = (props: any) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [togglePassword, setTogglePassword] = useState(true);
  const [toggleConfirmPassword, setToggleConfirmPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const route = useRoute<any>();
  const navigation = useNavigation();
  const onSave = async () => {
    // Check if any field is empty
    if (!password || !confirmPassword) {
      Alert.alert("", "Please fill in all fields.");
      return;
    }
    // Check if email is invalid

    if (password.length < 8) {
      Alert.alert("", "Password must be at least 8 characters long.");
      return;
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      Alert.alert("", "Password does not match.");
      return;
    }

    try {
      setLoading(true);
      const response = await resetPassword(route?.params, password);

      if (response?.status == 200 || response?.status == 201) {
        Alert.alert("Success", "Password reset.");
        setTimeout(() => {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: "LogIn",
                  state: {
                    routes: [
                      {
                        name: "LogIn",
                      },
                    ],
                  },
                },
              ],
            })
          );
        }, 200);
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
  return (
    <View style={styles.mainContainer}>
      <CustomHeader
        text="Create new Password"
        onPress={() => navigation.goBack()}
      />

      <Text style={styles.enterStrongPassword}>Enter strong password</Text>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraHeight={-90}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: hp(0.5),
        }}
      >
        <CustomInputField
          placeHolder={"password *"}
          value={password}
          onChangeText={(txt: any) => setPassword(txt)}
          rightIcn={true}
          source={togglePassword ? icn.eyeCloseIcn : icn.eyeIcn}
          secureTextEntry={togglePassword}
          rightIcnOnPress={() => setTogglePassword(!togglePassword)}
        />
        <CustomInputField
          placeHolder={"confirm password *"}
          value={confirmPassword}
          onChangeText={(txt: any) => setConfirmPassword(txt)}
          source={toggleConfirmPassword ? icn.eyeCloseIcn : icn.eyeIcn}
          rightIcn={true}
          secureTextEntry={toggleConfirmPassword}
          rightIcnOnPress={() =>
            setToggleConfirmPassword(!toggleConfirmPassword)
          }
        />
        <View style={styles.mustHaveTxtCon}>
          <Text style={styles.mustHaveTextStyle}>
            • Must have 8 digits and 1 capital alphabet
          </Text>
        </View>
        <View style={styles.customBtnContainer}>
          <CustomButton
            text="Save"
            oddContainerStyle={
              password.length < 5 ? styles.oddContainerStyle : null
            }
            disable={
              password.length < 5 || password != confirmPassword ? true : false
            }
            animating={loading}
            onPress={() => onSave()}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default CreateNewPassword;
