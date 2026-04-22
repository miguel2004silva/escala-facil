import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { colors } from '../../../../theme/colors';
import { EscalaCard } from '../components/EscalaCard';

import { User } from '../../../auth/domain/entities/User';
import { makeEscalasViewModel, makeConfirmarPresencaViewModel } from '../../../../main/factories/EscalaFactory';

interface EscalasScreenProps {
  currentUser: User;
  onLogout: () => void;
}

export function EscalasScreen({ currentUser, onLogout }: EscalasScreenProps) {
  const viewModel = makeEscalasViewModel();
  const presencaViewModel = makeConfirmarPresencaViewModel();
  
  const { escalas, loading, error, fetchEscalas } = viewModel;

  useEffect(() => {
    fetchEscalas();
  }, [fetchEscalas]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Escalas</Text>
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchEscalas}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={escalas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EscalaCard 
              escala={item} 
              currentUser={currentUser}
              presencaViewModel={presencaViewModel}
              onStatusChange={fetchEscalas}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchEscalas}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>Nenhuma escala encontrada.</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 48, // SafeArea
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: colors.error,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: colors.surface,
    fontWeight: 'bold',
  }
});
