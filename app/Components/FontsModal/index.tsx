import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useState } from "react";
import { styles } from "./style";
import fonts from "../../utils/fonts";
import { hp, rfs, rwp, wp } from "../../utils/reponsiveness";
import { COLORS } from "../../utils/colors";
import FontBox from "../FontBox";
interface FontsModalProps {
  visible?: any;
  setShowFontsModal?: any;
  seeFontStyle?: any;
  setShowEditModal?: any;

  setFontStyles: any;
  setFontFamily: any;
  fontFamily: any;
  fontStyles: any;
}
const FontsModal: React.FC<FontsModalProps> = ({
  visible,
  setShowFontsModal,
  seeFontStyle,
  setShowEditModal,
  setFontStyles,
  setFontFamily,
  fontFamily,
  fontStyles,
}) => {
  const [fontStyle, setFontStyle] = useState({
    fontStyle: fonts.ROBOTO.Bold,
    letter: "B",
  });
  const [selectFont, setSelectFont] = useState({
    name: fonts.SFPRODISPLAY.Regular,

    fontFamily: {
      regular: fonts.SFPRODISPLAY.Regular,
      bold: fonts.SFPRODISPLAY.Bold,
      italic: fonts.SFPRODISPLAY.RegularItalic,
      underline: "underline",
    },
  });

  const [fontsData, setFontsData] = useState([
    {
      name: fonts.POPPINS.Regular,
      fontFamily: {
        regular: fonts.POPPINS.Regular,
        bold: fonts.POPPINS.Bold,
        italic: fonts.POPPINS.Italic,
        underline: "underline",
      },
    },
    {
      name: fonts.SFPRODISPLAY.Regular,

      fontFamily: {
        regular: fonts.SFPRODISPLAY.Regular,
        bold: fonts.SFPRODISPLAY.Bold,
        italic: fonts.SFPRODISPLAY.RegularItalic,
        underline: "underline",
      },
    },
    {
      name: fonts.ROBOTO.Italic,
      fontFamily: {
        regular: fonts.ROBOTO.Regular,
        bold: fonts.ROBOTO.Bold,
        italic: fonts.ROBOTO.Italic,
        underline: "underline",
      },
    },
  ]);
  const [fontWeightData, setFontWeightData] = useState([
    {
      letter: "R",
      fontStyle: fonts.POPPINS.Regular,
    },
    {
      letter: "B",
      fontStyle: fonts.ROBOTO.Bold,
    },
    {
      letter: "I",
      fontStyle: fonts.ROBOTO.Italic,
    },
    { letter: "U", fontStyle: fonts.ROBOTO.Regular },
  ]);
  const selectedFontName = (item) => {
    console.log("🚀 ~ selectedFontName ~ item:", item);
    setSelectFont(item);
  };
  const SelectedFontStyle = (item) => {
    console.log("🚀 ~ SelectedStyle ~ item:", item);
    setFontStyle(item);
  };
  const fontOnPress = () => {};

  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <TouchableWithoutFeedback
        onPress={() => {
          setShowFontsModal(false);
          if (seeFontStyle) {
            setShowEditModal(true);
            return;
          }
        }}
      >
        <View style={styles.mainContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.innerContainer}>
              <Text style={styles.chooseFontsTextStyle}>Choose Font Style</Text>
              <View style={styles.barStyle}></View>
              <FlatList
                horizontal={true}
                data={fontsData}
                contentContainerStyle={styles.fontStyleFlatListContainer}
                renderItem={({ item, index }) => {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        selectedFontName(item);
                        setFontFamily(item?.name);
                        // setShowFontsModal(false);
                      }}
                    >
                      <Text
                        style={styles.availableFontStyle(
                          item,
                          selectFont,
                          seeFontStyle
                        )}
                      >
                        Hello
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
              <Text style={styles.chooseFontsTextStyle}>
                Choose Font Weight
              </Text>
              <FlatList
                data={fontWeightData}
                contentContainerStyle={styles.fontWeightFlatListContainer}
                horizontal={true}
                renderItem={({ item, index }) => {
                  console.log("ite", item);
                  return (
                    <FontBox
                      item={item}
                      key={index}
                      oddStyle={
                        fontStyle.letter == item?.letter && styles.oddFontBox
                      }
                      onPress={() => {
                        SelectedFontStyle(item);
                        setFontStyles(
                          item?.letter == "R"
                            ? "regular"
                            : item?.letter == "B"
                            ? "bold"
                            : item?.letter == "U"
                            ? "underline"
                            : "italic"
                        );
                      }}
                      oddTextStyle={
                        fontStyle?.letter == item?.letter &&
                        styles.oddFontBoxTextStyle
                      }
                    />
                  );
                }}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default FontsModal;
