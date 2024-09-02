import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ImageBackground, Image, TextInput } from 'react-native';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import COLORS from '../constants/colors';
import { firestore } from '../config/firebase';
import { useFocusEffect } from '@react-navigation/native';

const CartScreen = ({ route, navigation }) => {
  const [cart, setCart] = useState(route.params?.cart || []);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useFocusEffect(
    useCallback(() => {
      // Update the cart when the screen is focused
      if (route.params?.cart) {
        setCart(route.params.cart);
      }
    }, [route.params?.cart])
  );

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const itemPrice = parseFloat(item.price.replace('Php', '').replace(',', '')) || 0;
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const removeItem = useCallback((id) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: () => {
            const updatedCart = cart.filter(item => item.id !== id);
            setCart(updatedCart);
            navigation.setParams({ cart: updatedCart });
          },
        },
      ]
    );
  }, [cart, navigation]);

  const updateQuantity = useCallback((id, increment) => {
    const updatedCart = cart.map(item => {
      if (item.id === id) {
        const newQuantity = increment ? item.quantity + 1 : item.quantity - 1;
        return { ...item, quantity: Math.max(1, newQuantity) };
      }
      return item;
    });
    setCart(updatedCart);
    navigation.setParams({ cart: updatedCart });
  }, [cart, navigation]);

  const handleCheckout = async () => {
    Alert.alert(
      'Confirm Checkout',
      `Are you sure you want to place your order with payment method: ${paymentMethod}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: async () => {
            try {
              await addDoc(collection(firestore, 'orders'), {
                items: cart,
                total: calculateTotal(),
                paymentMethod,
                createdAt: serverTimestamp(),
              });
              Alert.alert('Checkout', 'Your order has been placed successfully!');
              setCart([]);  // Clear the cart in the state
              navigation.setParams({ cart: [] }); // Clear the cart in the navigation params
              navigation.navigate('HomeScreen'); // Navigate to HomeScreen or any other screen
            } catch (error) {
              Alert.alert('Checkout Error', 'There was an issue placing your order. Please try again.');
              console.error('Firestore error: ', error);
            }
          },
        },
      ]
    );
  };

  const renderItem = useCallback(({ item }) => {
    const price = parseFloat(item.price.replace('Php', '').replace(',', '')) || 0;

    return (
      <View style={styles.cartItem}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        {item.type === 'description' && item.description && (
          <Text style={styles.cartItemDescription}>Description: {item.description}</Text>
        )}
        {item.type === 'option' && item.option && (
          <Text style={styles.cartItemOption}>Option: {item.option}</Text>
        )}
        <Text style={styles.cartItemPrice}>Price: Php{price.toFixed(2)}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={() => updateQuantity(item.id, false)} style={styles.quantityButton}>
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => updateQuantity(item.id, true)} style={styles.quantityButton}>
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeButton}>
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    );
  }, [updateQuantity, removeItem]);

  return (
    <ImageBackground source={require('../assets/shoppingcart.jpg')} style={styles.backgroundImage}>
      <View style={styles.container}>
        <Text style={styles.title}>Your Cart</Text>
        {cart.length > 0 ? (
          <>
            <FlatList
              data={cart}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.cartContainer}
            />
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total: Php{calculateTotal().toFixed(2)}</Text>
            </View>
            <View style={styles.paymentMethodContainer}>
              <Text style={styles.paymentMethodTitle}>Select Payment Method:</Text>
              <TouchableOpacity onPress={() => setPaymentMethod('cash')} style={[styles.paymentMethodButton, paymentMethod === 'cash' && styles.selectedPaymentMethod]}>
                <Text style={styles.paymentMethodText}>Cash</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPaymentMethod('gcash')} style={[styles.paymentMethodButton, paymentMethod === 'gcash' && styles.selectedPaymentMethod]}>
                <Image source={require('../assets/gcash.png')} style={styles.gcashLogo} />
                <Text style={styles.paymentMethodText}>GCash</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutText}>Checkout</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.emptyCartContainer}>
            <Text style={styles.emptyCartText}>Your cart is empty.</Text>
          </View>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
  },
  cartItem: {
    backgroundColor: COLORS.lightGrey,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  cartItemName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cartItemDescription: {
    fontSize: 16,
    color: 'black',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 5,
    borderRadius: 5,
    marginVertical: 5,
  },
  cartItemOption: {
    fontSize: 16,
    color: 'black',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 5,
    borderRadius: 5,
    marginVertical: 5,
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  quantityButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  quantityButtonText: {
    color: 'white',
    fontSize: 18,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  removeButton: {
    marginTop: 10,
    backgroundColor: COLORS.danger,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    borderColor: 'black',
    borderWidth: 2,
    elevation: 3,
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  totalContainer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.grey,
    paddingBottom: 20,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.primary,
  },
  paymentMethodContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  paymentMethodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.primary,
  },
  paymentMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#E0F7FA', // Light cyan background
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#B2EBF2', // Light cyan border
  },
  selectedPaymentMethod: {
    backgroundColor: '#B2EBF2', // Light cyan background for selected
  },
  paymentMethodText: {
    fontSize: 16,
    marginLeft: 10,
    color: COLORS.primary,
  },
  gcashLogo: {
    width: 40,
    height: 40,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 18,
    color: COLORS.primary,
  },
});

export default CartScreen;
