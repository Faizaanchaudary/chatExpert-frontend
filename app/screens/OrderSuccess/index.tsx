import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import CustomHeader from '../../Components/CustomHeader';
import CustomButton from '../../Components/CustomButton';
import { COLORS } from '../../utils/colors';
import { hp, wp, rfs } from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';

interface OrderSuccessProps {
  navigation?: any;
  route?: any;
}

const OrderSuccess: React.FC<OrderSuccessProps> = ({ navigation, route }) => {
  const { orderId, photoBookId } = route?.params || {};

  return (
    <View style={styles.container}>
      <CustomHeader text="Order Successful" onPress={() => navigation.goBack()} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>Order Placed Successfully!</Text>
          <Text style={styles.successMessage}>
            Your photo book order has been placed and is being processed.
          </Text>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Order Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order ID:</Text>
            <Text style={styles.detailValue}>{(orderId || 'N/A').slice(-8)}</Text>
          </View>
          <View style={styles.fullOrderIdRow}>
            <Text style={styles.fullOrderIdLabel}>Full Order ID:</Text>
            <Text style={styles.fullOrderIdValue} numberOfLines={2} ellipsizeMode="middle">
              {orderId || 'N/A'}
            </Text>
          </View>
          <Text style={styles.infoText}>
            You will receive an email confirmation shortly. You can track your order
            status in the Order History section.
          </Text>
        </View>

        <CustomButton
          text="View Order History"
          onPress={() => navigation.navigate('OrderHistory')}
        />
        <CustomButton
          text="Continue Shopping"
          onPress={() => navigation.navigate('BottomTab', { screen: 'ShopTab' })}
          oddTextStyle={styles.secondaryButtonText}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: wp(5),
  },
  successContainer: {
    alignItems: 'center',
    marginVertical: hp(5),
  },
  successIcon: {
    fontSize: rfs(80),
    color: COLORS.green,
    marginBottom: hp(2),
  },
  successTitle: {
    fontSize: rfs(28),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.textBlack,
    marginBottom: hp(1),
    textAlign: 'center',
  },
  successMessage: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textGray,
    textAlign: 'center',
    marginTop: hp(1),
  },
  detailsContainer: {
    backgroundColor: COLORS.lightGray,
    borderRadius: wp(2),
    padding: wp(4),
    marginBottom: hp(3),
  },
  detailsTitle: {
    fontSize: rfs(20),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.textBlack,
    marginBottom: hp(2),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hp(1),
  },
  detailLabel: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textBlack,
  },
  detailValue: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.textBlack,
  },
  fullOrderIdRow: {
    marginTop: hp(1),
    paddingVertical: hp(1),
  },
  fullOrderIdLabel: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textGray,
    marginBottom: hp(0.5),
  },
  fullOrderIdValue: {
    fontSize: rfs(12),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textBlack,
    backgroundColor: COLORS.white,
    padding: wp(2),
    borderRadius: wp(1),
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  infoText: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textGray,
    marginTop: hp(2),
    lineHeight: rfs(20),
  },
  secondaryButtonText: {
    backgroundColor: COLORS.lightGray,
    color: COLORS.textBlack,
  },
});

export default OrderSuccess;
