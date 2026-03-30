import React from "react";
import { View, ImageBackground, StyleSheet } from "react-native";
import Svg, { Rect, Line, ForeignObject } from "react-native-svg";

const OpenBook = ({ imageBackground, backgroundColor, children }) => {
  const leftChildren = React.Children.toArray(children).filter(
    (child) => child.props.position === "left"
  );
  const rightChildren = React.Children.toArray(children).filter(
    (child) => child.props.position === "right"
  );

  return (
    <View style={[styles.container, { backgroundColor: "white" }]}>
      <Svg height="100%" width="100%" viewBox="0 0 200 100">
        <Rect x="0" y="0" width="100" height="100" fill="none" />
        <Rect x="100" y="0" width="100" height="100" fill="none" />
        <Rect
          x="0"
          y="0"
          width="200"
          height="100"
          fill="none"
          stroke="black"
          strokeWidth="2"
        />
        <Line
          x1="100"
          y1="0"
          x2="100"
          y2="100"
          stroke="black"
          strokeWidth="2"
        />

        <ForeignObject x="5" y="5" width="90" height="90">
          <View style={styles.foreignObject}>{leftChildren}</View>
        </ForeignObject>

        <ForeignObject x="105" y="5" width="90" height="90">
          <View style={styles.foreignObject}>{rightChildren}</View>
        </ForeignObject>
      </Svg>
      <ImageBackground
        source={{ uri: imageBackground }}
        style={styles.imageBackground}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  foreignObject: {
    flex: 1,
  },
  imageBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    opacity: 0.5,
  },
});

export default OpenBook;
