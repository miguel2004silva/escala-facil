export interface Membro {
  id: string;
  name: string;
  role: string;
  presencaConfirmada?: boolean;
  justificativa?: string; // Justificativa de ausência
}

export interface Escala {
  id: string;
  data: string; // ISO date string
  grupo: string; // ex: 'Louvor', 'Recepção'
  membros: Membro[];
  publicada?: boolean; // Controle se a escala está publicada ou rascunho
}
