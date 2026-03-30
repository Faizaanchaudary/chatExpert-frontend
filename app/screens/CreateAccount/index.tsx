import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { CommonActions } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch } from 'react-redux';
import { icn } from '../../assets/icons';
import { img } from '../../assets/img';
import CustomButton from '../../Components/CustomButton';
import CustomInputField from '../../Components/CustomInputField';
import { register } from '../../services/calls';
import { onLogin } from '../../store/Slice/userSlice';
import { hp, validateEmail } from '../../utils/reponsiveness';
import { styles } from './style';
import Config from '../../config';
import {
  getAuth,
  createUserWithEmailAndPassword,
} from '@react-native-firebase/auth';
interface CreateAccountProps {
  navigation?: any;
}
const CreateAccount: React.FC<CreateAccountProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [togglePassword, setTogglePassword] = useState(true);
  const [toggleConfirmPassword, setToggleConfirmPassword] = useState(true);
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useDispatch();

  const onSignUp = async () => {
    // Check if any field is empty
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('', 'Please fill in all fields.');
      return;
    }
    // Check if email is invalid

    if (!validateEmail(email)) {
      Alert.alert('', 'Please enter a valid email address.');
      return;
    }

    // Check if password is less than 8 characters
    if (password.length < 8) {
      Alert.alert('', 'Password must be at least 8 characters long.');
      return;
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      Alert.alert('', 'Password does not match.');
      return;
    }

    // try {
    setLoading(true);
    // const response = await register(name, email, password);
    createUserWithEmailAndPassword(getAuth(), email, password)
      .then(() => {
        console.log('User account created & signed in!');
        // dispatch(onLogin(obj));
        navigation.replace("BottomTabNavigation", { screen: "Home" });
        setTimeout(() => {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: 'BottomTab',
                  state: {
                    routes: [
                      {
                        name: 'BottomTab',
                      },
                    ],
                  },
                },
              ],
            }),
          );
        }, 200);
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          console.log('That email address is already in use!');
          Alert.alert('Failure', 'Email alreay in use!');
        }

        if (error.code === 'auth/invalid-email') {
          Alert.alert('Failure', 'Invalid email address');
          console.log('That email address is invalid!');
        }

        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });

    // if (response?.status == 200 || response?.status == 201) {
    //   const obj = {
    //     ...response?.data?.user,
    //     access_token: response?.data?.token,
    //   };
    //   dispatch(onLogin(obj));
    //   // navigation.replace("BottomTabNavigation", { screen: "Home" });
    //   setTimeout(() => {
    //     navigation.dispatch(
    //       CommonActions.reset({
    //         index: 0,
    //         routes: [
    //           {
    //             name: "BottomTab",
    //             state: {
    //               routes: [
    //                 {
    //                   name: "BottomTab",
    //                 },
    //               ],
    //             },
    //           },
    //         ],
    //       })
    //     );
    //   }, 200);
    // } else {
    //   Alert.alert("Failure", "Something went wrong");
    // }

    // navigation.navigate("BottomTabNavigation", { screen: "Home" });
    // } catch (err: any) {
    //   console.log("err", err?.response);
    //   if (err?.response?.data?.error) {
    //     Alert.alert("Failure", err?.response?.data?.error);
    //   } else {
    //     Alert.alert("Failure", "Failed to login, please try again");
    //   }
    // } finally {
    //   setLoading(false);
    // }
  };

  const googleLogin = async () => {
    GoogleSignin.configure({
      webClientId: Config.googleLoginKey,
      offlineAccess: false,
    });
    await GoogleSignin.signOut();
    const userInfo: any = await GoogleSignin.signIn();
    const idToken = userInfo?.idToken;
    const name = userInfo?.user;
    const email = userInfo?.user?.email;
  };

  return (
    <View style={styles.mainContainer} testID="createAccount">
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <Image source={img.backGroundImg} style={styles.backGroundImgStyle} />
      </ScrollView>
      <View style={styles.innerContainerView}>
        <View style={styles.barStyle}></View>
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          extraHeight={-90}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: hp(6) }}>
          <Text style={styles.createAnAccountTextStyle}>Create an account</Text>
          <CustomInputField
            placeHolder={'Name'}
            value={name}
            onChangeText={(txt: any) => setName(txt)}
            rightIcn={name !== '' && true}
            source={icn.tickIcn}
          />
          <CustomInputField
            placeHolder={'Email'}
            value={email}
            onChangeText={(txt: any) => setEmail(txt)}
            rightIcn={email !== '' && true}
            source={icn.tickIcn}
          />
          <CustomInputField
            placeHolder={'Password'}
            value={password}
            onChangeText={(txt: any) => setPassword(txt)}
            rightIcn={true}
            source={togglePassword ? icn.eyeCloseIcn : icn.eyeIcn}
            secureTextEntry={togglePassword}
            rightIcnOnPress={() => setTogglePassword(!togglePassword)}
          />
          <CustomInputField
            placeHolder={'Confirm Password'}
            value={confirmPassword}
            onChangeText={(txt: any) => setConfirmPassword(txt)}
            rightIcn={true}
            source={toggleConfirmPassword ? icn.eyeCloseIcn : icn.eyeIcn}
            rightIcnOnPress={() =>
              setToggleConfirmPassword(!toggleConfirmPassword)
            }
            secureTextEntry={toggleConfirmPassword}
          />
          <View style={styles.customButtonContainer}>
            <CustomButton
              text="Sign up"
              onPress={onSignUp}
              animating={loading}
            />
          </View>
          <Text style={styles.doNotHaveAccountStyle}>
            Already have an account?
            <Text
              onPress={() => navigation.navigate('LogIn')}
              style={styles.signUpTextStyle}>
              {' '}
              Sign In
            </Text>
          </Text>
          <View style={styles.orContainer}>
            <View style={styles.orBarStyle}></View>
            <Text style={styles.orTextStyle}>or</Text>
            <View style={styles.orBarStyle}></View>
          </View>
          <View style={styles.continueWithGoogleCon}>
            <CustomButton
              text="Continue with Google"
              onPress={googleLogin}
              oddTextStyle={styles.customBtnTextStyle}
              oddContainerStyle={styles.customBtnContainerStyle}
            />
          </View>
        </KeyboardAwareScrollView>
      </View>
    </View>
  );
};

export default CreateAccount;
