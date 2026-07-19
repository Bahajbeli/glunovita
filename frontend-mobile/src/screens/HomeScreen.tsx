import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
    if (user) {
      loadCart();
    }
  }, [selectedCategory, searchTerm, user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.data.products || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      // Ne pas afficher d'alerte pour les erreurs réseau silencieuses
      // Les produits resteront vides si l'erreur persiste
      if (error.response) {
        // Erreur HTTP (4xx, 5xx)
        console.error('HTTP Error:', error.response.status, error.response.data);
      } else if (error.request) {
        // Requête envoyée mais pas de réponse (problème réseau)
        console.error('Network Error: Backend may not be running or unreachable');
      } else {
        // Erreur lors de la configuration de la requête
        console.error('Request Error:', error.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadCart = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const addToCart = async (product: any) => {
    if (!user) {
      Alert.alert(
        'Connexion requise',
        'Veuillez vous connecter pour commander',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Se connecter',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
      return;
    }

    try {
      const existingItem = cart.find(item => item._id === product._id);
      let newCart;

      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        if (newQuantity > product.stock) {
          Alert.alert('Erreur', 'Stock insuffisant');
          return;
        }
        newCart = cart.map(item =>
          item._id === product._id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        if (product.stock < 1) {
          Alert.alert('Erreur', 'Produit en rupture de stock');
          return;
        }
        newCart = [...cart, { ...product, quantity: 1 }];
      }

      setCart(newCart);
      await AsyncStorage.setItem('cart', JSON.stringify(newCart));
      Alert.alert('Succès', 'Produit ajouté au panier');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter au panier');
    }
  };

  const categories = [
    { id: '', label: 'Tout' },
    { id: 'FOOD', label: 'Alimentation' },
    { id: 'BEVERAGE', label: 'Boissons' },
    { id: 'SNACK', label: 'Snacks' },
    { id: 'INGREDIENT', label: 'Cuisine' },
  ];

  const getCartCount = () => {
    if (!user) return 0;
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>G</Text>
            </View>
            <Text style={styles.appName}>Glunovita</Text>
          </View>
          <View style={styles.headerActions}>
            {user && cart.length > 0 && (
              <TouchableOpacity
                style={styles.cartIcon}
                onPress={() => navigation.navigate('Cart')}
              >
                <Ionicons name="cart" size={24} color="#111827" />
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{getCartCount()}</Text>
                </View>
              </TouchableOpacity>
            )}
            {user ? (
              <TouchableOpacity
                style={styles.userButton}
                onPress={() => {
                  const role = user.role.toLowerCase();
                  if (role === 'patient') {
                    navigation.navigate('PatientTabs');
                  } else if (role === 'doctor') {
                    navigation.navigate('DoctorTabs');
                  } else if (role === 'admin') {
                    navigation.navigate('AdminTabs');
                  }
                }}
              >
                <Ionicons name="person" size={20} color="#ffffff" />
                <Text style={styles.userButtonText}>Mon Espace</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Ionicons name="person" size={20} color="#ffffff" />
                <Text style={styles.loginButtonText}>Se Connecter</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categories}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryButton,
                selectedCategory === cat.id && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat.id && styles.categoryTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Hero Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.heroContent}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>NOUVELLE COLLECTION</Text>
          </View>
          <Text style={styles.heroTitle}>
            Savourez la Vie{'\n'}sans Gluten
          </Text>
          <Text style={styles.heroSubtitle}>PROMOTIONS</Text>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => {
              if (!user) {
                navigation.navigate('Login');
              }
            }}
          >
            <Text style={styles.heroButtonText}>
              {user ? 'Acheter Maintenant →' : 'Se Connecter →'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Products Section */}
      <ScrollView
        style={styles.productsSection}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchProducts} />
        }
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.sectionTitle}>Nos Produits</Text>
          </View>
          <Text style={styles.productCount}>
            {products.length} résultat{products.length > 1 ? 's' : ''}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>Aucun produit trouvé</Text>
            {searchTerm && (
              <Text style={styles.emptySubtext}>
                Essayez de modifier vos critères de recherche
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {products.map((item) => (
              <View key={item._id} style={styles.productCard}>
                <View style={styles.productImageContainer}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.productImage} />
                  ) : (
                    <View style={styles.productImagePlaceholder}>
                      <Ionicons name="image-outline" size={40} color="#9ca3af" />
                    </View>
                  )}
                  {item.certification !== 'NONE' && (
                    <View style={styles.certificationBadge}>
                      <Text style={styles.certificationText}>
                        {item.certification === 'CERTIFIED' ? 'Certifié' : 'Vérifié'}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  {item.brand && (
                    <Text style={styles.productBrand} numberOfLines={1}>
                      {item.brand}
                    </Text>
                  )}
                  <Text style={styles.productDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <View style={styles.productFooter}>
                    <Text style={styles.productPrice}>{item.price.toFixed(2)} €</Text>
                    <TouchableOpacity
                      style={[
                        styles.addButton,
                        (!user || item.stock === 0) && styles.addButtonDisabled,
                      ]}
                      onPress={() => addToCart(item)}
                      disabled={item.stock === 0}
                    >
                      <Text style={styles.addButtonText}>
                        {!user
                          ? 'Se Connecter'
                          : item.stock > 0
                          ? 'Ajouter'
                          : 'Rupture'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {item.stock > 0 && item.stock < 10 && (
                    <Text style={styles.stockWarning}>
                      ⚠️ Plus que {item.stock} en stock
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#14b8a6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cartIcon: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14b8a6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  userButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14b8a6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  categories: {
    marginTop: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#14b8a6',
  },
  categoryText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  heroBanner: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginTop: 8,
  },
  heroContent: {
    backgroundColor: '#14b8a6',
    borderRadius: 16,
    padding: 24,
    minHeight: 200,
    justifyContent: 'center',
  },
  heroBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  heroBadgeText: {
    color: '#92400e',
    fontSize: 12,
    fontWeight: 'bold',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 16,
  },
  heroButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  productsSection: {
    flex: 1,
    padding: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 24,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  productCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  productImagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  certificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  certificationText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#14b8a6',
  },
  addButton: {
    backgroundColor: '#14b8a6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  stockWarning: {
    fontSize: 10,
    color: '#f59e0b',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
});
