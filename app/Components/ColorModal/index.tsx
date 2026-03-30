import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useState } from "react";
import { styles } from "./style";
import ColorBox from "../ColorBox";
import { COLORS } from "../../utils/colors";
import { wp } from "../../utils/reponsiveness";
import { img } from "../../assets/img";
import CustomButton from "../CustomButton";
import ImagePicker from "react-native-image-crop-picker";

interface ColorModalInterface {
  visible?: any;
  addImagePress?: () => void;
  setCurrentColor?: any;
  setShowColorModal?: any;
}
const ColorModal: React.FC<ColorModalInterface> = ({
  visible,
  addImagePress,
  setCurrentColor,
  setShowColorModal,
}) => {
  const [colors, setColors] = useState([
    {
      text: true,
    },
    { backgroundColor: COLORS.lightRed },
    {
      backgroundColor: COLORS.purple,
    },
    {
      backgroundColor: COLORS.creamColor,
    },
    {
      backgroundColor: COLORS.green,
    },
    {
      backgroundColor: COLORS.skyBlue,
    },
  ]);
  const [textureImage, setTextureImage] = useState([
    {
      text: true,
    },
    {
      image: img.colorModalImg1,
      path: "./../../assets/img/colorModalImg1.png",
      code: true,
    },
    {
      image: img.colorModalImg2,
      path: "./../../assets/img/colorModalImg2.png",
      code: true,
    },
    {
      image: img.colorModalImg3,
      path: "./../../assets/img/colorModalImg3.png",
      code: true,
    },
    {
      image: img.colorModalImg4,
      path: "./../../assets/img/colorModalImg4.png",
      code: true,
    },
  ]);

  const importPhotos = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      mediaType: "photo",
      cropping: true,
    }).then((image) => {
      console.log("image", image);
      setCurrentColor({ code: false, path: image?.path, image: true });
    });
  };

  const handleColorPress = (item) => {
    setCurrentColor(item?.backgroundColor);
    console.log("🚀 ~ handleColorPress ~ item:", item);
    if (item.text == true) {
      setCurrentColor("");
    }
    setShowColorModal(item);
  };
  const handleTexturePress = (item) => {
    console.log("ite", item);
    setCurrentColor(item);
  };
  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <TouchableWithoutFeedback onPress={() => setShowColorModal(false)}>
        <View style={styles.mainContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.innerContainer}>
              <Text style={styles.chooseColorTextStyle}>Choose Color </Text>
              <View style={styles.barStyle}></View>
              <FlatList
                contentContainerStyle={{ paddingHorizontal: wp(7) }}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                data={colors}
                renderItem={({ item, index }) => {
                  return (
                    <ColorBox
                      item={item}
                      key={index}
                      onPress={() => handleColorPress(item)}
                    />
                  );
                }}
              />
              <View style={styles.barStyle2}></View>
              <FlatList
                contentContainerStyle={{ paddingHorizontal: wp(7) }}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                data={textureImage}
                renderItem={({ item, index }) => {
                  return (
                    <ColorBox
                      item={item}
                      key={index}
                      onPress={() => {
                        handleTexturePress(item);
                        setShowColorModal(false);
                      }}
                    />
                  );
                }}
              />
              <View style={styles.barStyle2}></View>
              <CustomButton
                text="Add Image"
                oddContainerStyle={styles.oddContainerStyle}
                oddTextStyle={styles.oddTextStyle}
                onPress={importPhotos}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ColorModal;
