import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {CommonActions} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useDispatch} from 'react-redux';
import {icn} from '../../assets/icons';
import {img} from '../../assets/img';
import CustomButton from '../../Components/CustomButton';
import CustomInputField from '../../Components/CustomInputField';
import {login} from '../../services/calls';
import {onLogin} from '../../store/Slice/userSlice';
import {hp, validateEmail} from '../../utils/reponsiveness';
import {styles} from './style';
import Config from '../../config';
interface LogInProps {
  navigation?: any;
}

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

const LogIn: React.FC<LogInProps> = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toggle, setToggle] = useState(true);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const onSignIn = async () => {
    // Check if any field is empty
    if (!email || !password) {
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

    try {
      setLoading(true);
      console.log('Email and Password', email, password);

      const response = await login(email, password);

      if (response?.status == 200 || response?.status == 201) {
        const obj = {
          ...response?.data?.user,
          access_token: response?.data?.token,
        };
        dispatch(onLogin(obj));
        // navigation.replace("BottomTabNavigation", { screen: "Home" });
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
      } else {
        Alert.alert('Failure', 'Failed to login, please try again');
        console.error('Conditions failed');
      }

      // navigation.navigate("BottomTabNavigation", { screen: "Home" });
    } catch (err: any) {
      console.log('err', err?.response);
      if (err?.response?.data?.error) {
        Alert.alert('Failure', err?.response?.data?.error);
      } else {
        Alert.alert('Failure', 'Failed to loginnnn, please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
        <Image source={img.backGroundImg} style={styles.backGroundImgStyle} />
      </ScrollView>

      <View style={styles.innerContainerView}>
        <View style={styles.barStyle}></View>
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          extraHeight={-90}
          contentContainerStyle={{flexGrow: 1, paddingBottom: hp(0.5)}}>
          <CustomInputField
            placeHolder={'Email'}
            rightIcn={email !== '' && true}
            value={email}
            source={icn.tickIcn}
            onChangeText={(txt: any) => setEmail(txt)}
          />
          <CustomInputField
            placeHolder={'Password'}
            value={password}
            onChangeText={(txt: any) => setPassword(txt)}
            rightIcn={true}
            source={toggle ? icn.eyeCloseIcn : icn.eyeIcn}
            secureTextEntry={toggle}
            rightIcnOnPress={() => setToggle(!toggle)}
          />
          <View style={styles.customButtonContainer}>
            <CustomButton
              text="Sign in"
              onPress={() => onSignIn()}
              animating={loading}
            />
          </View>
          <Text style={styles.doNotHaveAccountStyle}>
            Don’t have an account?
            <Text
              onPress={() => navigation.navigate('CreateAccount')}
              style={styles.signUpTextStyle}>
              {' '}
              Sign up
            </Text>
          </Text>
          <View style={styles.orContainer}>
            <View style={styles.orBarStyle}></View>
            <Text style={styles.orTextStyle}>or</Text>
            <View style={styles.orBarStyle}></View>
          </View>
          <View style={styles.customButtonContainer}>
            <CustomButton
              onPress={googleLogin}
              text="Continue with Google"
              oddTextStyle={styles.customBtnTextStyle}
              oddContainerStyle={styles.customBtnContainerStyle}
            />
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('LostYourPassword')}>
            <Text style={styles.lostPasswordTextStyle}>
              Did you lost the password?
            </Text>
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      </View>
    </View>
  );
};

export default React.memo(LogIn);
