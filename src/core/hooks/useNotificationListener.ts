import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { supabase } from '../../main/config/supabase';
import { User } from '../../features/auth/domain/entities/User';
import { EscalaRepository } from '../../features/escala/data/repositories/EscalaRepository';

// Configura o manipulador de notificações locais
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  } as any),
});

const escalaRepository = new EscalaRepository();

const formatIsoDate = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    const h = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    return `${d}/${m}/${y} às ${h}:${min}`;
  } catch {
    return isoString;
  }
};

export function useNotificationListener(currentUser: User | null) {
  useEffect(() => {
    if (!currentUser) return;

    // 1. Solicitar permissões de notificação no dispositivo
    async function requestPermissions() {
      if (Platform.OS === 'web') return;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Permissão para exibir notificações locais negada.');
      }
    }

    requestPermissions();

    // 2. Disparar notificação local
    async function triggerLocalNotification(title: string, body: string) {
      if (Platform.OS === 'web') {
        alert(`🔔 ${title}\n\n${body}`);
      } else {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title,
              body,
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: null, // Imediato
          });
        } catch (err) {
          console.error('Erro ao disparar notificação local:', err);
        }
      }
    }

    // 3. Inscrever-se nos canais Realtime do Supabase
    // Canal A: Inserção direta de membros na escala
    const membrosChannel = supabase
      .channel('membros_escala_inseridos')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'membros_escala',
          filter: `id=eq.${currentUser.id}`,
        },
        async (payload: any) => {
          const escalaId = payload.new.escala_id;
          const funcao = payload.new.funcao || 'Membro';
          
          // Aguarda um pequeno delay para garantir que a escala tenha sido completamente gravada no banco
          await new Promise(resolve => setTimeout(resolve, 1000));
          const escala = await escalaRepository.getEscalaById(escalaId);
          if (escala && escala.publicada) {
            triggerLocalNotification(
              'Escala Confirmada! 📅',
              `Você foi escalado no grupo ${escala.grupo} para o culto de ${formatIsoDate(escala.data)} na função de ${funcao}.`
            );
          }
        }
      )
      .subscribe();

    // Canal B: Atualização na escala (Publicação de Rascunho)
    const escalasChannel = supabase
      .channel('escalas_atualizadas')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'escalas',
        },
        async (payload: any) => {
          const wasPublished = payload.old.publicada;
          const isPublished = payload.new.publicada;
          
          // Se a escala foi publicada agora
          if (isPublished && !wasPublished) {
            const escalaId = payload.new.id;
            // Aguarda um pequeno delay para evitar a race condition com a gravação dos membros
            await new Promise(resolve => setTimeout(resolve, 1000));
            const escala = await escalaRepository.getEscalaById(escalaId);
            
            if (escala) {
              // Verificar se o usuário atual é membro desta escala
              const membro = escala.membros.find(m => m.id === currentUser.id);
              if (membro) {
                triggerLocalNotification(
                  'Nova Escala Publicada! 📢',
                  `A escala do grupo ${escala.grupo} para o dia ${formatIsoDate(escala.data)} foi publicada. Você atuará como ${membro.role}.`
                );
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(membrosChannel);
      supabase.removeChannel(escalasChannel);
    };
  }, [currentUser]);
}
