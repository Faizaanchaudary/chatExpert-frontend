import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { styles } from "./style";
import CustomHeader from "../../Components/CustomHeader";
import { img } from "../../assets/img";
import { icn } from "../../assets/icons";
import EditPhotoIcons from "../../Components/EditPhotoIcons";
import CustomButton from "../../Components/CustomButton";
import { hp, wp } from "../../utils/reponsiveness";
import { COLORS } from "../../utils/colors";
import RotaterModal from "../../Components/RotaterModal";
import FilterModal from "../../Components/FilterModal";
import SliderModal from "../../Components/SliderModal";
import { useRoute } from "@react-navigation/native";
import { uploadContent } from "../../services/calls";
import { useDispatch } from "react-redux";
import { enableSnackbar } from "../../store/Slice/snackbarSlice";

import Slider from "@react-native-community/slider";

interface EditPhotosProps {
  navigation?: any;
  route?: any;
}

const EditPhotos: React.FC<EditPhotosProps> = ({ navigation, route }) => {
  const [showRotaterModal, setShowRotaterModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [starPress, setStarPress] = useState(false);
  const [showSliderModal, setShowSliderModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const [currentRotateIcn, setCurrentRotateIcn] = useState({
    source: icn.rotateLeft,
  });

  const [editIcons, setEditIcons] = useState([
    {
      source: icn.starIcon,
    },
    {
      source: icn.rotaterIcon,
    },
    {
      source: icn.blueDeleteIcn,
    },
  ]);
  const [favourtie, setfavourtie] = useState([
    {
      source: icn.filtersIcon,
    },
    {
      source: icn.brightness,
    },
    {
      source: icn.circleSlider,
    },
    {
      source: icn.dropIcn,
    },
  ]);
  const customButtonOnPress = async () => {
    if (starPress) {
      setStarPress(false);
    } else {
      //from chat list
      try {
        setLoading(true);
        const data = new FormData();
        console.log("image", isImage?.path);
        data.append("files", {
          uri: isImage?.path,
          name: "photo1.jpg",
          type: "*/*",
        });
        data.append("title", `${Math.random() * 232 * Math.random()}`);
        data.append("name", `${Math.random() * 232 * Math.random()}`);
        const res = await uploadContent(data);
        if (res?.status == 200 || res?.status == 201) {
          console.log("res", res?.data);
          route?.params?.setImageAt(
            route?.params?.index,
            res?.data?.url[0],
            route?.params?.id
          );
          navigation.goBack();
        } else {
          dispatch(enableSnackbar("Failed to upload image"));
        }
      } catch (err) {
        console.log("err", err);
        dispatch(enableSnackbar("Failed to upload image"));
      } finally {
        setLoading(false);
      }
      return;
    }
  };
  const EditIconPress = (item: any) => {
    if (item.source == icn.starIcon) {
      setStarPress(true);
    } else if (item.source == icn.rotaterIcon) {
      setShowRotaterModal(true);
    } else if (item.source == icn.blueDeleteIcn) {
      Alert.alert("Delete");
    } else if (item.source == icn.filtersIcon) {
      setShowFilterModal(true);
    } else if (item.source == icn.brightness) {
      setShowSliderModal(true);
    } else if (item.source == icn.circleSlider) {
      setShowSliderModal(true);
    } else if (item.source == icn.dropIcn) {
      setShowSliderModal(true);
    }
  };
  const isImage = route?.params?.isImage;

  return (
    <View style={styles.mainContainer}>
      {loading ? (
        <ActivityIndicator
          style={{ position: "absolute", alignSelf: "center", top: hp(45) }}
        />
      ) : null}
      <CustomHeader
        text="Edit"
        onPress={() => navigation.navigate("BookList")}
      />

      <Image
        source={isImage?.path ? { uri: isImage?.path } : img.editImage}
        style={styles.imageStyle}
        resizeMode="contain"
      />

      <View style={styles.bottomContainer}>
        {!starPress && (
          <TouchableOpacity>
            <Text style={styles.reSetTextStyle}>Reset</Text>
          </TouchableOpacity>
        )}
        <FlatList
          data={starPress ? favourtie : editIcons}
          horizontal={true}
          contentContainerStyle={styles.flatListContentContainerStyle}
          renderItem={({ item, index }) => {
            return (
              <EditPhotoIcons
                item={item}
                key={index}
                onPress={() => EditIconPress(item)}
              />
            );
          }}
        />
        <CustomButton
          text={starPress ? "Save" : "Done"}
          oddTextStyle={styles.customButtonOddTextStyle}
          onPress={() => customButtonOnPress()}
          animating={loading}
        />
      </View>
      {/* //Modals */}
      <RotaterModal
        visible={showRotaterModal}
        setShowRotaterModal={setShowRotaterModal}
        setCurrentRotateIcn={setCurrentRotateIcn}
        currentRotateIcn={currentRotateIcn}
      />
      <FilterModal
        visible={showFilterModal}
        setShowFilterModal={setShowFilterModal}
      />
      {starPress && (
        <SliderModal
          setShowSliderModal={setShowSliderModal}
          visible={showSliderModal}
        />
      )}
    </View>
  );
};

export default EditPhotos;
