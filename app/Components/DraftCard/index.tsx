import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import React from "react";
import { styles } from "./style";
import { img } from "../../assets/img";
import { icn } from "../../assets/icons";
import { hp, wp } from "../../utils/reponsiveness";
import { useDispatch } from "react-redux";
import { deleteChat } from "../../store/Slice/userSlice";

interface DraftCardProps {
  item?: any;
  length?: number;
  continuePress?: () => void;
}
const DraftCard: React.FC<DraftCardProps> = ({
  item,
  continuePress,
  length,
}) => {
  const dispatch = useDispatch();

  const handleDelete = () => {
    Alert.alert("Delete Draft", "Are you sure you want to delete this draft?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => dispatch(deleteChat(item.id)),
        style: "destructive",
      },
    ]);
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.textImageContainer}>
        <Image source={img.draftImg} style={styles.imgStyle} />
        <View style={styles.textContainer}>
          <Text style={styles.photoBookTextStyle}>{item?.bookNumber}</Text>
          <Text style={styles.pagesTextStyle}>{length + " pages"}</Text>
          <Text style={styles.dateTextStyle}>{item?.date}</Text>
        </View>
      </View>

      <View style={styles.touchableContainer}>
        <TouchableOpacity onPress={handleDelete}>
          <Image source={icn.deleteIcn} style={styles.deleteIcnStyle} />
        </TouchableOpacity>
        <TouchableOpacity onPress={continuePress}>
          <Text style={styles.continueTextStyle}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DraftCard;
