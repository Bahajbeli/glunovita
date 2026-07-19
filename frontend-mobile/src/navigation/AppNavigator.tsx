import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Home Screen
import HomeScreen from '../screens/HomeScreen';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Patient Screens
import PatientDashboardScreen from '../screens/patient/DashboardScreen';
import PatientProductsScreen from '../screens/patient/ProductsScreen';
import PatientCartScreen from '../screens/patient/CartScreen';
import PatientBookConsultationScreen from '../screens/patient/BookConsultationScreen';
import PatientOrdersScreen from '../screens/patient/OrdersScreen';
import PatientDeclarationsScreen from '../screens/patient/DeclarationsScreen';
import PatientMedicalRecordsScreen from '../screens/patient/MedicalRecordsScreen';
import PatientConsultationsScreen from '../screens/patient/ConsultationsScreen';

// Doctor Screens
import DoctorDashboardScreen from '../screens/doctor/DashboardScreen';
import DoctorAppointmentsScreen from '../screens/doctor/AppointmentsScreen';
import DoctorProfileScreen from '../screens/doctor/ProfileScreen';
import DoctorLocationScreen from '../screens/doctor/LocationScreen';
import DoctorSecretariesScreen from '../screens/doctor/SecretariesScreen';
import DoctorMedicalRecordsScreen from '../screens/doctor/MedicalRecordsScreen';
import DoctorOrdersScreen from '../screens/doctor/OrdersScreen';
import DoctorPatientsScreen from '../screens/doctor/PatientsScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/DashboardScreen';
import AdminProductsScreen from '../screens/admin/ProductsScreen';
import AdminOrdersScreen from '../screens/admin/OrdersScreen';
import AdminUsersScreen from '../screens/admin/UsersScreen';
import AdminDeclarationsScreen from '../screens/admin/DeclarationsScreen';
import AdminAuditLogsScreen from '../screens/admin/AuditLogsScreen';

// Authority Screens
import AuthorityDashboardScreen from '../screens/authority/DashboardScreen';

// Secretary Screens
import SecretaryDashboardScreen from '../screens/secretary/DashboardScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function PatientTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#14b8a6',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={PatientDashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          tabBarLabel: 'Accueil',
        }}
      />
      <Tab.Screen
        name="Products"
        component={PatientProductsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="storefront" size={size} color={color} />
          ),
          tabBarLabel: 'Boutique',
        }}
      />
      <Tab.Screen
        name="Consultation"
        component={PatientBookConsultationScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
          tabBarLabel: 'Consultation',
        }}
      />
      <Tab.Screen
        name="Orders"
        component={PatientOrdersScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" size={size} color={color} />
          ),
          tabBarLabel: 'Commandes',
        }}
      />
    </Tab.Navigator>
  );
}

function DoctorTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#14b8a6',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={DoctorDashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          tabBarLabel: 'Accueil',
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={DoctorAppointmentsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
          tabBarLabel: 'Consultations',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={DoctorProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          tabBarLabel: 'Profil',
        }}
      />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#14b8a6',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={AdminDashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          tabBarLabel: 'Accueil',
        }}
      />
      <Tab.Screen
        name="Products"
        component={AdminProductsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="storefront" size={size} color={color} />
          ),
          tabBarLabel: 'Produits',
        }}
      />
      <Tab.Screen
        name="Orders"
        component={AdminOrdersScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" size={size} color={color} />
          ),
          tabBarLabel: 'Commandes',
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#14b8a6" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          {user.role === 'PATIENT' && (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="PatientTabs" component={PatientTabs} />
              <Stack.Screen name="Cart" component={PatientCartScreen} />
              <Stack.Screen name="BookConsultation" component={PatientBookConsultationScreen} />
              <Stack.Screen name="Declarations" component={PatientDeclarationsScreen} />
              <Stack.Screen name="MedicalRecords" component={PatientMedicalRecordsScreen} />
              <Stack.Screen name="Consultations" component={PatientConsultationsScreen} />
            </>
          )}
          {user.role === 'DOCTOR' && (
            <>
              <Stack.Screen name="DoctorTabs" component={DoctorTabs} />
              <Stack.Screen name="DoctorLocation" component={DoctorLocationScreen} />
              <Stack.Screen name="Secretaries" component={DoctorSecretariesScreen} />
              <Stack.Screen name="DoctorMedicalRecords" component={DoctorMedicalRecordsScreen} />
              <Stack.Screen name="DoctorOrders" component={DoctorOrdersScreen} />
              <Stack.Screen name="DoctorPatients" component={DoctorPatientsScreen} />
            </>
          )}
          {user.role === 'ADMIN' && (
            <>
              <Stack.Screen name="AdminTabs" component={AdminTabs} />
              <Stack.Screen name="Users" component={AdminUsersScreen} />
              <Stack.Screen name="AdminDeclarations" component={AdminDeclarationsScreen} />
              <Stack.Screen name="AuditLogs" component={AdminAuditLogsScreen} />
            </>
          )}
          {user.role === 'AUTHORITY' && (
            <Stack.Screen name="Authority" component={AuthorityDashboardScreen} />
          )}
          {user.role === 'SECRETARY' && (
            <Stack.Screen name="Secretary" component={SecretaryDashboardScreen} />
          )}
        </>
      )}
    </Stack.Navigator>
  );
}
