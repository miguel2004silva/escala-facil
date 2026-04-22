import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Escala, Membro } from '../../domain/entities/Escala';
import { colors } from '../../../../theme/colors';
import { User } from '../../../auth/domain/entities/User';
import { useConfirmarPresencaViewModel } from '../../../presenca/presentation/viewmodels/useConfirmarPresencaViewModel';

interface EscalaCardProps {
  escala: Escala;
  currentUser: User;
  presencaViewModel: ReturnType<typeof useConfirmarPresencaViewModel>;
  onStatusChange: () => void;
}

export function EscalaCard({ escala, currentUser, presencaViewModel, onStatusChange }: EscalaCardProps) {
  const dateObj = new Date(escala.data);
  const formattedDate = dateObj.toLocaleDateString('pt-BR', { 
    weekday: 'short', day: '2-digit', month: 'short' 
  });
  const formattedTime = dateObj.toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit'
  });

  const { confirmar, loadingId } = presencaViewModel;
  const isLoading = loadingId === escala.id;

  const currentMember = escala.membros.find(m => m.id === currentUser.id);

  const handleConfirm = (status: boolean) => {
    if (currentMember) {
      confirmar(escala.id, currentMember.id, status, onStatusChange);
    }
  };

  const renderStatus = (membro: Membro) => {
    if (membro.presencaConfirmada === true) return <Text style={[styles.statusTag, styles.statusOk]}>Confirmado</Text>;
    if (membro.presencaConfirmada === false) return <Text style={[styles.statusTag, styles.statusNo]}>Ausente</Text>;
    return <Text style={[styles.statusTag, styles.statusPending]}>Pendente</Text>;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.grupo}>{escala.grupo}</Text>
        <View style={styles.dateContainer}>
          <Text style={styles.date}>{formattedDate}</Text>
          <Text style={styles.time}>{formattedTime}</Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <Text style={styles.membrosTitle}>Equipe:</Text>
      {escala.membros.map(membro => (
        <View key={membro.id} style={styles.membroRow}>
          <View>
            <Text style={styles.membroName}>{membro.name}</Text>
            <Text style={styles.membroRole}>{membro.role}</Text>
          </View>
          {renderStatus(membro)}
        </View>
      ))}

      {currentMember && currentMember.presencaConfirmada === undefined && (
        <View style={styles.actionsContainer}>
          {isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <TouchableOpacity 
                style={[styles.actionButton, styles.buttonRefuse]}
                onPress={() => handleConfirm(false)}
              >
                <Text style={styles.buttonTextRefuse}>Ausente</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.buttonConfirm]}
                onPress={() => handleConfirm(true)}
              >
                <Text style={styles.buttonTextConfirm}>Confirmar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grupo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  time: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  membrosTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  membroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  membroName: {
    fontSize: 14,
    color: colors.text,
  },
  membroRole: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  statusTag: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  statusOk: {
    backgroundColor: '#E6F4EA',
    color: colors.success,
  },
  statusNo: {
    backgroundColor: '#FCE8E6',
    color: colors.error,
  },
  statusPending: {
    backgroundColor: '#FEF7E0',
    color: colors.secondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  buttonConfirm: {
    backgroundColor: colors.primary,
  },
  buttonRefuse: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.error,
  },
  buttonTextConfirm: {
    color: colors.surface,
    fontWeight: 'bold',
  },
  buttonTextRefuse: {
    color: colors.error,
    fontWeight: 'bold',
  }
});

