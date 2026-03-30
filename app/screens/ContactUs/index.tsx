import {StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import CustomHeader from '../../Components/CustomHeader';
import {styles} from './style';
import CustomInputField from '../../Components/CustomInputField';
import {icn} from '../../assets/icons';
import CustomButton from '../../Components/CustomButton';
import {hp} from '../../utils/reponsiveness';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import ReasonModal from '../../Components/ReasonModal';
interface ContactUsProps {
  navigation?: any;
}
const ContactUs: React.FC<ContactUsProps> = ({navigation}) => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [explainIssue, setExplainIssue] = useState('');
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasons, setReasons] = useState('Select a Reason *');
  const reasonsOnPress = (txt: any) => {
    setReasons(txt);
    setShowReasonModal(false);
  };

  return (
    <View style={styles.mainContainer}>
      <CustomHeader text="Contact Us" onPress={() => navigation.goBack()} />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraHeight={-90}
        contentContainerStyle={{
          flexGrow: 1,
        }}>
        <View style={styles.innerContainer}>
          <CustomInputField
            placeHolder={reasons}
            editable={false}
            source={icn.dropDownIcn}
            rightIcn={true}
            rightIcnOnPress={() => setShowReasonModal(true)}
          />
          <CustomInputField
            placeHolder={'First Name *'}
            value={firstName}
            onChangeText={(txt: any) => setFirstName(txt)}
          />
          <CustomInputField
            placeHolder={'Email *'}
            value={email}
            onChangeText={(txt: any) => setEmail(txt)}
          />
          <CustomInputField
            placeHolder={'Phone Number *'}
            value={phoneNumber}
            onChangeText={(txt: any) => setPhoneNumber(txt)}
          />
          <CustomInputField
            placeHolder={'Explain issue *'}
            value={explainIssue}
            onChangeText={(txt: any) => setExplainIssue(txt)}
            oddInputFieldContainer={styles.oddInputFieldContainer}
            multiLine={true}
          />
        </View>
        <View style={styles.customButtonContainer}>
          <CustomButton
            text="Submit"
            oddTextStyle={styles.oddTextStyle}
            onPress={() =>
              navigation.navigate('BottomTab', {screen: 'ProfileTab'})
            }
          />
        </View>
        <ReasonModal
          visible={showReasonModal}
          withoutFeedBackPress={() => setShowReasonModal(false)}
          flowDifficultPress={() => reasonsOnPress('Flow was difficult')}
          screenResponsivePress={() =>
            reasonsOnPress('Screen was not reponsive')
          }
        />
      </KeyboardAwareScrollView>
    </View>
  );
};

export default ContactUs;
