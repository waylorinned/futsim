export type Position = 'forward' | 'midfielder' | 'defender';

export interface PlayerStats {
  speed: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defense: number;
  physical: number;
}

export interface Player {
  name: string;
  age: number;
  position: Position;
  stats: PlayerStats;
  clubId: string;
  season: number;
  seasonMatches: number;
  seasonGoals: number;
  seasonAssists: number;
  seasonRatings: number[];
  careerGoals: number;
  careerAssists: number;
  careerMatches: number;
  energy: number;
  maxEnergy: number;
  history: CareerEntry[];
  trophies: Trophy[];
  retired: boolean;
}

export interface Club {
  id: string;
  name: string;
  tier: number;
  emoji: string;
  league: string;
  color: string;
}

export interface MatchSituation {
  text: string;
  choices: MatchChoice[];
}

export interface MatchChoice {
  label: string;
  stat: keyof PlayerStats;
  difficulty: number;
  successText: string;
  failText: string;
  canGoal: boolean;
  canAssist: boolean;
}

export interface GeneratedEvent {
  minute: number;
  situation: MatchSituation;
  chosenIndex?: number;
  success?: boolean;
  resultText?: string;
  goal?: boolean;
  assist?: boolean;
}

export interface MatchState {
  opponent: Club;
  opponentScore: number;
  teamScore: number;
  events: GeneratedEvent[];
  currentIndex: number;
  phase: 'intro' | 'situation' | 'result' | 'fulltime';
  playerGoals: number;
  playerAssists: number;
  successCount: number;
  failCount: number;
  log: string[];
}

export interface TransferOffer {
  club: Club;
  salary: string;
  reputation: string;
}

export interface CareerEntry {
  season: number;
  clubName: string;
  clubEmoji: string;
  matches: number;
  goals: number;
  assists: number;
  avgRating: number;
}

export interface Trophy {
  name: string;
  emoji: string;
  season: number;
}

export type GameScreen =
  | 'menu'
  | 'create'
  | 'dashboard'
  | 'match'
  | 'matchResult'
  | 'training'
  | 'transfers'
  | 'seasonEnd'
  | 'retirement';
