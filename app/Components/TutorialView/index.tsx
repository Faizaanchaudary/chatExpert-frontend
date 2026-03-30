import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Platform,
  Dimensions,
} from "react-native";
import { hp, wp } from "../../utils/reponsiveness";
import { useMediaContext } from "rn-declarative";

const TutorialView = (props) => {
  const scrollRef = useRef();
  const { isPhone, isTablet } = useMediaContext();

  const views =
    Platform.OS === "ios"
      ? [
          {
            heading: "Export from Whatsapp",
            image: require("./../../assets/img/aa.png"),
          },
          {
            heading: "How it works",
            image: require("./../../assets/img/bb.png"),
          },
          {
            heading: "How it works",
            image: require("./../../assets/img/cc.png"),
            text: "This is view 3",
          },
          {
            heading: "How it works",
            image: require("./../../assets/img/dd.png"),
            text: "This is view 4",
          },
          {
            heading: "How it works",
            image: require("./../../assets/img/ee.png"),
            text: "This is view 5",
          },
          {
            heading: "How it works",
            image: require("./../../assets/img/ff.png"),
            text: "This is view 6",
          },
          {
            heading: "How it works",
            image: require("./../../assets/img/gg.png"),
            text: "This is view 7",
          },
          { heading: "", text: "" },
        ]
      : [
          {
            heading: "Export from Whatsapp",
            image: require("./../../assets/img/aa.png"),
          },
          {
            heading: "How it works",
            image: require("./../../assets/img/bb.png"),
          },
          {
            heading: "How it works",
            image: require("./../../assets/img/ccc.png"),
            text: "Select the chat, you want to export",
          },
          {
            heading: "How it works",
            image: require("./../../assets/img/ddd.png"),
            text: "Click on 3 dots icon and click More from drop down",
          },
          {
            heading: "How it works",
            image: require("./../../assets/img/eee.png"),
            text: "Tap on export chat",
          },
          {
            heading: "How it works",
            image: require("./../../assets/img/extra.png"),
            text: "Select whether you export it with media or without media",
          },
          {
            heading: "How it works",
            image: require("./../../assets/img/ggg.png"),
            text: "Select Message book app to start the export",
          },
          { heading: "", text: "" },
        ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x /
        event.nativeEvent.layoutMeasurement.width
    );
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < views.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
      if (scrollRef?.current) {
        scrollRef?.current.scrollToIndex({
          animated: false,
          index: currentIndex + 1,
        });
      }
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
      if (scrollRef?.current) {
        scrollRef?.current.scrollToIndex({
          animated: false,
          index: currentIndex - 1,
        });
      }
    }
  };

  useEffect(() => {
    if (currentIndex === views.length - 1) {
      props?.onDismiss();
    }
  }, [currentIndex]);

  const renderItem = ({ item, index }) => (
    <View
      style={{
        width: Dimensions.get("window").width,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View style={{ position: "absolute", top: 20, left: 20 }}>
        <Text style={{ fontSize: 24, color: "black" }}>{item.heading}</Text>
      </View>

      <Text
        style={{
          fontSize: 18,
          color: "black",
          position: "absolute",
          top: hp(8),
        }}
      >
        {item.text}
      </Text>

      {index === 0 || index === 1 ? (
        <ImageBackground
          source={item.image}
          style={{
            width: "97%",
            marginLeft: "3.5%",
            height: "53%",
            alignItems: "center",
            alignSelf: "center",
          }}
          resizeMode="stretch"
        >
          <Text
            style={{
              color: "white",
              zIndex: 200,
              fontSize: 20,
              fontWeight: "300",
              textAlign: "center",
              width: "80%",
              marginTop: index === 0 ? "4%" : "12%",
              marginBottom: "10%",
            }}
          >
            {index === 0
              ? "Chat Book will export your chat into well-designed printing book"
              : "These Slides will guide you how to export chat with the chat book. Later you will be able to print it"}
          </Text>
        </ImageBackground>
      ) : (
        <Image
          source={item.image}
          style={{
            width: "90%",
            height: isTablet ? "70%" : "100%",
            resizeMode: "contain",
          }}
        />
      )}
    </View>
  );

  return (
    <Modal visible={props?.visible} transparent={true} animationType="slide">
      <View style={{ flex: 1, backgroundColor: "rgb(222,213,204)" }}>
        <FlatList
          data={views}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          ref={scrollRef}
          pagingEnabled
          onScroll={handleScroll}
          showsHorizontalScrollIndicator={false}
          extraData={currentIndex}
        />
        <View
          style={{
            position: "absolute",
            bottom: 60,
            alignSelf: "center",
            flexDirection: "row",
          }}
        >
          <TouchableOpacity
            onPress={handleBack}
            disabled={currentIndex === 0}
            style={{
              padding: 10,
              marginHorizontal: 20,
              backgroundColor: currentIndex === 0 ? "gray" : "green",
              borderRadius: 5,
            }}
          >
            <Text style={{ color: "white", fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleNext}
            disabled={currentIndex === views.length - 1}
            style={{
              padding: 10,
              marginHorizontal: 20,
              backgroundColor:
                currentIndex === views.length - 1 ? "gray" : "green",
              borderRadius: 5,
            }}
          >
            <Text style={{ color: "white", fontSize: 16 }}>Next</Text>
          </TouchableOpacity>
        </View>
        <View style={{ position: "absolute", bottom: 20, alignSelf: "center" }}>
          <View style={{ flexDirection: "row" }}>
            {views.map((view, index) => (
              <View
                key={index}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  margin: 5,
                  backgroundColor:
                    index <= currentIndex
                      ? "rgba(54, 182, 35, 1)"
                      : "rgba(0, 0, 0, 0.25)",
                }}
              />
            ))}
            <View
              style={{
                height: 14,
                borderRadius: 10,
                backgroundColor: "rgba(54, 182, 35, 1)",
                position: "absolute",
                top: 3,
                left: 0,
                width: ((currentIndex + 1) / views.length) * 100 + "%",
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TutorialView;
