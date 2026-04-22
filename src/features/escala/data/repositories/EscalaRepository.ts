import { IEscalaRepository } from '../../domain/repositories/IEscalaRepository';
import { Escala } from '../../domain/entities/Escala';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOCK_ESCALAS: Escala[] = [
  {
    id: '1',
    data: new Date(Date.now() + 86400000).toISOString(), // Amanhã
    grupo: 'Louvor',
    membros: [
      { id: '1', name: 'João Silva', role: 'Vocal', presencaConfirmada: true },
      { id: '2', name: 'Membro Comum', role: 'Violão' } // presencaConfirmada undefined
    ]
  },
  {
    id: '2',
    data: new Date(Date.now() + 86400000 * 7).toISOString(), // Próxima semana
    grupo: 'Recepção',
    membros: [
      { id: '3', name: 'Maria Souza', role: 'Porta Principal' },
      { id: '2', name: 'Membro Comum', role: 'Estacionamento' }
    ]
  }
];

const ESCALAS_KEY = '@EscalaFacil:escalas';

export class EscalaRepository implements IEscalaRepository {
  async getEscalas(): Promise<Escala[]> {
    // Simula API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Para fins do mock inicial, vamos sempre popular se estiver vazio
    const stored = await AsyncStorage.getItem(ESCALAS_KEY);
    if (!stored) {
      await AsyncStorage.setItem(ESCALAS_KEY, JSON.stringify(MOCK_ESCALAS));
      return MOCK_ESCALAS;
    }
    
    return JSON.parse(stored) as Escala[];
  }

  async getEscalaById(id: string): Promise<Escala | null> {
    const escalas = await this.getEscalas();
    return escalas.find(e => e.id === id) || null;
  }
}
