import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }: any) {
  const { user, refreshUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    specialization: '',
    bio: '',
    yearsOfExperience: '',
    consultationFee: '',
    languages: [] as string[],
  });

  useEffect(() => {
    if (user) {
      setFormData({
        specialization: user.specialization || '',
        bio: user.profileQuestions?.bio || '',
        yearsOfExperience: user.profileQuestions?.yearsOfExperience?.toString() || '',
        consultationFee: user.profileQuestions?.consultationFee?.toString() || '',
        languages: user.profileQuestions?.languages || [],
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put(`/users/${user?._id}`, {
        specialization: formData.specialization,
        profileQuestions: {
          bio: formData.bio,
          yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : undefined,
          consultationFee: formData.consultationFee ? parseFloat(formData.consultationFee) : undefined,
          languages: formData.languages,
        },
      });
      Alert.alert('Succès', 'Profil mis à jour');
      await refreshUser();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon Profil</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Spécialisation</Text>
        <TextInput
          style={styles.input}
          value={formData.specialization}
          onChangeText={(text) => setFormData({ ...formData, specialization: text })}
          placeholder="Ex: Gastro-entérologue"
        />

        <Text style={styles.label}>Biographie</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.bio}
          onChangeText={(text) => setFormData({ ...formData, bio: text })}
          placeholder="Décrivez votre parcours..."
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Années d'expérience</Text>
        <TextInput
          style={styles.input}
          value={formData.yearsOfExperience}
          onChangeText={(text) => setFormData({ ...formData, yearsOfExperience: text })}
          keyboardType="numeric"
          placeholder="0"
        />

        <Text style={styles.label}>Tarif de consultation (TND)</Text>
        <TextInput
          style={styles.input}
          value={formData.consultationFee}
          onChangeText={(text) => setFormData({ ...formData, consultationFee: text })}
          keyboardType="numeric"
          placeholder="0.00"
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => navigation.navigate('DoctorLocation')}
        >
          <Ionicons name="location" size={20} color="#14b8a6" />
          <Text style={styles.locationButtonText}>Gérer ma localisation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert(
              'Déconnexion',
              'Êtes-vous sûr de vouloir vous déconnecter ?',
              [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Déconnexion',
                  style: 'destructive',
                  onPress: async () => {
                    await logout();
                  },
                },
              ]
            );
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutButtonText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  form: {
    padding: 16,
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
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#14b8a6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#14b8a6',
  },
  locationButtonText: {
    color: '#14b8a6',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
