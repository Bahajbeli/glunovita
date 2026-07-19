import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';
import { Ionicons } from '@expo/vector-icons';

export default function AuthorityDashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/statistics');
      setStatistics(response.data.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
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
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchStatistics} />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Bonjour, {user?.firstName} 👋</Text>
            <Text style={styles.subtitle}>Tableau de bord - Autorité</Text>
            {user?.region && (
              <Text style={styles.region}>Région: {user.region}</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {statistics && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={32} color="#3b82f6" />
            <Text style={styles.statNumber}>
              {statistics.patients?.total || 0}
            </Text>
            <Text style={styles.statLabel}>Patients Totaux</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={32} color="#10b981" />
            <Text style={styles.statNumber}>
              {statistics.patients?.withApprovedDeclaration || 0}
            </Text>
            <Text style={styles.statLabel}>Déclarations Approuvées</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="document-text" size={32} color="#f59e0b" />
            <Text style={styles.statNumber}>
              {statistics.medicalRecords?.total || 0}
            </Text>
            <Text style={styles.statLabel}>Dossiers Médicaux</Text>
          </View>
        </View>
      )}

      {statistics?.declarations?.statusDistribution && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statut des Déclarations</Text>
          <View style={styles.statusGrid}>
            {statistics.declarations.statusDistribution.map((status: any) => (
              <View key={status.status} style={styles.statusCard}>
                <Text style={styles.statusNumber}>{status.count}</Text>
                <Text style={styles.statusLabel}>{status.status}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {statistics?.patients?.regionalDistribution && statistics.patients.regionalDistribution.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distribution Régionale</Text>
          {statistics.patients.regionalDistribution.map((region: any) => (
            <View key={region.region} style={styles.regionCard}>
              <Text style={styles.regionName}>{region.region}</Text>
              <Text style={styles.regionCount}>{region.count} patients</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  region: {
    fontSize: 14,
    color: '#14b8a6',
    fontWeight: '600',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  statusNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14b8a6',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  regionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginBottom: 8,
  },
  regionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  regionCount: {
    fontSize: 14,
    color: '#6b7280',
  },
});
