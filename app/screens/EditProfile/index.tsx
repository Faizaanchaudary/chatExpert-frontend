import {
  Alert,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { styles } from "./style";
import CustomHeader from "../../Components/CustomHeader";
import { img } from "../../assets/img";
import { hp, rhp, rwp, wp } from "../../utils/reponsiveness";
import { icn } from "../../assets/icons";
import ImagePicker from "react-native-image-crop-picker";
import CustomInputField from "../../Components/CustomInputField";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";
import CustomButton from "../../Components/CustomButton";
import { updateProfile } from "../../services/calls";
import { onUpdate } from "../../store/Slice/userSlice";
interface EditProfileProps {
  navigation?: any;
}
const EditProfile: React.FC<EditProfileProps> = ({ navigation }) => {
  const user = useSelector((state: any) => state?.user?.user);
  const [firstName, setFirstName] = useState(user?.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [imageSource, setImageSource] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  /*************  ✨ Codeium Command ⭐  *************/
  /******  bcf36569-aca9-43cb-8a8c-a5f637ae4a63  *******/
  const update = async () => {
    try {
      // Check if any field has actually changed
      const hasChanges = 
        (firstName !== user?.fullName) || 
        (phoneNumber !== user?.phoneNumber) || 
        imageSource?.path;
      
      if (!hasChanges) {
        Alert.alert("Info", "No changes to update");
        return;
      }
      
      setLoading(true);
      const data = new FormData();
      data.append("userId", user?._id);
      
      if (firstName !== user?.fullName) {
        data?.append("fullName", firstName);
      }
      if (phoneNumber !== user?.phoneNumber) {
        data?.append("phoneNumber", phoneNumber);
      }
      if (imageSource?.path?.length > 0) {
        data.append("profilePictureUrl", {
          uri: imageSource?.path,
          name: "photo1dsa.jpg",
          type: "image/jpeg",
        });
      }
      const response = await updateProfile(data);

      if (response?.status == 200 || response?.status == 201) {
        const obj = { ...user, ...response?.data?.user };
        dispatch(onUpdate(obj));
        Alert.alert("Success", "Profile updated");
      } else {
        Alert.alert("Failure", "Failed to update profile, please try again");
      }

      // navigation.navigate("BottomTabNavigation", { screen: "Home" });
    } catch (err: any) {
      console.log("err", err?.response);
      if (err?.response?.data?.error) {
        Alert.alert("Failure", err?.response?.data?.error);
      } else {
        Alert.alert("Failure", "Failed to update profile, please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  const camerOnPress = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      mediaType: "photo",
      cropping: true,
    }).then((image) => {
      setImageSource(image);
      console.log(image, "Image received");
    });
  };
  return (
    <View style={styles.mainContainer}>
      <CustomHeader text="Edit Profile" onPress={() => navigation.goBack()} />
      <ImageBackground
        borderRadius={wp(100)}
        resizeMode="cover"
        source={
          imageSource?.path
            ? { uri: imageSource?.path }
            : user?.profilePictureUrl
            ? { uri: user?.profilePictureUrl }
            : img.profileImg
        }
        style={styles.profileImageStyle}
      >
        <TouchableOpacity
          onPress={camerOnPress}
          style={styles.cameraIcnContainer}
          testID="cameraIcon"
        >
          <Image source={icn.cameraIcn} style={styles.cameraIcnStyle} />
        </TouchableOpacity>
      </ImageBackground>
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
          placeHolder={user?.email ? user?.email : "Email *"}
          oddInputFieldContainer={styles.oddInputFieldContainer}
          editable={false}
          blurPlaceHolder={true}
        />
        <CustomInputField
          placeHolder="Full Name *"
          value={firstName}
          onChangeText={(txt: any) => setFirstName(txt)}
        />
        <CustomInputField
          placeHolder="Phone Number *"
          value={phoneNumber}
          onChangeText={(txt: any) => setPhoneNumber(txt)}
          keyboardType={"numeric"}
        />
        <CustomButton text="Update" onPress={update} animating={loading} />
      </KeyboardAwareScrollView>
    </View>
  );
};

export default EditProfile;
