import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';
import { Ionicons } from '@expo/vector-icons';

export default function DoctorMedicalRecordsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    visitDate: new Date().toISOString().split('T')[0],
    visitType: 'FOLLOW_UP',
    chiefComplaint: '',
    diagnosis: '',
    treatmentPlan: '',
    notes: '',
  });

  useEffect(() => {
    fetchRecords();
    fetchPatients();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await api.get('/medical-records');
      setRecords(response.data.data || []);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/medical-records');
      const records = response.data.data || [];
      const uniquePatients = Array.from(
        new Map(records.map((r: any) => [r.patientId?._id, r.patientId])).values()
      ).filter(Boolean);
      setPatients(uniquePatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.patientId || !formData.visitDate) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      await api.post('/medical-records', formData);
      Alert.alert('Succès', 'Dossier médical créé');
      setModalVisible(false);
      setFormData({
        patientId: '',
        visitDate: new Date().toISOString().split('T')[0],
        visitType: 'FOLLOW_UP',
        chiefComplaint: '',
        diagnosis: '',
        treatmentPlan: '',
        notes: '',
      });
      fetchRecords();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const renderRecord = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.patientId?.firstName?.[0]}{item.patientId?.lastName?.[0]}
          </Text>
        </View>
        <View style={styles.recordInfo}>
          <Text style={styles.patientName}>
            {item.patientId?.firstName} {item.patientId?.lastName}
          </Text>
          <Text style={styles.visitDate}>
            {new Date(item.visitDate).toLocaleDateString('fr-FR')}
          </Text>
        </View>
      </View>
      <Text style={styles.visitType}>{item.visitType}</Text>
      {item.diagnosis && (
        <Text style={styles.diagnosis} numberOfLines={1}>
          {item.diagnosis}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Dossiers Médicaux</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color="#14b8a6" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={records}
        renderItem={renderRecord}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchRecords} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>Aucun dossier médical</Text>
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
              <Text style={styles.modalTitle}>Nouveau Dossier</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Patient</Text>
              <View style={styles.patientSelector}>
                {patients.map((patient) => (
                  <TouchableOpacity
                    key={patient._id}
                    style={[
                      styles.patientOption,
                      formData.patientId === patient._id && styles.patientOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, patientId: patient._id })}
                  >
                    <Text
                      style={[
                        styles.patientOptionText,
                        formData.patientId === patient._id && styles.patientOptionTextActive,
                      ]}
                    >
                      {patient.firstName} {patient.lastName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Date de visite</Text>
              <TextInput
                style={styles.input}
                value={formData.visitDate}
                onChangeText={(text) => setFormData({ ...formData, visitDate: text })}
                placeholder="YYYY-MM-DD"
              />

              <Text style={styles.label}>Type de visite</Text>
              <View style={styles.typeButtons}>
                {['INITIAL', 'FOLLOW_UP', 'EMERGENCY', 'ROUTINE'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      formData.visitType === type && styles.typeButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, visitType: type })}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        formData.visitType === type && styles.typeButtonTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Motif de consultation</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.chiefComplaint}
                onChangeText={(text) => setFormData({ ...formData, chiefComplaint: text })}
                placeholder="Motif..."
                multiline
              />

              <Text style={styles.label}>Diagnostic</Text>
              <TextInput
                style={styles.input}
                value={formData.diagnosis}
                onChangeText={(text) => setFormData({ ...formData, diagnosis: text })}
                placeholder="Diagnostic..."
              />

              <Text style={styles.label}>Plan de traitement</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.treatmentPlan}
                onChangeText={(text) => setFormData({ ...formData, treatmentPlan: text })}
                placeholder="Plan de traitement..."
                multiline
              />

              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Notes..."
                multiline
              />

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Créer</Text>
              </TouchableOpacity>
            </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  list: {
    padding: 16,
  },
  recordCard: {
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
  recordHeader: {
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
  recordInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  visitDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  visitType: {
    fontSize: 14,
    color: '#14b8a6',
    fontWeight: '600',
    marginBottom: 4,
  },
  diagnosis: {
    fontSize: 14,
    color: '#6b7280',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
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
  patientSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  patientOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  patientOptionActive: {
    backgroundColor: '#14b8a6',
    borderColor: '#14b8a6',
  },
  patientOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  patientOptionTextActive: {
    color: '#ffffff',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  typeButtonActive: {
    backgroundColor: '#14b8a6',
    borderColor: '#14b8a6',
  },
  typeButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#ffffff',
  },
  submitButton: {
    backgroundColor: '#14b8a6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
