import {Platform} from 'react-native';

export default {
  POPPINS: {
    Black: 'Poppins-Black',
    BlackItalic: 'Poppins-BlackItalic',
    Bold: 'Poppins-Bold',
    BoldItalic: 'Poppins-BoldItalic',
    ExtraBold: 'Poppins-ExtraBold',
    ExtraBoldItalic: 'Poppins-ExtraBoldItalic',
    ExtraLight: 'Poppins-ExtraLight',
    ExtraLightItalic: 'Poppins-ExtraLightItalic',
    Italic: 'Poppins-Italic',
    Light: 'Poppins-Light',
    LightItalic: 'Poppins-LightItalic',
    Medium: 'Poppins-Medium',
    MediumItalic: 'Poppins-MediumItalic',
    Regular: 'Poppins-Regular',
    SemiBold: 'Poppins-SemiBold',
    SemiBoldItalic: 'Poppins-SemiBoldItalic',
    Thin: 'Poppins-Thin',
    ThinItalic: 'Poppins-ThinItalic',
  },
  SFPRODISPLAY: {
    Black:
      Platform.OS === 'ios' ? 'SFProDisplay-Black' : 'SF-Pro-Display-Black',
    BlackItalic:
      Platform.OS === 'ios'
        ? 'SFProDisplay-BlackItalic'
        : 'SF-Pro-Display-BlackItalic',
    Bold: Platform.OS === 'ios' ? 'SFProDisplay-Bold' : 'SF-Pro-Display-Bold',
    BoldItalic:
      Platform.OS === 'ios'
        ? 'SFProDisplay-BoldItalic'
        : 'SF-Pro-Display-BoldItalic',
    Heavy:
      Platform.OS === 'ios' ? 'SFProDisplay-Heavy' : 'SF-Pro-Display-Heavy',
    HeavyItalic:
      Platform.OS === 'ios'
        ? 'SFProDisplay-HeavyItalic'
        : 'SF-Pro-Display-HeavyItalic',
    Light:
      Platform.OS === 'ios' ? 'SFProDisplay-Light' : 'SF-Pro-Display-Light',
    LightItalic:
      Platform.OS === 'ios'
        ? 'SFProDisplay-LightItalic'
        : 'SF-Pro-Display-LightItalic',
    Medium:
      Platform.OS === 'ios' ? 'SFProDisplay-Medium' : 'SF-Pro-Display-Medium',
    MediumItalic:
      Platform.OS === 'ios'
        ? 'SFProDisplay-MediumItalic'
        : 'SF-Pro-Display-MediumItalic',
    Regular:
      Platform.OS === 'ios' ? 'SFProDisplay-Regular' : 'SF-Pro-Display-Regular',
    RegularItalic:
      Platform.OS === 'ios'
        ? 'SFProDisplay-RegularItalic'
        : 'SF-Pro-Display-RegularItalic',
    Semibold:
      Platform.OS === 'ios'
        ? 'SFProDisplay-Semibold'
        : 'SF-Pro-Display-Semibold',
    SemiboldItalic:
      Platform.OS === 'ios'
        ? 'SFProDisplay-SemiboldItalic'
        : 'SF-Pro-Display-SemiboldItalic',
    Thin: Platform.OS === 'ios' ? 'SFProDisplay-Thin' : 'SF-Pro-Display-Thin',
    ThinItalic:
      Platform.OS === 'ios'
        ? 'SFProDisplay-ThinItalic'
        : 'SF-Pro-Display-ThinItalic',
    Ultralight:
      Platform.OS === 'ios'
        ? 'SFProDisplay-Ultralight'
        : 'SF-Pro-Display-Ultralight',
    UltralightItalic:
      Platform.OS === 'ios'
        ? 'SFProDisplay-UltralightItalic'
        : 'SF-Pro-Display-UltralightItalic',
  },
  ROBOTO: {
    Black: 'Roboto-Black',
    BlackItalic: 'Roboto-BlackItalic',
    Bold: 'Roboto-Bold',
    BoldItalic: 'Roboto-BoldItalic',
    Italic: 'Roboto-Italic',
    Light: 'Roboto-Light',
    LightItalic: 'Roboto-LightItalic',
    Medium: 'Roboto-Medium',
    MediumItalic: 'Roboto-MediumItalic',
    Regular: 'Roboto-Regular',
    Thin: 'Roboto-Thin',
    ThinItalic: 'Roboto-ThinItalic',
  },
};
