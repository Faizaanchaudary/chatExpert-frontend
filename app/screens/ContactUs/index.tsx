import {StyleSheet, Text, View, Alert} from 'react-native';
import React, {useState} from 'react';
import CustomHeader from '../../Components/CustomHeader';
import CustomInputField from '../../Components/CustomInputField';
import {icn} from '../../assets/icons';
import CustomButton from '../../Components/CustomButton';
import {hp} from '../../utils/reponsiveness';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {styles} from './style';

interface ContactUsProps {
  navigation?: any;
}

const ContactUs: React.FC<ContactUsProps> = ({navigation}) => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [explainIssue, setExplainIssue] = useState('');
  const [reason, setReason] = useState(''); // Changed to regular input
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validate required fields
    if (!firstName.trim()) {
      Alert.alert('Error', 'First name is required');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }
    if (!explainIssue.trim()) {
      Alert.alert('Error', 'Please explain your issue');
      return;
    }

    setLoading(true);
    try {
      const { submitContactForm } = require('../../services/contactApi');
      await submitContactForm({
        firstName: firstName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        reason: reason.trim() || null, // Use the input field value
        message: explainIssue.trim(),
      });

      Alert.alert(
        'Success', 
        'Your message has been sent successfully. We will get back to you soon.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send message. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
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
            placeHolder={'Reason (Optional)'}
            value={reason}
            onChangeText={(txt: any) => setReason(txt)}
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
            keyboardType="email-address"
          />
          <CustomInputField
            placeHolder={'Phone Number *'}
            value={phoneNumber}
            onChangeText={(txt: any) => setPhoneNumber(txt)}
            keyboardType="phone-pad"
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
            onPress={handleSubmit}
            animating={loading}
            disable={loading}
          />
        </View>

      </KeyboardAwareScrollView>
    </View>
  );
};

export default ContactUs;
