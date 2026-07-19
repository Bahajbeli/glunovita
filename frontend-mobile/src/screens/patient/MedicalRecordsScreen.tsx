import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';
import { Ionicons } from '@expo/vector-icons';

export default function MedicalRecordsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  useEffect(() => {
    fetchRecords();
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

  const renderRecord = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.recordCard}
      onPress={() => setSelectedRecord(item)}
    >
      <View style={styles.recordHeader}>
        <View style={styles.avatar}>
          <Ionicons name="medical" size={24} color="#14b8a6" />
        </View>
        <View style={styles.recordInfo}>
          <Text style={styles.doctorName}>
            Dr. {item.doctorId?.firstName} {item.doctorId?.lastName}
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
        <View style={{ width: 24 }} />
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
        visible={!!selectedRecord}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedRecord(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Détails du Dossier</Text>
              <TouchableOpacity onPress={() => setSelectedRecord(null)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date de visite</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedRecord?.visitDate).toLocaleDateString('fr-FR')}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Médecin</Text>
                <Text style={styles.detailValue}>
                  Dr. {selectedRecord?.doctorId?.firstName} {selectedRecord?.doctorId?.lastName}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type de visite</Text>
                <Text style={styles.detailValue}>{selectedRecord?.visitType}</Text>
              </View>

              {selectedRecord?.chiefComplaint && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Motif de consultation</Text>
                  <Text style={styles.detailValue}>{selectedRecord.chiefComplaint}</Text>
                </View>
              )}

              {selectedRecord?.diagnosis && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Diagnostic</Text>
                  <Text style={styles.detailValue}>{selectedRecord.diagnosis}</Text>
                </View>
              )}

              {selectedRecord?.treatmentPlan && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Plan de traitement</Text>
                  <Text style={styles.detailValue}>{selectedRecord.treatmentPlan}</Text>
                </View>
              )}

              {selectedRecord?.medications && selectedRecord.medications.length > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Médicaments</Text>
                  {selectedRecord.medications.map((med: any, idx: number) => (
                    <Text key={idx} style={styles.detailValue}>
                      • {med.name} - {med.dosage} ({med.frequency})
                    </Text>
                  ))}
                </View>
              )}

              {selectedRecord?.notes && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Notes</Text>
                  <Text style={styles.detailValue}>{selectedRecord.notes}</Text>
                </View>
              )}
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
    backgroundColor: '#e0f2f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  doctorName: {
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
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 16,
    color: '#111827',
  },
});
