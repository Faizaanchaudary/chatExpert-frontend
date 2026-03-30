import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import CustomHeader from '../../Components/CustomHeader';
import { COLORS } from '../../utils/colors';
import { hp, wp, rfs } from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';
import { getOrderHistory } from '../../services/photoBookApi';
import { GelatoOrder } from '../../services/photoBookApi';

interface OrderHistoryProps {
  navigation?: any;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ navigation }) => {
  const [orders, setOrders] = useState<GelatoOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await getOrderHistory();
      setOrders(response.data.data);
    } catch (error: any) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      created: COLORS.blue,
      passed: COLORS.blue,
      in_production: COLORS.orange,
      shipped: COLORS.purple,
      delivered: COLORS.green,
      failed: COLORS.red,
      canceled: COLORS.gray,
    };
    return statusColors[status] || COLORS.gray;
  };

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderOrderItem = ({ item }: { item: GelatoOrder }) => {
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetails', { orderId: item._id })}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>
            Order #{item.orderReferenceId.slice(-8)}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.fulfillmentStatus) },
            ]}
          >
            <Text style={styles.statusText}>
              {formatStatus(item.fulfillmentStatus)}
            </Text>
          </View>
        </View>
        <View style={styles.orderDetails}>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          {item.trackingCode && (
            <Text style={styles.trackingText}>
              Tracking: {item.trackingCode}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <CustomHeader text="Order History" onPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.lightBlue} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader text="Order History" onPress={() => navigation.goBack()} />
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: wp(5),
  },
  orderCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: wp(2),
    padding: wp(4),
    marginBottom: hp(2),
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  orderId: {
    fontSize: rfs(18),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.textBlack,
  },
  statusBadge: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: wp(1),
  },
  statusText: {
    fontSize: rfs(12),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.white,
  },
  orderDetails: {
    marginTop: hp(1),
  },
  orderDate: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textGray,
  },
  trackingText: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textBlack,
    marginTop: hp(0.5),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(10),
  },
  emptyText: {
    fontSize: rfs(18),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textGray,
  },
});

export default OrderHistory;
