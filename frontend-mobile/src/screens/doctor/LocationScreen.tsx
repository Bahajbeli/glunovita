// Version alternative sans react-native-maps pour Expo Go
// Renommez ce fichier en LocationScreen.tsx temporairement

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';
import { Ionicons } from '@expo/vector-icons';

export default function LocationScreen({ navigation }: any) {
  const { user, refreshUser } = useAuth();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.location) {
      setLocation(user.location);
    }
    if (user?.address) {
      setAddress(user.address);
    }
  }, [user]);

  const handleSave = async () => {
    if (!location) {
      Alert.alert('Erreur', 'Veuillez entrer les coordonnées');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/users/${user?._id}`, {
        location,
        address,
      });
      Alert.alert('Succès', 'Localisation mise à jour');
      await refreshUser();
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ma Localisation</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.note}>
          ⚠️ La carte n'est pas disponible dans Expo Go.{'\n'}
          Entrez manuellement vos coordonnées ou utilisez un développement build.
        </Text>

        <Text style={styles.label}>Adresse du cabinet</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="Ex: 123 Rue Example, Tunis"
        />

        <Text style={styles.label}>Latitude</Text>
        <TextInput
          style={styles.input}
          value={location?.lat.toString() || ''}
          onChangeText={(text) => {
            const lat = parseFloat(text);
            if (!isNaN(lat)) {
              setLocation({ ...location!, lat });
            } else if (text === '') {
              setLocation(null);
            }
          }}
          keyboardType="numeric"
          placeholder="Ex: 36.8065"
        />

        <Text style={styles.label}>Longitude</Text>
        <TextInput
          style={styles.input}
          value={location?.lng.toString() || ''}
          onChangeText={(text) => {
            const lng = parseFloat(text);
            if (!isNaN(lng) && location) {
              setLocation({ ...location, lng });
            } else if (!location && !isNaN(lng)) {
              setLocation({ lat: 0, lng });
            }
          }}
          keyboardType="numeric"
          placeholder="Ex: 10.1815"
        />

        <TouchableOpacity
          style={[styles.saveButton, !location && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!location || loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  note: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    color: '#92400e',
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#14b8a6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
