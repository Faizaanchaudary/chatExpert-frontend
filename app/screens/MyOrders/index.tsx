import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { styles } from "./style";
import { icn } from "../../assets/icons";
import OrderCard from "../../Components/OrderCard";
import { getOrderHistory } from "../../services/photoBookApi";
import { GelatoOrder } from "../../services/photoBookApi";

interface MyOrdersProps {
  navigation?: any;
  route?: any;
}

// Map API order to OrderCard format
function mapOrderToCard(order: GelatoOrder & { photoBookId?: { totalPrice?: number; format?: string } }): {
  deliveryNumber: string;
  price: string;
  photoBookSize: string;
  photoBookSize2: string;
  addressLine: string;
  country: string;
  city: string;
  orderDate: string;
  deliveryDate: string;
  orderId: string;
} {
  const orderId = order.orderReferenceId?.slice(-8) || order._id?.slice(-8) || "—";
  const price = order.photoBookId?.totalPrice != null
    ? `$${Number(order.photoBookId.totalPrice).toFixed(2)}`
    : "—";
  const formatLabel = order.photoBookId?.format === "standard_14_8x21"
    ? "14.8×21 cm"
    : order.photoBookId?.format === "square_14x14"
      ? "14×14 cm"
      : "Photo Book";
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "—";
  const deliveryDate = order.fulfillmentStatus === "delivered" && order.updatedAt
    ? new Date(order.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : order.fulfillmentStatus === "shipped"
      ? "In transit"
      : "Pending";

  return {
    deliveryNumber: `Delivery #${orderId}`,
    price,
    photoBookSize: `Photo Book (${formatLabel})`,
    photoBookSize2: `Status: ${(order.fulfillmentStatus || "—").replace(/_/g, " ")}`,
    addressLine: "See order details",
    country: "—",
    city: "—",
    orderDate,
    deliveryDate,
    orderId: order._id,
  };
}

const MyOrders: React.FC<MyOrdersProps> = ({ navigation, route }) => {
  const isLoader = route?.params?.isLoader;
  const [orders, setOrders] = useState<(GelatoOrder & { photoBookId?: { totalPrice?: number; format?: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async () => {
    try {
      const response = await getOrderHistory(1, 50);
      const list = response?.data?.data ?? [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("Failed to load orders:", e);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const cardData = orders.map(mapOrderToCard);

  return (
    <View style={styles.mainContainer}>
      {isLoader ? (
        <Text style={styles.orderTextStyle}>Orders</Text>
      ) : (
        <View style={styles.innerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={icn.backArrowIcn} style={styles.icnStyle} />
          </TouchableOpacity>
          <Text style={styles.textStyle}>Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate("ContactUs")}>
            <Text style={styles.helpTextStyle}>Help?</Text>
          </TouchableOpacity>
        </View>
      )}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4688BA" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : cardData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No orders yet</Text>
          <Text style={styles.emptySubtext}>Your orders will appear here</Text>
          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={() => navigation.navigate("BottomTab", { screen: "ShopTab" })}
          >
            <Text style={styles.buttonSecondaryText}>Go to Shop</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {cardData.map((item, index) => (
            <TouchableOpacity
              key={item.orderId || index}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("OrderHistory")}
            >
              <OrderCard item={item} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default MyOrders;
