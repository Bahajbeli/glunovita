import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';
import { Ionicons } from '@expo/vector-icons';

export default function DeclarationsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [declarations, setDeclarations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    diagnosisDate: '',
    diagnosisLocation: '',
    diagnosingDoctor: '',
    medicalEvidence: 'BIOPSY',
  });

  useEffect(() => {
    fetchDeclarations();
  }, []);

  const fetchDeclarations = async () => {
    try {
      const response = await api.get('/patients/declarations');
      setDeclarations(response.data.data || []);
    } catch (error) {
      console.error('Error fetching declarations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.diagnosisDate || !formData.diagnosisLocation || !formData.diagnosingDoctor) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      await api.post('/patients/declarations', formData);
      Alert.alert('Succès', 'Déclaration soumise avec succès');
      setModalVisible(false);
      setFormData({
        diagnosisDate: '',
        diagnosisLocation: '',
        diagnosingDoctor: '',
        medicalEvidence: 'BIOPSY',
      });
      fetchDeclarations();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur lors de la soumission');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '#10b981';
      case 'REJECTED':
        return '#ef4444';
      case 'PENDING':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const renderDeclaration = ({ item }: { item: any }) => (
    <View style={styles.declarationCard}>
      <View style={styles.declarationHeader}>
        <Text style={styles.declarationDate}>
          {new Date(item.createdAt).toLocaleDateString('fr-FR')}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.diagnosisDate}>
        Date de diagnostic: {new Date(item.diagnosisDate).toLocaleDateString('fr-FR')}
      </Text>
      <Text style={styles.location}>Lieu: {item.diagnosisLocation}</Text>
      <Text style={styles.evidence}>Preuve: {item.medicalEvidence}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Mes Déclarations</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color="#14b8a6" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={declarations}
        renderItem={renderDeclaration}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchDeclarations} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>Aucune déclaration</Text>
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
              <Text style={styles.modalTitle}>Nouvelle Déclaration</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.label}>Date de diagnostic</Text>
              <TextInput
                style={styles.input}
                value={formData.diagnosisDate}
                onChangeText={(text) => setFormData({ ...formData, diagnosisDate: text })}
                placeholder="YYYY-MM-DD"
              />

              <Text style={styles.label}>Lieu de diagnostic</Text>
              <TextInput
                style={styles.input}
                value={formData.diagnosisLocation}
                onChangeText={(text) => setFormData({ ...formData, diagnosisLocation: text })}
                placeholder="Hôpital, clinique..."
              />

              <Text style={styles.label}>Médecin diagnostiqueur</Text>
              <TextInput
                style={styles.input}
                value={formData.diagnosingDoctor}
                onChangeText={(text) => setFormData({ ...formData, diagnosingDoctor: text })}
                placeholder="Nom du médecin"
              />

              <Text style={styles.label}>Preuve médicale</Text>
              <View style={styles.evidenceButtons}>
                {['BIOPSY', 'SEROLOGY', 'GENETIC_TEST', 'CLINICAL'].map((evidence) => (
                  <TouchableOpacity
                    key={evidence}
                    style={[
                      styles.evidenceButton,
                      formData.medicalEvidence === evidence && styles.evidenceButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, medicalEvidence: evidence })}
                  >
                    <Text
                      style={[
                        styles.evidenceButtonText,
                        formData.medicalEvidence === evidence && styles.evidenceButtonTextActive,
                      ]}
                    >
                      {evidence}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Soumettre</Text>
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
  declarationCard: {
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
  declarationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  declarationDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  diagnosisDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  evidence: {
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
  evidenceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  evidenceButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  evidenceButtonActive: {
    backgroundColor: '#14b8a6',
    borderColor: '#14b8a6',
  },
  evidenceButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  evidenceButtonTextActive: {
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
