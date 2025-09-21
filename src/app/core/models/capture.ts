export enum Rarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGEND = 'legend'
}

export type RarityType = 'common' | 'rare' | 'epic' | 'legend';

export interface Capture {
  id: string;
  trainerName: string;
  species: string;
  rarity: RarityType;
  date: string;
}
