import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { styles } from "./style";
import { img } from "../../../assets/img";
import CustomButton from "../../../Components/CustomButton";
import ProfileCard from "../../../Components/ProfileCard";
import { icn } from "../../../assets/icons";
import { hp, rwp, wp } from "../../../utils/reponsiveness";
import { COLORS } from "../../../utils/colors";
import LogoutModal from "../../../Components/LogoutModal";
import { CommonActions } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { onLogout } from "../../../store/Slice/userSlice";
interface ProfileTabProps {
  navigation?: any;
}
const ProfileTab: React.FC<ProfileTabProps> = ({ navigation }) => {
  const [showLogOutModal, setShowLogOutModal] = useState(false);
  const user = useSelector((state: any) => state?.user?.user);

  const dispatch = useDispatch();

  const yesOnPress = () => {
    setShowLogOutModal(false);
    dispatch(onLogout());
    setTimeout(() => {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: "Splash",
              state: {
                routes: [
                  {
                    name: "Splash",
                  },
                ],
              },
            },
          ],
        })
      );
    }, 200);
  };
  return (
    <View style={styles.mainContainer}>
      <View style={styles.profileContainer}>
        <Image
          source={
            user?.profilePictureUrl
              ? { uri: user?.profilePictureUrl }
              : img.profileImg
          }
          style={styles.profileImageStyle}
          resizeMode="stretch"
        />
        <View style={styles.profileInnerCon}>
          <Text style={styles.goodMorningTextStyle}>
            {"Good Morning\n"}
            <Text style={styles.nameTextStyle}>{user?.fullName}</Text>
          </Text>
          <TouchableOpacity
            style={styles.editTextContainerStyle}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Text style={styles.editTextStyle}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.barColor}></View>
      <View style={styles.profileCardContainer}>
        <ProfileCard
          text={"My orders"}
          source={icn.lockIcn}
          rightIcn={true}
          onPress={() => navigation.navigate("MyOrders")}
        />
        <ProfileCard
          text={"Addresses"}
          source={icn.sendIcn}
          rightIcn={true}
          onPress={() =>
            navigation.navigate("Addresses", { isProfileTab: true })
          }
        />
        <ProfileCard
          text={"Contact us"}
          source={icn.questionProfile}
          rightIcn={true}
          onPress={() => navigation.navigate("ContactUs")}
        />
        <ProfileCard
          text={"Log out"}
          source={icn.logoutIcn}
          red
          onPress={() => setShowLogOutModal(true)}
        />
      </View>
      <View style={styles.rateUsMainContainer}>
        <View style={styles.rateUsInnerContainer}>
          {/* <Text style={styles.rateUsTextStyle}>
            Lorem Ipsum jeckson clibt clers mona
          </Text>
          <CustomButton
            text="Rate Us"
            oddContainerStyle={styles.rateUsOddContainer}
            oddTextStyle={styles.rateUsOddTextStyle}
          /> */}
        </View>
        <LogoutModal
          visible={showLogOutModal}
          noOnPress={() => setShowLogOutModal(false)}
          yesOnPress={yesOnPress}
          withOutFeedBackPress={() => setShowLogOutModal(false)}
        />
      </View>
    </View>
  );
};

export default ProfileTab;
