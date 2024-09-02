import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView, TextInput, Modal, Button, Alert, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Sample data
const categories = ['All', 'Starter Pack', 'Beverages', 'Snacks', 'Dry Goods', 'Canned Goods', 'Condiments and Sauces', 'Cleaning Supplies', 'Personal Care'];

const products = [
  { id: '8', name: 'A1', category: 'Starter Pack', price: 'Php5000', image: require('../assets/A1.jpg'), description: '3 pack of Pancit Canton, 10 Sardines, 1 sack of Rice', type: 'description' },
  { id: '9', name: 'A2', category: 'Starter Pack', price: 'Php5500', image: require('../assets/A1.jpg'), description: '3 pack of Pancit Canton, 10 Sardines, 1 sack of Rice', type: 'description' },
  { id: '10', name: 'A3', category: 'Starter Pack', price: 'Php6000', image: require('../assets/A1.jpg'), description: '3 pack of Pancit Canton, 10 Sardines, 1 sack of Rice', type: 'description' },
  { id: '11', name: 'A4', category: 'Starter Pack', price: 'Php6500', image: require('../assets/A1.jpg'), description: '3 pack of Pancit Canton, 10 Sardines, 1 sack of Rice', type: 'description' },
  { id: '12', name: 'A5', category: 'Starter Pack', price: 'Php7000', image: require('../assets/A1.jpg'), description: '3 pack of Pancit Canton, 10 Sardines, 1 sack of Rice', type: 'description' },
  { id: '13', name: 'A6', category: 'Starter Pack', price: 'Php7500', image: require('../assets/A1.jpg'), description: '3 pack of Pancit Canton, 10 Sardines, 1 sack of Rice', type: 'description' },
  { id: '1', name: 'Pancit Canton', category: 'Snacks', price: 'Php102', image: require('../assets/canton.webp'), options: ['Spicy', 'Regular', 'Extra Spicy', 'Chilimansi'], type: 'option' },
  { id: '2', name: 'Soft drinks', category: 'Beverages', price: 'Php89', image: require('../assets/softdrinks.png'), options: ['CocaCola', 'Pepsi', 'Royal', '7up', 'Mirinda'], type: 'option' },
  { id: '3', name: 'Bottled water 320ml(per box)', category: 'Beverages', price: 'Php350', image: require('../assets/bottledwater.jpg') },
  { id: '4', name: 'Juice', category: 'Beverages', price: 'Php155', image: require('../assets/canton.webp'), options: ['Grape', 'Mango', 'Pineapple', 'Lemon'], type: 'option' },
  { id: '5', name: 'Coffee', category: 'Beverages', price: 'Php129', image: require('../assets/kape.jpg'), options: ['Kopiko', 'Nescafé', 'Barako'], type: 'option' },
  { id: '6', name: 'Emperador Lights(750ml)', category: 'Beverages', price: 'Php159', image: require('../assets/emperadorlight.webp') },
  { id: '7', name: 'Emperador Lights(1L)', category: 'Beverages', price: 'Php209', image: require('../assets/emperador1L.jpg') },
];

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [selectedOption, setSelectedOption] = useState(null);

  // Filter products based on category and search query
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesQuery = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
  };

  // Adds the selected product to the cart
  const addToCart = () => {
    if (selectedProduct) {
      const newItem = { 
        ...selectedProduct, 
        quantity: parseInt(quantity), 
        option: selectedOption || 'No Option Selected' 
      };
      const updatedCart = [...cart, newItem];
      
      Alert.alert(
        'Add to Cart',
        `${selectedProduct.name} with quantity ${quantity} ${selectedOption ? `and option ${selectedOption}` : ''} will be added to your cart.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: () => {
              setCart(updatedCart);
              Alert.alert('Added to Cart', `${selectedProduct.name} with quantity ${quantity} ${selectedOption ? `and option ${selectedOption}` : ''} has been added to your cart.`);
              setModalVisible(false);
              setQuantity('1');
              setSelectedOption(null); // Reset option when adding to cart
              navigation.navigate('CartScreen', { cart: updatedCart });
            },
          },
        ]
      );
    } else {
      Alert.alert('Error', 'Please select a product.');
    }
  };

  // Renders options for a product with options
  const renderOptions = () => {
    if (selectedProduct && selectedProduct.options) {
      return (
        <View style={styles.optionsContainer}>
          {selectedProduct.options.map(option => (
            <TouchableOpacity
              key={option}
              style={[styles.optionButton, selectedOption === option && styles.selectedOptionButton]}
              onPress={() => setSelectedOption(option)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }
    return null;
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity 
      style={[styles.categoryButton, selectedCategory === item && styles.selectedCategoryButton]}
      onPress={() => handleCategoryPress(item)}
    >
      <Text style={styles.categoryText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard} 
      onPress={() => {
        setSelectedProduct(item);
        setModalVisible(true);
        setSelectedOption(null); // Reset option when selecting a new product
      }}
    >
      <Image source={item.image} style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground source={require('../assets/onlinegrocery.jpg')} style={styles.backgroundImage}>
      <LinearGradient colors={['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.8)']} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.storeName}>Grocery Store</Text>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#000" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <ScrollView style={styles.body}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
          <Text style={styles.sectionTitle}>Products</Text>
          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.productList}
          />
        </ScrollView>

        <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('CartScreen', { cart })}>
          <Ionicons name="cart" size={24} color="#fff" />
          <Text style={styles.cartText}>View Cart</Text>
        </TouchableOpacity>

        {selectedProduct && (
          <Modal
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
                <Text style={styles.modalSubtitle}>{selectedProduct.price}</Text>
                <Image source={selectedProduct.image} style={styles.productImage} />
                <Text>{selectedProduct.description}</Text>
                {selectedProduct.options && renderOptions()}
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => setQuantity((prev) => Math.max(1, parseInt(prev) - 1).toString())}
                  >
                    <Text>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => setQuantity((prev) => (parseInt(prev) + 1).toString())}
                  >
                    <Text>+</Text>
                  </TouchableOpacity>
                </View>
                <Button title="Add to Cart" onPress={addToCart} />
                <Button title="Close" onPress={() => setModalVisible(false)} color="#f00" />
              </View>
            </View>
          </Modal>
        )}
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 15,
    backgroundColor: '#fff',
    elevation: 3,
    alignItems: 'center',
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 5,
    marginTop: 10,
    padding: 5,
    width: '100%',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  body: {
    flex: 1,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  categoriesList: {
    marginBottom: 20,
  },
  categoryButton: {
    backgroundColor: '#ddd',
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  selectedCategoryButton: {
    backgroundColor: '#aaa',
  },
  categoryText: {
    fontSize: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
    elevation: 3,
  },
  productImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 14,
    color: '#666',
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#28a745',
    borderRadius: 50,
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  cartText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    fontSize: 16,
    marginVertical: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
  },
  optionButton: {
    backgroundColor: '#ddd',
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
  selectedOptionButton: {
    backgroundColor: '#aaa',
  },
  optionText: {
    fontSize: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  quantityButton: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  quantityText: {
    fontSize: 18,
    width: 40,
    textAlign: 'center',
  },
  productList: {
    justifyContent: 'space-between',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
});

export default HomeScreen;
