import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { Escala, Membro } from '../../domain/entities/Escala';
import { colors } from '../../../../theme/colors';
import { User } from '../../../auth/domain/entities/User';
import { useConfirmarPresencaViewModel } from '../../../presenca/presentation/viewmodels/useConfirmarPresencaViewModel';
import { Ionicons } from '@expo/vector-icons';

interface EscalaCardProps {
  escala: Escala;
  currentUser: User;
  presencaViewModel: ReturnType<typeof useConfirmarPresencaViewModel>;
  onStatusChange: () => void;
  onEdit?: (escala: Escala) => void;
  onDelete?: (id: string) => void;
  onPublish?: (escala: Escala) => void;
}

export function EscalaCard({ 
  escala, 
  currentUser, 
  presencaViewModel, 
  onStatusChange,
  onEdit,
  onDelete,
  onPublish
}: EscalaCardProps) {
  const [justificationModalVisible, setJustificationModalVisible] = useState(false);
  const [justificationText, setJustificationText] = useState('');

  const dateObj = new Date(escala.data);
  const formattedDate = dateObj.toLocaleDateString('pt-BR', { 
    weekday: 'short', day: '2-digit', month: 'short' 
  });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  
  const formattedTime = dateObj.toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit'
  });

  const { confirmar, loadingId } = presencaViewModel;
  const isLoading = loadingId === escala.id;

  const currentMember = escala.membros.find(m => m.id === currentUser.id);

  const handleConfirm = (status: boolean) => {
    if (currentMember) {
      if (status === false) {
        setJustificationText('');
        setJustificationModalVisible(true);
      } else {
        confirmar(escala.id, currentMember.id, true, undefined, onStatusChange);
      }
    }
  };

  const handleSendJustification = () => {
    if (!justificationText.trim()) {
      Alert.alert('Aviso', 'Por favor, insira uma justificativa.');
      return;
    }
    setJustificationModalVisible(false);
    if (currentMember) {
      confirmar(escala.id, currentMember.id, false, justificationText.trim(), onStatusChange);
    }
  };

  // Função para pegar a inicial do nome
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Função para gerar uma cor de avatar persistente com base no nome
  const getAvatarColor = (name: string) => {
    const charCode = name.charCodeAt(0) || 0;
    const bgColors = [
      '#EFF6FF', // Blue 50
      '#F5F3FF', // Purple 50
      '#ECFDF5', // Emerald 50
      '#FFF7ED', // Orange 50
      '#FFF1F2', // Rose 50
      '#F0FDF4', // Green 50
    ];
    const textColors = [
      '#2563EB', // Blue 600
      '#7C3AED', // Purple 600
      '#059669', // Emerald 600
      '#EA580C', // Orange 600
      '#E11D48', // Rose 600
      '#16A34A', // Green 600
    ];
    const index = charCode % bgColors.length;
    return {
      bg: bgColors[index],
      text: textColors[index]
    };
  };

  const getLeftBarColor = () => {
    if (!currentMember) return colors.border;
    if (currentMember.presencaConfirmada === true) return colors.success;
    if (currentMember.presencaConfirmada === false) return colors.error;
    return colors.primary;
  };

  const renderStatus = (membro: Membro) => {
    if (membro.presencaConfirmada === true) {
      return (
        <View style={[styles.statusBadge, styles.statusOk]}>
          <Ionicons name="checkmark-circle" size={14} color={colors.success} style={styles.statusIcon} />
          <Text style={[styles.statusText, { color: colors.success }]}>Confirmado</Text>
        </View>
      );
    }
    if (membro.presencaConfirmada === false) {
      return (
        <View style={[styles.statusBadge, styles.statusNo]}>
          <Ionicons name="close-circle" size={14} color={colors.error} style={styles.statusIcon} />
          <Text style={[styles.statusText, { color: colors.error }]}>Ausente</Text>
        </View>
      );
    }
    return (
      <View style={[styles.statusBadge, styles.statusPending]}>
        <Ionicons name="help-circle" size={14} color={colors.secondary} style={styles.statusIcon} />
        <Text style={[styles.statusText, { color: colors.secondary }]}>Pendente</Text>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      {/* Barra de destaque lateral */}
      <View style={[styles.leftBar, { backgroundColor: getLeftBarColor() }]} />

      <View style={styles.cardContent}>
        {/* Cabeçalho do Card */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.groupBadge}>
              <Text style={styles.grupo}>{escala.grupo}</Text>
            </View>
            {!escala.publicada && (
              <View style={[styles.statusBadge, styles.statusDraft, { marginLeft: 8 }]}>
                <Ionicons name="eye-off-outline" size={12} color={colors.secondary} style={{ marginRight: 3 }} />
                <Text style={[styles.statusText, { color: colors.secondary }]}>Rascunho</Text>
              </View>
            )}
          </View>
          
          <View style={styles.headerRight}>
            {currentUser.role === 'admin' && (
              <View style={styles.adminHeaderButtons}>
                <TouchableOpacity 
                  onPress={() => onEdit?.(escala)} 
                  style={styles.adminIconButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="create-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => {
                    Alert.alert(
                      'Excluir Escala',
                      'Tem certeza que deseja excluir esta escala?',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        { 
                          text: 'Excluir', 
                          style: 'destructive',
                          onPress: () => onDelete?.(escala.id) 
                        }
                      ]
                    );
                  }} 
                  style={[styles.adminIconButton, { marginLeft: 8 }]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.dateContainer}>
              <View style={styles.dateTimeRow}>
                <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
                <Text style={styles.date}>{capitalizedDate}</Text>
              </View>
              <View style={[styles.dateTimeRow, { marginTop: 2 }]}>
                <Ionicons name="time-outline" size={14} color={colors.textMuted} style={{ marginRight: 4 }} />
                <Text style={styles.time}>{formattedTime}</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        {/* Equipe / Escalados */}
        <Text style={styles.membrosTitle}>Equipe Escalada</Text>
        <View style={styles.membrosList}>
          {escala.membros.map(membro => {
            const colorsPair = getAvatarColor(membro.name);
            const isMe = membro.id === currentUser.id;
            
            return (
              <View key={membro.id} style={styles.membroRowWrapper}>
                <View style={styles.membroRow}>
                  <View style={styles.membroLeft}>
                    <View style={[styles.membroAvatar, { backgroundColor: colorsPair.bg }]}>
                      <Text style={[styles.membroAvatarText, { color: colorsPair.text }]}>
                        {getInitials(membro.name)}
                      </Text>
                    </View>
                    <View style={styles.membroInfo}>
                      <Text style={[styles.membroName, isMe && styles.membroNameMe]}>
                        {membro.name} {isMe && '(Você)'}
                      </Text>
                      <Text style={styles.membroRole}>{membro.role}</Text>
                    </View>
                  </View>
                  {renderStatus(membro)}
                </View>
                {membro.presencaConfirmada === false && membro.justificativa && (
                  <View style={styles.justificationBox}>
                    <Ionicons name="chatbubble-outline" size={12} color={colors.error} style={{ marginRight: 4, marginTop: 1 }} />
                    <Text style={styles.justificativaText}>
                      Motivo: "{membro.justificativa}"
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Ações para o membro logado se pendente */}
        {currentMember && currentMember.presencaConfirmada === undefined && (
          <View style={styles.actionsContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Atualizando presença...</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.buttonRefuse]}
                  onPress={() => handleConfirm(false)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={18} color={colors.error} style={{ marginRight: 4 }} />
                  <Text style={styles.buttonTextRefuse}>Não posso ir</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.buttonConfirm]}
                  onPress={() => handleConfirm(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark" size={18} color={colors.surface} style={{ marginRight: 4 }} />
                  <Text style={styles.buttonTextConfirm}>Confirmar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Ação de Publicar para o Admin se for Rascunho */}
        {currentUser.role === 'admin' && !escala.publicada && (
          <View style={styles.adminActionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.buttonPublish]}
              onPress={() => onPublish?.(escala)}
              activeOpacity={0.8}
            >
              <Ionicons name="cloud-upload-outline" size={18} color={colors.surface} style={{ marginRight: 6 }} />
              <Text style={styles.buttonTextPublish}>Publicar Escala</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Modal de Justificativa de Ausência */}
      <Modal
        visible={justificationModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setJustificationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
              </View>
              <Text style={styles.modalTitle}>Justificar Ausência</Text>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Informe o motivo de não poder comparecer para <Text style={{ fontWeight: 'bold' }}>{escala.grupo}</Text> no dia {capitalizedDate}:
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: Viagem, trabalho, problemas de saúde..."
              placeholderTextColor={colors.textMuted}
              multiline={true}
              numberOfLines={4}
              value={justificationText}
              onChangeText={setJustificationText}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setJustificationModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSubmit]}
                onPress={handleSendJustification}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonTextSubmit}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  leftBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  cardContent: {
    padding: 20,
    paddingLeft: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.08)',
  },
  grupo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 0.3,
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  time: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  adminHeaderButtons: {
    flexDirection: 'row',
    marginRight: 12,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingRight: 12,
    alignItems: 'center',
  },
  adminIconButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 14,
  },
  membrosTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  membrosList: {
    gap: 12,
  },
  membroRowWrapper: {
    flexDirection: 'column',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.15)',
    paddingBottom: 8,
  },
  membroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  membroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  membroAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 1,
  },
  membroAvatarText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  membroInfo: {
    marginLeft: 10,
    flex: 1,
  },
  membroName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  membroNameMe: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  membroRole: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  justificationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.errorLight,
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
    marginLeft: 48,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.08)',
  },
  justificativaText: {
    fontSize: 12,
    color: colors.error,
    fontWeight: '500',
    fontStyle: 'italic',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  statusOk: {
    backgroundColor: colors.successLight,
  },
  statusNo: {
    backgroundColor: colors.errorLight,
  },
  statusPending: {
    backgroundColor: colors.secondaryLight,
  },
  statusDraft: {
    backgroundColor: colors.secondaryLight,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 16,
  },
  adminActionsContainer: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 14,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 8,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    marginLeft: 8,
    flex: 1,
  },
  buttonConfirm: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonRefuse: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  buttonPublish: {
    backgroundColor: colors.success,
    marginLeft: 0,
    width: '100%',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
    borderRadius: 14,
    paddingVertical: 12,
  },
  buttonTextConfirm: {
    color: colors.surface,
    fontWeight: 'bold',
    fontSize: 13,
  },
  buttonTextRefuse: {
    color: colors.error,
    fontWeight: 'bold',
    fontSize: 13,
  },
  buttonTextPublish: {
    color: colors.surface,
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.background,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
    outlineStyle: 'none',
  } as any,
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    flex: 1,
  },
  modalButtonCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtonSubmit: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  modalButtonTextCancel: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  modalButtonTextSubmit: {
    color: colors.surface,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
