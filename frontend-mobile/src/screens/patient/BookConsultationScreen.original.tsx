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
import MapView, { Marker } from 'react-native-maps';
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

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/users/doctors');
      setDoctors(response.data.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await api.get(
        `/appointments/available-slots?doctorId=${selectedDoctor._id}&date=${selectedDate}&duration=30`
      );
      setAvailableSlots(response.data.data);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot) {
      Alert.alert('Erreur', 'Veuillez sélectionner une date et un créneau');
      return;
    }

    try {
      const formattedDate = new Date(selectedDate).toISOString().split('T')[0];
      const [hours, minutes] = selectedSlot.split(':').map(Number);
      const endMinutes = (hours * 60 + minutes + 30) % (24 * 60);
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

      await api.post('/appointments', {
        doctorId: selectedDoctor._id,
        appointmentDate: formattedDate,
        startTime: selectedSlot,
        endTime: endTime,
        duration: 30,
        type: 'CONSULTATION',
        reason: reason,
      });

      Alert.alert('Succès', 'Consultation réservée avec succès !');
      setModalVisible(false);
      setSelectedDoctor(null);
      setSelectedDate('');
      setSelectedSlot('');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur lors de la réservation');
    }
  };

  const doctorsWithLocation = doctors.filter(
    doc => doc.location && doc.location.lat && doc.location.lng
  );

  const mapRegion = doctorsWithLocation.length > 0
    ? {
        latitude: doctorsWithLocation.reduce((sum, doc) => sum + doc.location.lat, 0) / doctorsWithLocation.length,
        longitude: doctorsWithLocation.reduce((sum, doc) => sum + doc.location.lng, 0) / doctorsWithLocation.length,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }
    : {
        latitude: 36.8065,
        longitude: 10.1815,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Réserver une Consultation</Text>
      
      {doctorsWithLocation.length > 0 && (
        <MapView style={styles.map} region={mapRegion}>
          {doctorsWithLocation.map((doctor) => (
            <Marker
              key={doctor._id}
              coordinate={{
                latitude: doctor.location.lat,
                longitude: doctor.location.lng,
              }}
              title={`Dr. ${doctor.firstName} ${doctor.lastName}`}
              description={doctor.specialization || 'Médecin généraliste'}
              onPress={() => {
                setSelectedDoctor(doctor);
                setModalVisible(true);
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setSelectedDate(tomorrow.toISOString().split('T')[0]);
              }}
            />
          ))}
        </MapView>
      )}

      <FlatList
        data={doctors}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.doctorCard}
            onPress={() => {
              setSelectedDoctor(item);
              setModalVisible(true);
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              setSelectedDate(tomorrow.toISOString().split('T')[0]);
            }}
          >
            <View style={styles.doctorAvatar}>
              <Text style={styles.doctorInitials}>
                {item.firstName[0]}{item.lastName[0]}
              </Text>
            </View>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>
                Dr. {item.firstName} {item.lastName}
              </Text>
              <Text style={styles.doctorSpecialty}>
                {item.specialization || 'Médecin généraliste'}
              </Text>
              {item.address && (
                <Text style={styles.doctorAddress} numberOfLines={1}>
                  {item.address}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.doctorsList}
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
                onChangeText={setSelectedDate}
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
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, (!selectedDate || !selectedSlot) && styles.confirmButtonDisabled]}
                onPress={handleBook}
                disabled={!selectedDate || !selectedSlot}
              >
                <Text style={styles.confirmButtonText}>Confirmer</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  map: {
    height: 300,
    margin: 16,
    borderRadius: 12,
  },
  doctorsList: {
    padding: 16,
  },
  doctorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#14b8a6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doctorInitials: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#14b8a6',
    marginBottom: 4,
  },
  doctorAddress: {
    fontSize: 12,
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
    flex: 1,
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
    marginTop: 8,
  },
  slotButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  slotButtonActive: {
    backgroundColor: '#14b8a6',
    borderColor: '#14b8a6',
  },
  slotText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  slotTextActive: {
    color: '#ffffff',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#14b8a6',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
