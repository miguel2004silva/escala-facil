export interface CorRoupa {
  id: string;
  grupo: string;     // Ex: 'Louvor', 'Recepção'
  data: string;      // ISO Date string para o dia do culto
  cor: string;       // Ex: 'Branco', 'Preto', 'Azul Marinho'
  observacao?: string;
}
