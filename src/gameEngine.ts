import { Player, PlayerStats, Position, MatchState, GeneratedEvent, TransferOffer, Club, Trophy } from './types';
import * as Data from './data.tsx';
const { clubs, matchSituations, getClubById, getClubsByTier } = Data;


export function calculateOverall(stats: PlayerStats, position: Position): number {
  const weights: Record<Position, Record<keyof PlayerStats, number>> = {
    forward: { speed: 1.5, shooting: 3, passing: 1.5, dribbling: 2.5, defense: 0.5, physical: 1 },
    midfielder: { speed: 1, shooting: 1.5, passing: 3, dribbling: 2, defense: 1.5, physical: 1 },
    defender: { speed: 1, shooting: 0.5, passing: 1.5, dribbling: 0.5, defense: 3, physical: 2.5 },
  };
  const w = weights[position];
  const totalWeight = Object.values(w).reduce((a, b) => a + b, 0);
  const weightedSum = Object.entries(w).reduce(
    (sum, [stat, weight]) => sum + (stats[stat as keyof PlayerStats] * weight), 0
  );
  return Math.round(weightedSum / totalWeight);
}

export function createPlayer(name: string, position: Position): Player {
  const startingClub = clubs.filter(c => c.tier === 5)[Math.floor(Math.random() * 4)];
  return {
    name,
    age: 17,
    position,
    stats: { speed: 35, shooting: 35, passing: 35, dribbling: 35, defense: 35, physical: 35 },
    clubId: startingClub.id,
    season: 1,
    seasonMatches: 0,
    seasonGoals: 0,
    seasonAssists: 0,
    seasonRatings: [],
    careerGoals: 0,
    careerAssists: 0,
    careerMatches: 0,
    energy: 3,
    maxEnergy: 3,
    history: [],
    trophies: [],
    retired: false,
  };
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateSortedMinutes(count: number, min: number, max: number): number[] {
  const minutes = new Set<number>();
  while (minutes.size < count) {
    minutes.add(min + Math.floor(Math.random() * (max - min)));
  }
  return Array.from(minutes).sort((a, b) => a - b);
}

function getRandomSituations(count: number) {
  const shuffled = shuffleArray(matchSituations);
  return shuffled.slice(0, count);
}

function calculateSuccess(statValue: number, difficulty: number): boolean {
  const multiplier = 0.85 - (difficulty - 1) * 0.12;
  const threshold = (statValue / 100) * multiplier;
  return Math.random() < threshold;
}

function getOpponentClub(playerClub: Club): Club {
  const sameTier = clubs.filter(c => c.tier === playerClub.tier && c.id !== playerClub.id);
  const nearbyTier = clubs.filter(c => Math.abs(c.tier - playerClub.tier) <= 1 && c.id !== playerClub.id);

  if (Math.random() < 0.7 && sameTier.length > 0) {
    return sameTier[Math.floor(Math.random() * sameTier.length)];
  }
  return nearbyTier[Math.floor(Math.random() * nearbyTier.length)];
}

function generateTeamGoals(playerClub: Club, opponent: Club, playerGoals: number, _playerAssists: number): number {
  const tierDiff = opponent.tier - playerClub.tier;
  const base = 0.8 + tierDiff * 0.3;
  const goals = playerGoals + Math.floor(Math.random() * (base + 1.5));
  return Math.max(playerGoals, goals);
}

function generateOpponentGoals(playerClub: Club, opponent: Club): number {
  const tierDiff = playerClub.tier - opponent.tier;
  const base = 1.0 + tierDiff * 0.3;
  const rand = Math.random();
  if (rand < 0.2) return 0;
  if (rand < 0.5) return 1;
  if (rand < 0.75) return 2;
  if (rand < 0.9) return 3;
  return Math.min(4, Math.floor(base + Math.random() * 2));
}

export function startMatch(player: Player): MatchState {
  const playerClub = getClubById(player.clubId);
  const opponent = getOpponentClub(playerClub);

  const numEvents = 8 + Math.floor(Math.random() * 5);
  const situations = getRandomSituations(numEvents);
  const minutes = generateSortedMinutes(numEvents, 5, 88);

  const events: GeneratedEvent[] = situations.map((sit, i) => ({
    minute: minutes[i],
    situation: sit,
  }));

  return {
    opponent,
    opponentScore: 0,
    teamScore: 0,
    events,
    currentIndex: 0,
    phase: 'intro',
    playerGoals: 0,
    playerAssists: 0,
    successCount: 0,
    failCount: 0,
    log: [],
  };
}

export function processChoice(match: MatchState, player: Player, choiceIndex: number): MatchState {
  const event = match.events[match.currentIndex];
  const choice = event.situation.choices[choiceIndex];
  const statValue = player.stats[choice.stat];
  const success = calculateSuccess(statValue, choice.difficulty);

  let goal = false;
  let assist = false;

  if (success) {
    if (choice.canGoal && Math.random() < 0.45) {
      goal = true;
    }
    if (!goal && choice.canAssist && Math.random() < 0.35) {
      assist = true;
    }
  }

  const resultText = success
    ? choice.successText
    : choice.failText;

  const updatedEvents = [...match.events];
  updatedEvents[match.currentIndex] = {
    ...event,
    chosenIndex: choiceIndex,
    success,
    resultText,
    goal,
    assist,
  };

  const newPlayerGoals = match.playerGoals + (goal ? 1 : 0);
  const newPlayerAssists = match.playerAssists + (assist ? 1 : 0);
  const newSuccessCount = match.successCount + (success ? 1 : 0);
  const newFailCount = match.failCount + (success ? 0 : 1);

  const logEntry = `${event.minute}' ${resultText}${goal ? ' ⚽ ГОЛ!' : ''}${assist ? ' 🅰️ Голевой пас!' : ''}`;

  return {
    ...match,
    events: updatedEvents,
    playerGoals: newPlayerGoals,
    playerAssists: newPlayerAssists,
    successCount: newSuccessCount,
    failCount: newFailCount,
    phase: 'result',
    log: [...match.log, logEntry],
  };
}

export function finishMatch(match: MatchState, player: Player): MatchState {
  const playerClub = getClubById(player.clubId);
  const teamScore = generateTeamGoals(playerClub, match.opponent, match.playerGoals, match.playerAssists);
  const opponentScore = generateOpponentGoals(playerClub, match.opponent);

  return {
    ...match,
    teamScore,
    opponentScore,
    phase: 'fulltime',
  };
}

export function calculateMatchRating(match: MatchState): number {
  const total = match.successCount + match.failCount;
  if (total === 0) return 5.0;

  const baseRating = 4 + (match.successCount / total) * 4;
  const goalBonus = match.playerGoals * 1.2;
  const assistBonus = match.playerAssists * 0.6;

  return Math.min(10, Math.round((baseRating + goalBonus + assistBonus) * 10) / 10);
}

export function applyMatchResult(player: Player, match: MatchState): Player {
  const rating = calculateMatchRating(match);

  // Stat growth based on match performance
  const growth = rating >= 7 ? 2 : rating >= 5.5 ? 1 : 0;
  const stats = { ...player.stats };

  if (growth > 0) {
    const statKeys = Object.keys(stats) as (keyof PlayerStats)[];
    // Grow stats based on match events
    match.events.forEach(e => {
      if (e.chosenIndex !== undefined && e.success) {
        const stat = e.situation.choices[e.chosenIndex].stat;
        stats[stat] = Math.min(99, stats[stat] + growth * 0.3);
      }
    });

    // Small overall growth
    if (player.age < 28) {
      statKeys.forEach(key => {
        stats[key] = Math.min(99, Math.round((stats[key] + 0.2) * 10) / 10);
      });
    }
  }

  // Round all stats
  const roundedStats: PlayerStats = {
    speed: Math.round(stats.speed),
    shooting: Math.round(stats.shooting),
    passing: Math.round(stats.passing),
    dribbling: Math.round(stats.dribbling),
    defense: Math.round(stats.defense),
    physical: Math.round(stats.physical),
  };

  return {
    ...player,
    stats: roundedStats,
    seasonMatches: player.seasonMatches + 1,
    seasonGoals: player.seasonGoals + match.playerGoals,
    seasonAssists: player.seasonAssists + match.playerAssists,
    seasonRatings: [...player.seasonRatings, rating],
    careerGoals: player.careerGoals + match.playerGoals,
    careerAssists: player.careerAssists + match.playerAssists,
    careerMatches: player.careerMatches + 1,
  };
}

export function trainStat(player: Player, stat: keyof PlayerStats): Player {
  const growth = player.age < 25 ? 3 : player.age < 30 ? 2 : 1;
  const randomGrowth = growth + Math.floor(Math.random() * 2);

  return {
    ...player,
    stats: {
      ...player.stats,
      [stat]: Math.min(99, player.stats[stat] + randomGrowth),
    },
    energy: player.energy - 1,
  };
}

export function generateTransferOffers(player: Player): TransferOffer[] {
  const overall = calculateOverall(player.stats, player.position);
  const playerClub = getClubById(player.clubId);
  const avgRating = player.seasonRatings.length > 0
    ? player.seasonRatings.reduce((a, b) => a + b, 0) / player.seasonRatings.length
    : 5;

  const offers: TransferOffer[] = [];

  // Determine target tiers based on overall
  let targetTiers: number[] = [];
  if (overall < 45) {
    targetTiers = [5, 4];
  } else if (overall < 55) {
    targetTiers = [4, 3];
  } else if (overall < 65) {
    targetTiers = [3, 2];
  } else if (overall < 75) {
    targetTiers = [2, 1];
  } else {
    targetTiers = [1];
  }

  // Better ratings = more offers from higher tiers
  if (avgRating >= 7.5) {
    const topTier = targetTiers[0] - 1;
    if (topTier >= 1 && !targetTiers.includes(topTier)) {
      targetTiers.unshift(topTier);
    }
  }

  const salaries: Record<number, string[]> = {
    5: ['500€/мес', '800€/мес', '300€/мес'],
    4: ['2,000€/мес', '3,000€/мес', '1,500€/мес'],
    3: ['8,000€/мес', '10,000€/мес', '7,000€/мес'],
    2: ['30,000€/мес', '40,000€/мес', '25,000€/мес'],
    1: ['100,000€/мес', '150,000€/мес', '80,000€/мес'],
  };

  const reputations: Record<number, string[]> = {
    5: ['Маленький клуб', 'Перспективный проект', 'Тёплый коллектив'],
    4: ['Растущий клуб', 'Амбициозный проект', 'Хороший тренер'],
    3: ['Известный клуб', 'Боевой состав', 'Еврокубковая мечта'],
    2: ['Топ-клуб страны', 'Легендарный клуб', 'Борьба за титул'],
    1: ['Великий клуб', 'Лига Чемпионов!', 'Лучший клуб мира'],
  };

  targetTiers.forEach(tier => {
    const tierClubs = getClubsByTier(tier).filter(c => c.id !== player.clubId);
    const numOffers = 1 + Math.floor(Math.random() * Math.min(2, tierClubs.length));
    const selected = shuffleArray(tierClubs).slice(0, numOffers);

    selected.forEach(club => {
      offers.push({
        club,
        salary: salaries[tier][Math.floor(Math.random() * salaries[tier].length)],
        reputation: reputations[tier][Math.floor(Math.random() * reputations[tier].length)],
      });
    });
  });

  // Always include current club renewal
  if (avgRating >= 6.0) {
    offers.push({
      club: playerClub,
      salary: salaries[playerClub.tier][Math.floor(Math.random() * salaries[playerClub.tier].length)],
      reputation: 'Остаться в клубе',
    });
  }

  return shuffleArray(offers).slice(0, 5);
}

export function endSeason(player: Player): { player: Player; trophies: Trophy[] } {
  const avgRating = player.seasonRatings.length > 0
    ? player.seasonRatings.reduce((a, b) => a + b, 0) / player.seasonRatings.length
    : 5;
  const club = getClubById(player.clubId);
  const trophies: Trophy[] = [];

  const entry = {
    season: player.season,
    clubName: club.name,
    clubEmoji: club.emoji,
    matches: player.seasonMatches,
    goals: player.seasonGoals,
    assists: player.seasonAssists,
    avgRating: Math.round(avgRating * 10) / 10,
  };

  // Check for trophies
  if (avgRating >= 8.0 && player.seasonGoals >= 10) {
    trophies.push({ name: 'Лучший бомбардир', emoji: '👟', season: player.season });
  }
  if (avgRating >= 8.5) {
    trophies.push({ name: 'Игрок сезона', emoji: '🌟', season: player.season });
  }
  if (club.tier <= 2 && avgRating >= 7.5) {
    trophies.push({ name: 'Чемпион страны', emoji: '🏆', season: player.season });
  }
  if (club.tier === 1 && avgRating >= 8.0) {
    trophies.push({ name: 'Лига Чемпионов', emoji: '⭐', season: player.season });
  }
  if (calculateOverall(player.stats, player.position) >= 90) {
    trophies.push({ name: 'Золотой мяч', emoji: '⚽🏆', season: player.season });
  }

  // Age effects
  const newStats = { ...player.stats };
  if (player.age >= 30) {
    const decline = Math.floor((player.age - 29) * 0.8);
    (Object.keys(newStats) as (keyof PlayerStats)[]).forEach(key => {
      newStats[key] = Math.max(20, newStats[key] - decline);
    });
  }

  const shouldRetire = player.age >= 36;

  return {
    player: {
      ...player,
      age: player.age + 1,
      season: player.season + 1,
      seasonMatches: 0,
      seasonGoals: 0,
      seasonAssists: 0,
      seasonRatings: [],
      energy: player.maxEnergy,
      stats: newStats,
      history: [...player.history, entry],
      trophies: [...player.trophies, ...trophies],
      retired: shouldRetire,
    },
    trophies,
  };
}

export function acceptTransfer(player: Player, clubId: string): Player {
  return {
    ...player,
    clubId,
    energy: player.maxEnergy,
  };
}
