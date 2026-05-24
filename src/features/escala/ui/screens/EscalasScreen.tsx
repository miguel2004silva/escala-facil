import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  StatusBar, 
  Modal, 
  TextInput, 
  ScrollView, 
  Alert, 
  Switch 
} from 'react-native';
import { colors } from '../../../../theme/colors';
import { EscalaCard } from '../components/EscalaCard';
import { User } from '../../../auth/domain/entities/User';
import { Escala, Membro } from '../../domain/entities/Escala';
import { makeEscalasViewModel, makeConfirmarPresencaViewModel } from '../../../../main/factories/EscalaFactory';
import { Ionicons } from '@expo/vector-icons';

interface EscalasScreenProps {
  currentUser: User;
  onLogout: () => void;
}

export function EscalasScreen({ currentUser, onLogout }: EscalasScreenProps) {
  // Instanciados como hooks estáveis chamados no top level do componente
  const viewModel = makeEscalasViewModel();
  const presencaViewModel = makeConfirmarPresencaViewModel();
  
  const { 
    escalas, 
    grupos, 
    usuarios,
    loading, 
    error, 
    fetchEscalas, 
    saveEscala, 
    deleteEscala, 
    fetchGrupos, 
    addGrupo, 
    removeGrupo,
    fetchUsuarios
  } = viewModel;

  const [activeFilter, setActiveFilter] = useState<string>('todas');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // Modais de Controle Administrativo
  const [grupoModalVisible, setGrupoModalVisible] = useState(false);
  const [escalaModalVisible, setEscalaModalVisible] = useState(false);
  
  // Estado de Formulário de Grupo
  const [newGrupoName, setNewGrupoName] = useState('');
  const [groupActionLoading, setGroupActionLoading] = useState(false);

  // Estado de Formulário de Escala
  const [editingEscala, setEditingEscala] = useState<Escala | null>(null);
  const [escalaDataStr, setEscalaDataStr] = useState('');
  const [escalaGrupo, setEscalaGrupo] = useState('');
  const [escalaPublicada, setEscalaPublicada] = useState(false);
  const [escalaMembros, setEscalaMembros] = useState<Membro[]>([]);
  
  // Estados para seleção de membro cadastrado
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [newMembroRole, setNewMembroRole] = useState('');

  // Carregar dados iniciais
  useEffect(() => {
    fetchEscalas();
    fetchGrupos();
    fetchUsuarios();
  }, [fetchEscalas, fetchGrupos, fetchUsuarios]);

  // Função para pegar as iniciais do usuário
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

  // Formatar a data de hoje para o cabeçalho
  const formattedToday = useMemo(() => {
    const date = new Date();
    const capitalized = date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'short' 
    });
    return capitalized.charAt(0).toUpperCase() + capitalized.slice(1);
  }, []);

  // Formatadores de data e parser
  const formatDateString = (dateObj: Date): string => {
    const d = dateObj.getDate().toString().padStart(2, '0');
    const m = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const y = dateObj.getFullYear();
    const h = dateObj.getHours().toString().padStart(2, '0');
    const min = dateObj.getMinutes().toString().padStart(2, '0');
    return `${d}/${m}/${y} ${h}:${min}`;
  };

  const parseDateString = (str: string): Date => {
    const parts = str.trim().split(' ');
    if (parts.length !== 2) throw new Error('Use o formato: DD/MM/AAAA HH:MM');
    const dateParts = parts[0].split('/');
    const timeParts = parts[1].split(':');
    if (dateParts.length !== 3 || timeParts.length !== 2) throw new Error('Use o formato: DD/MM/AAAA HH:MM');
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // 0-indexed
    const year = parseInt(dateParts[2], 10);
    const hour = parseInt(timeParts[0], 10);
    const minute = parseInt(timeParts[1], 10);
    const d = new Date(year, month, day, hour, minute);
    if (isNaN(d.getTime())) throw new Error('Data ou hora inválida.');
    return d;
  };

  // Funções de abertura de Modal administrativo
  const handleNewEscala = () => {
    setEditingEscala(null);
    const now = new Date();
    setEscalaDataStr(formatDateString(now));
    setEscalaGrupo(grupos[0] || '');
    setEscalaPublicada(false);
    setEscalaMembros([]);
    setSelectedUser(null);
    setNewMembroRole('');
    setUserSearchQuery('');
    setShowUserDropdown(false);
    setEscalaModalVisible(true);
  };

  const handleEditEscala = (escala: Escala) => {
    setEditingEscala(escala);
    setEscalaDataStr(formatDateString(new Date(escala.data)));
    setEscalaGrupo(escala.grupo);
    setEscalaPublicada(escala.publicada ?? false);
    setEscalaMembros([...escala.membros]);
    setSelectedUser(null);
    setNewMembroRole('');
    setUserSearchQuery('');
    setShowUserDropdown(false);
    setEscalaModalVisible(true);
  };

  const handleSaveEscala = async () => {
    try {
      if (!escalaGrupo) {
        Alert.alert('Erro', 'Por favor, selecione um grupo.');
        return;
      }
      if (escalaMembros.length === 0) {
        Alert.alert('Erro', 'Adicione pelo menos um membro à escala.');
        return;
      }
      
      let parsedDate: Date;
      try {
        parsedDate = parseDateString(escalaDataStr);
      } catch (err: any) {
        Alert.alert('Erro', err.message || 'Formato de data inválido. Use DD/MM/AAAA HH:MM');
        return;
      }

      const escalaObj: Escala = {
        id: editingEscala?.id || '',
        data: parsedDate.toISOString(),
        grupo: escalaGrupo,
        membros: escalaMembros,
        publicada: escalaPublicada
      };

      await saveEscala(escalaObj);
      setEscalaModalVisible(false);
      Alert.alert('Sucesso', editingEscala ? 'Escala atualizada!' : 'Escala criada com sucesso!');
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Erro ao salvar escala.');
    }
  };

  const handleDeleteEscala = async (id: string) => {
    try {
      await deleteEscala(id);
      Alert.alert('Sucesso', 'Escala excluída com sucesso.');
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Erro ao excluir escala.');
    }
  };

  const handlePublishEscala = async (escala: Escala) => {
    try {
      const updated = { ...escala, publicada: true };
      await saveEscala(updated);
      Alert.alert('Sucesso', 'Escala publicada com sucesso!');
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Erro ao publicar escala.');
    }
  };

  // Adicionar membro localmente
  const handleAddMembro = () => {
    if (!selectedUser) {
      Alert.alert('Aviso', 'Selecione um membro cadastrado.');
      return;
    }
    if (!newMembroRole.trim()) {
      Alert.alert('Aviso', 'Preencha a função do membro.');
      return;
    }
    // Verificar se já foi adicionado
    if (escalaMembros.some(m => m.id === selectedUser.id)) {
      Alert.alert('Aviso', 'Este membro já foi adicionado a esta escala.');
      return;
    }
    
    const newMembro: Membro = {
      id: selectedUser.id,
      name: selectedUser.name,
      role: newMembroRole.trim()
    };
    setEscalaMembros([...escalaMembros, newMembro]);
    setSelectedUser(null);
    setNewMembroRole('');
    setUserSearchQuery('');
  };

  const handleRemoveMembro = (id: string) => {
    setEscalaMembros(escalaMembros.filter(m => m.id !== id));
  };

  // Grupos handlers
  const handleAddGrupo = async () => {
    if (!newGrupoName.trim()) {
      Alert.alert('Aviso', 'Digite o nome do grupo.');
      return;
    }
    try {
      setGroupActionLoading(true);
      await addGrupo(newGrupoName.trim());
      setNewGrupoName('');
      Alert.alert('Sucesso', 'Grupo adicionado com sucesso!');
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Erro ao adicionar grupo.');
    } finally {
      setGroupActionLoading(false);
    }
  };

  const handleRemoveGrupo = async (name: string) => {
    Alert.alert(
      'Excluir Grupo',
      `Tem certeza que deseja excluir o grupo "${name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              setGroupActionLoading(true);
              await removeGrupo(name);
              Alert.alert('Sucesso', 'Grupo excluído com sucesso.');
            } catch (err: any) {
              Alert.alert('Erro', err.message || 'Erro ao excluir grupo.');
            } finally {
              setGroupActionLoading(false);
            }
          }
        }
      ]
    );
  };

  // Filtros
  const filteredEscalas = useMemo(() => {
    return escalas.filter(escala => {
      if (selectedGroup && escala.grupo !== selectedGroup) {
        return false;
      }

      if (currentUser.role === 'user') {
        if (!escala.publicada) return false;
        const currentMember = escala.membros.find(m => m.id === currentUser.id);
        if (activeFilter === 'todas') return true;
        if (activeFilter === 'pendentes') return currentMember?.presencaConfirmada === undefined;
        if (activeFilter === 'confirmadas') return currentMember?.presencaConfirmada === true;
      } else {
        if (activeFilter === 'todas') return true;
        if (activeFilter === 'rascunhos') return !escala.publicada;
        if (activeFilter === 'publicadas') return escala.publicada;
      }

      return true;
    });
  }, [escalas, activeFilter, selectedGroup, currentUser.id, currentUser.role]);

  const filteredUsuarios = useMemo(() => {
    return usuarios.filter(u => {
      const alreadyAdded = escalaMembros.some(m => m.id === u.id);
      if (alreadyAdded) return false;

      if (!userSearchQuery.trim()) return true;
      const search = userSearchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(search) || 
        u.email.toLowerCase().includes(search)
      );
    });
  }, [usuarios, escalaMembros, userSearchQuery]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(currentUser.name)}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Olá, {currentUser.name.split(' ')[0]} 👋</Text>
            <Text style={styles.dateText}>{formattedToday} • Perfil: {currentUser.role === 'admin' ? 'Admin' : 'Usuário'}</Text>
          </View>
        </View>
        <TouchableOpacity activeOpacity={0.7} onPress={onLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Admin Quick Actions */}
      {currentUser.role === 'admin' && (
        <View style={styles.adminActionRow}>
          <TouchableOpacity 
            style={[styles.adminHeaderButton, { backgroundColor: colors.primaryLight, borderColor: 'rgba(79, 70, 229, 0.1)' }]}
            onPress={handleNewEscala}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.adminHeaderButtonText, { color: colors.primary }]}>Nova Escala</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.adminHeaderButton, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => setGrupoModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="folder-open-outline" size={18} color={colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.adminHeaderButtonText, { color: colors.textSecondary }]}>Grupos</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Group Badges Filter */}
      <View style={styles.groupFilterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.groupFilterScroll}
        >
          <TouchableOpacity
            style={[styles.groupFilterBadge, !selectedGroup && styles.groupFilterBadgeActive]}
            onPress={() => setSelectedGroup(null)}
            activeOpacity={0.7}
          >
            <Text style={[styles.groupFilterText, !selectedGroup && styles.groupFilterTextActive]}>
              Todos os Grupos
            </Text>
          </TouchableOpacity>
          {grupos.map((g) => {
            const isSelected = selectedGroup === g;
            return (
              <TouchableOpacity
                key={g}
                style={[styles.groupFilterBadge, isSelected && styles.groupFilterBadgeActive]}
                onPress={() => setSelectedGroup(g)}
                activeOpacity={0.7}
              >
                <Text style={[styles.groupFilterText, isSelected && styles.groupFilterTextActive]}>
                  {g}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Tabs Filter */}
      <View style={styles.filterTabs}>
        {(currentUser.role === 'admin' 
          ? ['todas', 'rascunhos', 'publicadas'] 
          : ['todas', 'pendentes', 'confirmadas']
        ).map((filter) => {
          const isActive = activeFilter === filter;
          let label = 'Todas';
          if (filter === 'pendentes') label = 'Pendentes';
          if (filter === 'confirmadas') label = 'Confirmadas';
          if (filter === 'rascunhos') label = 'Rascunhos';
          if (filter === 'publicadas') label = 'Publicadas';

          return (
            <TouchableOpacity
              key={filter}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveFilter(filter)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      {error ? (
        <View style={styles.centerContainer}>
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={48} color={colors.error} />
            <Text style={styles.errorTitle}>Ops! Algo deu errado</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchEscalas} activeOpacity={0.8}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={filteredEscalas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EscalaCard 
              escala={item} 
              currentUser={currentUser}
              presencaViewModel={presencaViewModel}
              onStatusChange={fetchEscalas}
              onEdit={handleEditEscala}
              onDelete={handleDeleteEscala}
              onPublish={handlePublishEscala}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchEscalas}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={64} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>Nenhuma escala encontrada</Text>
                <Text style={styles.emptyText}>
                  {activeFilter === 'todas'
                    ? 'Nenhuma escala cadastrada recente.'
                    : activeFilter === 'pendentes'
                    ? 'Parabéns! Você respondeu a todas as suas escalas.'
                    : activeFilter === 'rascunhos'
                    ? 'Nenhum rascunho de escala salvo.'
                    : activeFilter === 'publicadas'
                    ? 'Nenhuma escala publicada encontrada.'
                    : 'Nenhuma escala encontrada com os filtros selecionados.'}
                </Text>
              </View>
            ) : (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )
          }
        />
      )}

      {/* Modal: Gerenciar Grupos */}
      <Modal
        visible={grupoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setGrupoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconContainer, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="folder-outline" size={24} color={colors.primary} />
              </View>
              <Text style={styles.modalTitle}>Gerenciar Grupos</Text>
            </View>

            <View style={styles.addGroupForm}>
              <TextInput
                style={styles.inlineInput}
                placeholder="Novo grupo (Ex: Som)"
                placeholderTextColor={colors.textMuted}
                value={newGrupoName}
                onChangeText={setNewGrupoName}
              />
              <TouchableOpacity
                style={styles.inlineButton}
                onPress={handleAddGrupo}
                disabled={groupActionLoading}
                activeOpacity={0.7}
              >
                {groupActionLoading ? (
                  <ActivityIndicator size="small" color={colors.surface} />
                ) : (
                  <Ionicons name="add" size={22} color={colors.surface} />
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Grupos Cadastrados</Text>
            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {grupos.map((g) => (
                <View key={g} style={styles.groupItem}>
                  <Text style={styles.groupItemText}>{g}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveGrupo(g)}
                    disabled={groupActionLoading}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
              {grupos.length === 0 && (
                <Text style={styles.emptyListText}>Nenhum grupo cadastrado.</Text>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setGrupoModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Criar / Editar Escala */}
      <Modal
        visible={escalaModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEscalaModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%', width: '95%', maxWidth: 500 }]}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconContainer, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="calendar-outline" size={24} color={colors.primary} />
              </View>
              <Text style={styles.modalTitle}>
                {editingEscala ? 'Editar Escala' : 'Nova Escala'}
              </Text>
            </View>

            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              {/* Campo: Grupo/Ministério */}
              <Text style={styles.fieldLabel}>Grupo / Ministério</Text>
              <View style={styles.groupSelectContainer}>
                {grupos.map((g) => {
                  const isSelected = escalaGrupo === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      style={[styles.groupSelectBadge, isSelected && styles.groupSelectBadgeActive]}
                      onPress={() => setEscalaGrupo(g)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.groupSelectText, isSelected && styles.groupSelectTextActive]}>
                        {g}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                {grupos.length === 0 && (
                  <Text style={styles.emptyListText}>Nenhum grupo disponível. Crie um primeiro.</Text>
                )}
              </View>
              
              {/* Campo: Data e Hora */}
              <Text style={styles.fieldLabel}>Data e Hora (DD/MM/AAAA HH:MM)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ex: 23/05/2026 19:30"
                placeholderTextColor={colors.textMuted}
                value={escalaDataStr}
                onChangeText={setEscalaDataStr}
              />

              {/* Status: Publicada ou Rascunho */}
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Publicada (Visível)</Text>
                  <Text style={styles.fieldHelp}>
                    Se ativado, os usuários comuns poderão visualizar esta escala.
                  </Text>
                </View>
                <Switch
                  value={escalaPublicada}
                  onValueChange={setEscalaPublicada}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={escalaPublicada ? colors.primary : '#f4f3f4'}
                />
              </View>

              {/* Seção: Membros Escalados */}
              <View style={styles.membrosSectionHeader}>
                <Text style={[styles.fieldLabel, { marginBottom: 4 }]}>Equipe Escalada ({escalaMembros.length})</Text>
              </View>

              <View style={styles.formMembrosList}>
                {escalaMembros.map((m) => {
                  const colorsPair = getAvatarColor(m.name);
                  return (
                    <View key={m.id} style={styles.formMembroItem}>
                      <View style={[styles.membroAvatarMini, { backgroundColor: colorsPair.bg, marginRight: 10 }]}>
                        <Text style={[styles.membroAvatarMiniText, { color: colorsPair.text }]}>
                          {getInitials(m.name)}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.formMembroName}>{m.name}</Text>
                        <View style={{ flexDirection: 'row', marginTop: 3 }}>
                          <View style={styles.roleBadge}>
                            <Text style={styles.roleBadgeText}>{m.role}</Text>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity 
                        onPress={() => handleRemoveMembro(m.id)} 
                        activeOpacity={0.7}
                        style={styles.removeMembroButton}
                      >
                        <Ionicons name="trash-outline" size={15} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
                {escalaMembros.length === 0 && (
                  <Text style={styles.emptyListText}>Nenhum membro adicionado a esta equipe.</Text>
                )}
              </View>

              {/* Adicionar Membro da Plataforma */}
              <View style={styles.addMembroBox}>
                <Text style={styles.addMembroTitle}>Adicionar Membro à Equipe</Text>
                
                {/* Dropdown de Usuários */}
                <Text style={styles.dropdownLabel}>Membro Cadastrado</Text>
                <TouchableOpacity
                  style={styles.dropdownSelector}
                  onPress={() => setShowUserDropdown(!showUserDropdown)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    {selectedUser ? (
                      <>
                        <View style={[styles.membroAvatarMini, { backgroundColor: getAvatarColor(selectedUser.name).bg, marginRight: 8, width: 28, height: 28, borderRadius: 14 }]}>
                          <Text style={[styles.membroAvatarMiniText, { color: getAvatarColor(selectedUser.name).text, fontSize: 10 }]}>
                            {getInitials(selectedUser.name)}
                          </Text>
                        </View>
                        <Text style={styles.dropdownSelectorTextSelected} numberOfLines={1}>
                          {selectedUser.name}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="person-outline" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
                        <Text style={styles.dropdownSelectorTextPlaceholder}>
                          Selecionar Membro...
                        </Text>
                      </>
                    )}
                  </View>
                  <Ionicons name={showUserDropdown ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
                </TouchableOpacity>

                {showUserDropdown && (
                  <View style={styles.dropdownListContainer}>
                    <View style={styles.dropdownSearchWrapper}>
                      <Ionicons name="search-outline" size={15} color={colors.textMuted} style={{ marginRight: 8 }} />
                      <TextInput
                        style={styles.dropdownSearchInput}
                        placeholder="Buscar por nome ou e-mail..."
                        placeholderTextColor={colors.textMuted}
                        value={userSearchQuery}
                        onChangeText={setUserSearchQuery}
                      />
                    </View>
                    <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                      {filteredUsuarios.length === 0 ? (
                        <Text style={styles.dropdownItemEmpty}>Nenhum membro disponível</Text>
                      ) : (
                        filteredUsuarios.map((u) => {
                          const colorsPair = getAvatarColor(u.name);
                          const isSelected = selectedUser?.id === u.id;
                          return (
                            <TouchableOpacity
                              key={u.id}
                              style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                              onPress={() => {
                                setSelectedUser(u);
                                setShowUserDropdown(false);
                              }}
                              activeOpacity={0.7}
                            >
                              <View style={[styles.membroAvatarMini, { backgroundColor: colorsPair.bg, width: 32, height: 32, borderRadius: 16 }]}>
                                <Text style={[styles.membroAvatarMiniText, { color: colorsPair.text, fontSize: 11 }]}>
                                  {getInitials(u.name)}
                                </Text>
                              </View>
                              <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextActive]}>
                                  {u.name}
                                </Text>
                                <Text style={styles.dropdownItemEmail}>{u.email}</Text>
                              </View>
                              {isSelected && (
                                <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                              )}
                            </TouchableOpacity>
                          );
                        })
                      )}
                    </ScrollView>
                  </View>
                )}

                <Text style={styles.dropdownLabel}>Função / Instrumento</Text>
                <TextInput
                  style={styles.formInputSmall}
                  placeholder="Função (Ex: Vocal, Violão, Som)"
                  placeholderTextColor={colors.textMuted}
                  value={newMembroRole}
                  onChangeText={setNewMembroRole}
                />

                {/* Role suggestion chips */}
                <View style={styles.chipsContainer}>
                  {['Vocal', 'Violão', 'Teclado', 'Bateria', 'Som', 'Mídia', 'Recepção'].map((roleChip) => (
                    <TouchableOpacity
                      key={roleChip}
                      style={[
                        styles.chip,
                        newMembroRole.toLowerCase() === roleChip.toLowerCase() && styles.chipActive
                      ]}
                      onPress={() => setNewMembroRole(roleChip)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.chipText,
                        newMembroRole.toLowerCase() === roleChip.toLowerCase() && styles.chipTextActive
                      ]}>
                        {roleChip}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.addMembroButton}
                  onPress={handleAddMembro}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={16} color={colors.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.addMembroButtonText}>Inserir na Lista</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setEscalaModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSubmit]}
                onPress={handleSaveEscala}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonTextSubmit}>Salvar Escala</Text>
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
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 18,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(79, 70, 229, 0.15)',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.errorLight,
    backgroundColor: 'rgba(239, 68, 68, 0.02)',
  },
  logoutText: {
    color: colors.error,
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 4,
  },
  adminActionRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
    gap: 12,
  },
  adminHeaderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  adminHeaderButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  groupFilterContainer: {
    backgroundColor: colors.surface,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
  },
  groupFilterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  groupFilterBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  groupFilterBadgeActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  groupFilterText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  groupFilterTextActive: {
    color: colors.surface,
    fontWeight: 'bold',
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderColor: 'transparent',
  },
  tabActive: {
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    maxWidth: 320,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 6,
  },
  errorText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: {
    color: colors.surface,
    fontWeight: 'bold',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalScrollView: {
    maxHeight: '100%',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  fieldHelp: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  formInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.background,
    marginBottom: 18,
  },
  formInputSmall: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: 16,
  },
  groupSelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  groupSelectBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  groupSelectBadgeActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  groupSelectText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  groupSelectTextActive: {
    color: colors.surface,
    fontWeight: 'bold',
  },
  membrosSectionHeader: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 16,
    marginBottom: 12,
  },
  formMembrosList: {
    gap: 8,
    marginBottom: 16,
  },
  formMembroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  formMembroName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  formMembroRole: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addMembroBox: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 18,
    padding: 16,
    backgroundColor: colors.background,
    marginBottom: 20,
  },
  addMembroTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  addMembroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: colors.primaryLight,
    marginTop: 8,
  },
  addMembroButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
  },
  dropdownLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  dropdownSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    marginBottom: 12,
  },
  dropdownSelectorTextPlaceholder: {
    color: colors.textMuted,
    fontSize: 14,
  },
  dropdownSelectorTextSelected: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownListContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    marginBottom: 12,
    maxHeight: 180,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  dropdownSearchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.text,
    backgroundColor: 'transparent',
  },
  dropdownScroll: {
    maxHeight: 130,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dropdownItemActive: {
    backgroundColor: colors.primaryLight,
  },
  dropdownItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  dropdownItemTextActive: {
    color: colors.primary,
  },
  dropdownItemEmail: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dropdownItemEmpty: {
    padding: 12,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
  },
  addGroupForm: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  inlineInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
  },
  inlineButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalList: {
    maxHeight: 180,
    marginBottom: 16,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  groupItemText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  emptyListText: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  modalCloseButton: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  membroAvatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  membroAvatarMiniText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  roleBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  roleBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  removeMembroButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownSearchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    height: 40,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    marginBottom: 14,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.surface,
    fontWeight: 'bold',
  },
});
