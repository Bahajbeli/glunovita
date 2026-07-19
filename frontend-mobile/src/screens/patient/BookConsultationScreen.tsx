// Version sans react-native-maps pour Expo Go
// Renommez ce fichier en BookConsultationScreen.tsx temporairement

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';
import { Ionicons } from '@expo/vector-icons';

export default function BookConsultationScreen() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/users/doctors');
      setDoctors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchAvailableSlots = async (doctorId: string, date: string) => {
    try {
      const response = await api.get(`/appointments/available-slots?doctorId=${doctorId}&date=${date}`);
      setAvailableSlots(response.data.data || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    if (selectedDoctor && date) {
      fetchAvailableSlots(selectedDoctor._id, date);
    }
  };

  const handleBook = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const [hours, minutes] = selectedSlot.split(':').map(Number);
      const duration = selectedDoctor.profileQuestions?.consultationDuration || 30;
      const endMinutes = (hours * 60 + minutes + duration) % (24 * 60);
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

      await api.post('/appointments', {
        doctorId: selectedDoctor._id,
        appointmentDate: selectedDate,
        startTime: selectedSlot,
        endTime: endTime,
        duration: duration,
        type: 'CONSULTATION',
        reason: reason,
      });

      Alert.alert('Succès', 'Consultation réservée avec succès');
      setModalVisible(false);
      setSelectedDate('');
      setSelectedSlot('');
      setReason('');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur lors de la réservation');
    } finally {
      setLoading(false);
    }
  };

  const renderDoctor = ({ item }: { item: any }) => (
    <View style={styles.doctorCard}>
      <View style={styles.doctorHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.firstName?.[0]}{item.lastName?.[0]}
          </Text>
        </View>
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>
            Dr. {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.specialization}>{item.specialization}</Text>
          {item.address && (
            <View style={styles.addressRow}>
              <Ionicons name="location" size={14} color="#6b7280" />
              <Text style={styles.address}>{item.address}</Text>
            </View>
          )}
        </View>
      </View>
      {item.profileQuestions && (
        <View style={styles.details}>
          {item.profileQuestions.yearsOfExperience && (
            <Text style={styles.detailText}>
              {item.profileQuestions.yearsOfExperience} ans d'expérience
            </Text>
          )}
          {item.profileQuestions.consultationFee && (
            <Text style={styles.detailText}>
              {item.profileQuestions.consultationFee} TND
            </Text>
          )}
        </View>
      )}
      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => {
          setSelectedDoctor(item);
          setModalVisible(true);
        }}
      >
        <Text style={styles.bookButtonText}>Réserver une consultation</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Réserver une Consultation</Text>
        <Text style={styles.subtitle}>
          ⚠️ La carte n'est pas disponible dans Expo Go.{'\n'}
          Sélectionnez un docteur dans la liste ci-dessous.
        </Text>
      </View>

      <FlatList
        data={doctors}
        renderItem={renderDoctor}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucun docteur disponible</Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Réserver avec {selectedDoctor?.firstName} {selectedDoctor?.lastName}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Date</Text>
              <TextInput
                style={styles.input}
                value={selectedDate}
                onChangeText={handleDateChange}
                placeholder="YYYY-MM-DD"
              />

              {selectedDate && availableSlots.length > 0 && (
                <>
                  <Text style={styles.label}>Créneaux disponibles</Text>
                  <View style={styles.slotsContainer}>
                    {availableSlots.map((slot) => (
                      <TouchableOpacity
                        key={slot}
                        style={[
                          styles.slotButton,
                          selectedSlot === slot && styles.slotButtonActive,
                        ]}
                        onPress={() => setSelectedSlot(slot)}
                      >
                        <Text
                          style={[
                            styles.slotText,
                            selectedSlot === slot && styles.slotTextActive,
                          ]}
                        >
                          {slot}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <Text style={styles.label}>Motif (optionnel)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={reason}
                onChangeText={setReason}
                placeholder="Décrivez vos symptômes..."
                multiline
                numberOfLines={4}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.confirmButton, (!selectedDate || !selectedSlot) && styles.confirmButtonDisabled]}
                onPress={handleBook}
                disabled={!selectedDate || !selectedSlot || loading}
              >
                <Text style={styles.confirmButtonText}>
                  {loading ? 'Réservation...' : 'Confirmer la réservation'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#92400e',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
  },
  list: {
    padding: 16,
  },
  doctorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#14b8a6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  specialization: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  address: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  details: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  bookButton: {
    backgroundColor: '#14b8a6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#f3f4f6',
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
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  slotButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  slotButtonActive: {
    backgroundColor: '#14b8a6',
    borderColor: '#14b8a6',
  },
  slotText: {
    fontSize: 14,
    color: '#374151',
  },
  slotTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  confirmButton: {
    backgroundColor: '#14b8a6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
