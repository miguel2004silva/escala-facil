export interface Membro {
  id: string;
  name: string;
  role: string;
  presencaConfirmada?: boolean;
}

export interface Escala {
  id: string;
  data: string; // ISO date string
  grupo: string; // ex: 'Louvor', 'Recepção'
  membros: Membro[];
}
