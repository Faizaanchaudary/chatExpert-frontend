import { Dimensions, PixelRatio, Platform } from "react-native";

const WINDOW_WIDTH = Dimensions.get("window").width;
const WINDOW_HEIGHT = Dimensions.get("window").height;

const _height = Dimensions.get("window").height;
const _width = Dimensions.get("window").width;
const IS_IPHONE_X = !!(
  Platform.OS === "ios" &&
  (_height > 800 || _width > 800)
);

const IS_IPHONE = !!(Platform.OS === "ios");

const widthPercentageToDP = (widthPercent: any) => {
  const elemWidth =
    typeof widthPercent === "number" ? widthPercent : parseFloat(widthPercent);

  return PixelRatio.roundToNearestPixel((WINDOW_WIDTH * elemWidth) / 100);
};

const heightPercentageToDP = (heightPercent: any) => {
  const elemHeight =
    typeof heightPercent === "number"
      ? heightPercent
      : parseFloat(heightPercent);

  return PixelRatio.roundToNearestPixel((WINDOW_HEIGHT * elemHeight) / 100);
};

const DesignWidth = 375;
const DesignHeight = 812;

const DeviceWidth = Dimensions.get("window").width;
const DeviceHeight = Dimensions.get("window").height;

const DeviceWidthRatioDesignWidth = DeviceWidth / DesignWidth;
const DeviceHeightRatioDesignHeight = DeviceHeight / DesignHeight;

const ResponsiveWidth = (width: any) => {
  return PixelRatio.roundToNearestPixel(width * DeviceWidthRatioDesignWidth);
};

const ResponsiveHeight = (height: any) => {
  return PixelRatio.roundToNearestPixel(height * DeviceHeightRatioDesignHeight);
};

const ResponsiveFontSize = (fontSize: any) => {
  return PixelRatio.roundToNearestPixel(
    fontSize * DeviceHeightRatioDesignHeight
  );
};

const validateEmail = (email: any) => {
  return email
    .toLowerCase()
    .match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/);
};

export {
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
  ResponsiveWidth as rwp,
  ResponsiveHeight as rhp,
  ResponsiveFontSize as rfs,
  _height as height,
  _width as width,
  IS_IPHONE_X,
  IS_IPHONE,
  validateEmail,
};
