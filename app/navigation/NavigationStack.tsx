import {StyleSheet} from 'react-native';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Splash from '../screens/Splash';
import LogIn from '../screens/LogIn';
import CreateAccount from '../screens/CreateAccount';
import LostYourPassword from '../screens/LostYourPassword';
import CreateNewPassword from '../screens/CreateNewPassword';
import BottomTabNavigation from './BottomTabNavigation';
import ChooseFormat from '../screens/ChooseFormat';
import CreateYourDesign from '../screens/CreateYourDesign';
import ContactUs from '../screens/ContactUs';
import EditProfile from '../screens/EditProfile';
import Addresses from '../screens/Addresses';
import AddAnAddress from '../screens/AddAnAddress';
import CartDetail from '../screens/CartDetail';
import PayMentMethod from '../screens/PayMentMethod';
import MyOrders from '../screens/MyOrders';
import PurchaseSuccessful from '../screens/PurchaseSuccessful';
import WaitLoader from '../screens/WaitLoader';
import BookList from '../screens/BookList';
import CartProducts from '../screens/CartProducts';
import EBookPurchase from '../screens/EBookPurchase';
import EditPhotos from '../screens/EditPhotos';
import Chat from '../screens/Chat/chat';
import PageSelection from '../screens/PageSelection';
import PhotoBookPreview from '../screens/PhotoBookPreview';
import OrderSuccess from '../screens/OrderSuccess';
import OrderHistory from '../screens/OrderHistory';

const Stack = createNativeStackNavigator();

const NavigationStack = () => {
  return (
    <NavigationContainer
    // onStateChange={state => {
    //   console.log('state', state);
    // }}
    >
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{gestureEnabled: false, headerShown: false}}>
        <Stack.Screen component={Splash} name="Splash" />
        <Stack.Screen component={LogIn} name="LogIn" />
        <Stack.Screen component={CreateAccount} name="CreateAccount" />
        <Stack.Screen component={LostYourPassword} name="LostYourPassword" />
        <Stack.Screen component={CreateNewPassword} name="CreateNewPassword" />
        <Stack.Screen component={BottomTabNavigation} name="BottomTab" />
        <Stack.Screen component={ChooseFormat} name="ChooseFormat" />
        <Stack.Screen component={CreateYourDesign} name="CreateYourDesign" />
        <Stack.Screen component={ContactUs} name="ContactUs" />
        <Stack.Screen component={EditProfile} name="EditProfile" />
        <Stack.Screen component={Addresses} name="Addresses" />
        <Stack.Screen component={AddAnAddress} name="AddAnAddress" />
        <Stack.Screen component={CartDetail} name="CartDetail" />
        <Stack.Screen component={PayMentMethod} name="PayMentMethod" />
        <Stack.Screen component={MyOrders} name="MyOrders" />
        <Stack.Screen component={WaitLoader} name="WaitLoader" />
        <Stack.Screen component={BookList} name="BookList" />
        <Stack.Screen
          component={PurchaseSuccessful}
          name="PurchaseSuccessful"
        />
        <Stack.Screen component={CartProducts} name="CartProducts" />
        <Stack.Screen component={EBookPurchase} name="EbookPurchase" />
        <Stack.Screen component={EditPhotos} name="EditPhotos" />
        <Stack.Screen component={Chat} name="Chat" />
        <Stack.Screen component={PageSelection} name="PageSelection" />
        <Stack.Screen component={PhotoBookPreview} name="PhotoBookPreview" />
        <Stack.Screen component={OrderSuccess} name="OrderSuccess" />
        <Stack.Screen component={OrderHistory} name="OrderHistory" />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default NavigationStack;

const styles = StyleSheet.create({});
