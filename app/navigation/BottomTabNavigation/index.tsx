import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Image, Text } from "react-native";
import { useMediaContext } from "rn-declarative";
import { icn } from "../../assets/icons";
import MyOrders from "../../screens/MyOrders";
import CartTab from "../../screens/Tabs/CartTab";
import DraftTab from "../../screens/Tabs/DraftTab";
import ProfileTab from "../../screens/Tabs/ProfileTab";
import ShopTab from "../../screens/Tabs/ShopTab";
import { COLORS } from "../../utils/colors";
import { wp } from "../../utils/reponsiveness";
import { styles } from "./style";
import CartProducts from "../../screens/CartProducts";

interface BottomTabNavigationProps {
  navigation?: any;
}
const Stack = createNativeStackNavigator();
const OrderStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Profile"
    >
      <Stack.Screen name="Profile" component={ProfileTab} />
      <Stack.Screen name="MyOrder" component={MyOrders} />
    </Stack.Navigator>
  );
};
const BottomTabNavigation: React.FC<BottomTabNavigationProps> = ({
  navigation,
}) => {
  const Tab = createBottomTabNavigator();
  const { isPhone, isTablet, isDesktop } = useMediaContext();

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabelStyle,
          tabBarHideOnKeyboard: true,
          tabBarShowLabel: false,
        }}
      >
        <Tab.Screen
          name="ShopTab"
          component={ShopTab}
          options={{
            tabBarLabel: "Shop",
            headerShown: false,
            tabBarIcon: ({ focused }) => {
              return (
                <>
                  <Image
                    source={focused ? icn.blueCircle : icn.shopIcn}
                    style={
                      focused ? styles.blueCircleStyle : styles.tabIcnStyle
                    }
                  />
                  {focused && (
                    <Text
                      style={
                        focused
                          ? [
                              styles.tabBarLabelStyle,
                              {
                                width: isTablet ? wp(6) : undefined,
                                textAlign: "center",
                              },
                            ]
                          : { color: COLORS.textBlack }
                      }
                    >
                      Shop
                    </Text>
                  )}
                </>
              );
            },
          }}
        />
        <Tab.Screen
          name="DraftTab"
          component={DraftTab}
          options={{
            tabBarLabel: "Draft",
            headerShown: false,
            tabBarIcon: ({ focused }) => {
              return (
                <>
                  <Image
                    source={focused ? icn.blueCircle : icn.draftIcn}
                    style={
                      focused ? styles.blueCircleStyle : styles.tabIcnStyle
                    }
                  />
                  {focused && (
                    <Text
                      style={
                        focused
                          ? [
                              styles.tabBarLabelStyle,
                              {
                                width: isTablet ? wp(6) : undefined,
                                textAlign: "center",
                              },
                            ]
                          : { color: COLORS.textBlack }
                      }
                    >
                      Draft
                    </Text>
                  )}
                </>
              );
            },
          }}
        />
        <Tab.Screen
          name="CartTab"
          component={CartProducts}
          options={{
            tabBarLabel: "Cart",
            headerShown: false,
            tabBarIcon: ({ focused }) => {
              return (
                <>
                  <Image
                    source={focused ? icn.blueCircle : icn.craftIcn}
                    style={
                      focused ? styles.blueCircleStyle : styles.tabIcnStyle
                    }
                  />
                  {focused && (
                    <Text
                      style={
                        focused
                          ? [
                              styles.tabBarLabelStyle,
                              {
                                width: isTablet ? wp(6) : undefined,
                                textAlign: "center",
                              },
                            ]
                          : { color: COLORS.textBlack }
                      }
                    >
                      Craft
                    </Text>
                  )}
                </>
              );
            },
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={OrderStack}
          options={{
            tabBarLabel: "Profile",
            headerShown: false,
            unmountOnBlur: true,
            tabBarIcon: ({ focused }) => {
              return (
                <>
                  <Image
                    source={focused ? icn.blueCircle : icn.profileIcn}
                    style={
                      focused ? styles.blueCircleStyle : styles.tabIcnStyle
                    }
                  />
                  {focused && (
                    <Text
                      style={
                        focused
                          ? [
                              styles.tabBarLabelStyle,
                              {
                                width: isTablet ? wp(6) : undefined,
                                textAlign: "center",
                              },
                            ]
                          : { color: COLORS.textBlack }
                      }
                    >
                      Profile
                    </Text>
                  )}
                </>
              );
            },
          }}
          listeners={({ navigation, route }: any) => ({
            tabPress: (e) => {
              // Check if we're already on the Profile screen
              const isOnProfileScreen = route?.state?.index === 0;

              if (!isOnProfileScreen) {
                // Reset the stack to show Profile screen
                navigation.reset({
                  index: 0,
                  routes: [{ name: "ProfileTab" }],
                });
              }
            },
          })}
        />
      </Tab.Navigator>
    </>
  );
};

export default BottomTabNavigation;
