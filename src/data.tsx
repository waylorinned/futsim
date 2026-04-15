import { useState, useCallback } from 'react';
import { Player, PlayerStats, Position, MatchState, TransferOffer, Trophy, GameScreen } from './types';
import {
  getClubById, positionNames, positionEmoji,
  statNames, statEmoji, leagueNames, tierColors,
} from './data';
import {
  calculateOverall, createPlayer, startMatch, processChoice,
  finishMatch, calculateMatchRating, applyMatchResult,
  trainStat, generateTransferOffers, endSeason, acceptTransfer,
} from './gameEngine';

/* ─── Helper: Stat Bar ─── */
function StatBar({ value, max = 99, color = '#10b981' }: { value: number; max?: number; color?: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

export { clubs, matchSituations, getClubById, getClubsByTier };

/* ─── Helper: Overall Badge ─── */
function OverallBadge({ player }: { player: Player }) {
  const ovr = calculateOverall(playe.stats, player.position);
  const color = ovr >= 85 ? 'text-yellow-400' : ovr >= 70 ? 'text-emerald-400' : ovr >= 55 ? 'text-blue-400' : 'text-gray-400';
  return (
    <div className="flex flex-col items-center">
      <span className={`text-4xl font-black ${color}`}>{ovr}</span>
      <span className="text-xs text-gray-500 uppercase tracking-wider">Overall</span>
    </div>
  );
}

/* ─── Helper: Player Card Header ─── */
function PlayerCardHeader({ player }: { player: Player }) {
  const club = getClubById(player.clubId);
  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 border border-slate-700">
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-900 flex items-center justify-center text-4xl">
          {positionEmoji[player.position]}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">{player.name}</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-emerald-400 text-sm font-medium">{positionNames[player.position]}</span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400 text-sm">Возраст: {player.age}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg">{club.emoji}</span>
            <span className="text-white text-sm font-medium">{club.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: tierColors[club.tier] + '33', color: tierColors[club.tier] }}>
              {leagueNames[club.tier]}
            </span>
          </div>
        </div>
        <OverallBadge player={player} />
      </div>
    </div>
  );
}

/* ─── Menu Screen ─── */
function MenuScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-slate-900 to-gray-950 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <div className="text-8xl mb-6 animate-bounce">⚽</div>
        <h1 className="text-6xl font-black text-white mb-3 tracking-tight">
          ФУТБОЛ<span className="text-emerald-400">ИСТ</span>
        </h1>
        <p className="text-xl text-gray-400">Симулятор футбольной карьеры</p>
        <p className="text-sm text-gray-600 mt-2">От двора до Лиги Чемпионов</p>
      </div>
      <button
        onClick={onStart}
        className="px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xl font-bold rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95"
      >
        🏟️ Новая карьера
      </button>
      <div className="mt-16 grid grid-cols-3 gap-8 text-center text-gray-500 text-sm">
        <div>
          <div className="text-3xl mb-2">🏃</div>
          <div>Тренируйся</div>
        </div>
        <div>
          <div className="text-3xl mb-2">⚽</div>
          <div>Играй матчи</div>
        </div>
        <div>
          <div className="text-3xl mb-2">🏆</div>
          <div>Стань легендой</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Create Player Screen ─── */
function CreateScreen({ onCreate }: { onCreate: (name: string, position: Position, bonusStats: PlayerStats) => void }) {
  const [name, setName] = useState('');
  const [position, setPosition] = useState<Position>('forward');
  const [bonusPoints, setBonusPoints] = useState(20);
  const [bonusStats, setBonusStats] = useState<PlayerStats>({ speed: 0, shooting: 0, passing: 0, dribbling: 0, defense: 0, physical: 0 });

  const addStat = (stat: keyof PlayerStats) => {
    if (bonusPoints > 0) {
      setBonusPoints(p => p - 1);
      setBonusStats(s => ({ ...s, [stat]: s[stat] + 1 }));
    }
  };
  const removeStat = (stat: keyof PlayerStats) => {
    if (bonusStats[stat] > 0) {
      setBonusPoints(p => p + 1);
      setBonusStats(s => ({ ...s, [stat]: s[stat] - 1 }));
    }
  };

  const handleSubmit = () => {
    if (name.trim()) {
      onCreate(name.trim(), position, bonusStats);
    }
  };

  const positions: Position[] = ['forward', 'midfielder', 'defender'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-slate-900 to-gray-950 p-4 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold text-white text-center mb-8">🆕 Создание игрока</h1>

        {/* Name */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2 font-medium">Имя игрока</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Введите имя..."
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-lg"
          />
        </div>

        {/* Position */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2 font-medium">Позиция</label>
          <div className="grid grid-cols-3 gap-3">
            {positions.map(pos => (
              <button
                key={pos}
                onClick={() => setPosition(pos)}
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  position === pos
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-700 bg-slate-800 text-gray-400 hover:border-slate-500'
                }`}
              >
                <div className="text-2xl mb-1">{positionEmoji[pos]}</div>
                <div className="text-sm font-medium">{positionNames[pos]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Stat Allocation */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-gray-400 font-medium">Распределение очков</label>
            <span className={`text-sm font-bold ${bonusPoints > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              Осталось: {bonusPoints}
            </span>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
            {(Object.keys(bonusStats) as (keyof PlayerStats)[]).map(stat => (
              <div key={stat} className="flex items-center gap-3">
                <span className="w-8">{statEmoji[stat]}</span>
                <span className="w-24 text-sm text-gray-300">{statNames[stat]}</span>
                <button
                  onClick={() => removeStat(stat)}
                  className="w-8 h-8 rounded-lg bg-slate-700 text-gray-400 hover:bg-slate-600 flex items-center justify-center font-bold transition-colors"
                >−</button>
                <span className="w-10 text-center font-bold text-white">{35 + bonusStats[stat]}</span>
                <button
                  onClick={() => addStat(stat)}
                  disabled={bonusPoints === 0}
                  className="w-8 h-8 rounded-lg bg-emerald-700 text-white hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-gray-500 flex items-center justify-center font-bold transition-colors"
                >+</button>
                <div className="flex-1">
                  <StatBar value={35 + bonusStats[stat]} color="#10b981" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OVR Preview */}
        <div className="text-center mb-6 text-gray-400 text-sm">
          Превью OVR: <span className="text-white font-bold text-lg">
            {calculateOverall(
              Object.fromEntries(Object.entries(bonusStats).map(([k, v]) => [k, 35 + v])) as PlayerStats,
              position
            )}
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-gray-500 text-white text-lg font-bold rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          🏟️ Начать карьеру
        </button>
      </div>
    </div>
  );
}

/* ─── Dashboard Screen ─── */
function DashboardScreen({
  player, onPlayMatch, onTrain, onEndSeason,
}: {
  player: Player;
  onPlayMatch: () => void;
  onTrain: () => void;
  onEndSeason: () => void;
}) {
  const ovr = calculateOverall(player.stats, player.position);
  const avgRating = player.seasonRatings.length > 0
    ? (player.seasonRatings.reduce((a, b) => a + b, 0) / player.seasonRatings.length).toFixed(1)
    : '—';
  const seasonComplete = player.seasonMatches >= 10;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-slate-900 to-gray-950 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Player Card */}
        <PlayerCardHeader player={player} />

        {/* Season Info */}
        <div className="mt-4 bg-slate-800/50 rounded-2xl p-5 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-white">📊 Сезон {player.season}</h3>
            <span className="text-sm text-gray-400">{player.seasonMatches}/10 матчей</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${player.seasonMatches * 10}%` }}
            />
          </div>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{player.seasonGoals}</div>
              <div className="text-xs text-gray-500">Голы</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{player.seasonAssists}</div>
              <div className="text-xs text-gray-500">Передачи</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{avgRating}</div>
              <div className="text-xs text-gray-500">Ср. оценка</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">{ovr}</div>
              <div className="text-xs text-gray-500">OVR</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 bg-slate-800/50 rounded-2xl p-5 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">💪 Характеристики</h3>
          <div className="space-y-3">
            {(Object.keys(player.stats) as (keyof PlayerStats)[]).map(stat => (
              <div key={stat}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300">{statEmoji[stat]} {statNames[stat]}</span>
                  <span className={`text-sm font-bold ${player.stats[stat] >= 80 ? 'text-yellow-400' : player.stats[stat] >= 60 ? 'text-emerald-400' : 'text-gray-300'}`}>
                    {player.stats[stat]}
                  </span>
                </div>
                <StatBar
                  value={player.stats[stat]}
                  color={player.stats[stat] >= 80 ? '#facc15' : player.stats[stat] >= 60 ? '#10b981' : '#6b7280'}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Career Stats */}
        <div className="mt-4 bg-slate-800/50 rounded-2xl p-5 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-3">📈 Карьера</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{player.careerGoals}</div>
              <div className="text-xs text-gray-500">Голов за карьеру</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{player.careerAssists}</div>
              <div className="text-xs text-gray-500">Передач за карьеру</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{player.careerMatches}</div>
              <div className="text-xs text-gray-500">Матчей за карьеру</div>
            </div>
          </div>
        </div>

        {/* Trophies */}
        {player.trophies.length > 0 && (
          <div className="mt-4 bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-2xl p-5 border border-amber-700/50">
            <h3 className="text-lg font-bold text-amber-400 mb-3">🏆 Трофеи</h3>
            <div className="flex flex-wrap gap-2">
              {player.trophies.map((t, i) => (
                <span key={i} className="px-3 py-1.5 bg-amber-900/50 rounded-full text-amber-300 text-sm border border-amber-700/50">
                  {t.emoji} {t.name} (Сезон {t.season})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 space-y-3 pb-8">
          {!seasonComplete && (
            <>
              <button
                onClick={onPlayMatch}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-bold rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                ⚽ Играть матч ({10 - player.seasonMatches} осталось)
              </button>
              <button
                onClick={onTrain}
                disabled={player.energy <= 0}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-gray-500 text-white font-bold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                💪 Тренировка ({player.energy} энергии)
              </button>
            </>
          )}
          {seasonComplete && (
            <button
              onClick={onEndSeason}
              className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white text-lg font-bold rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
            >
              📅 Завершить сезон
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Match Screen ─── */
function MatchScreen({
  player, match, onChoose, onAdvance, onFinish, onBack,
}: {
  player: Player;
  match: MatchState;
  onChoose: (index: number) => void;
  onAdvance: () => void;
  onFinish: () => void;
  onBack: () => void;
}) {
  const club = getClubById(player.clubId);
  const currentEvent = match.currentIndex < match.events.length ? match.events[match.currentIndex] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-slate-900 to-gray-950 p-4">
      <div className="max-w-lg mx-auto">
        {/* Score Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 border border-slate-700 mb-4">
          <div className="text-center text-xs text-gray-500 uppercase tracking-wider mb-2">
            {match.phase === 'intro' ? 'Предматчевая' : `${currentEvent?.minute || match.events[match.events.length - 1]?.minute || 90}' минута`}
          </div>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center flex-1">
              <div className="text-2xl mb-1">{club.emoji}</div>
              <div className="text-sm text-white font-medium truncate">{club.name}</div>
              <div className="text-3xl font-black text-white mt-1">{match.phase === 'fulltime' ? match.teamScore : '—'}</div>
            </div>
            <div className="text-2xl text-gray-600 font-bold">VS</div>
            <div className="text-center flex-1">
              <div className="text-2xl mb-1">{match.opponent.emoji}</div>
              <div className="text-sm text-white font-medium truncate">{match.opponent.name}</div>
              <div className="text-3xl font-black text-white mt-1">{match.phase === 'fulltime' ? match.opponentScore : '—'}</div>
            </div>
          </div>
        </div>

        {/* Match stats bar */}
        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700 mb-4 flex items-center justify-between text-sm">
          <span className="text-gray-400">⚽ {match.playerGoals} гол.</span>
          <span className="text-gray-400">🅰️ {match.playerAssists} пер.</span>
          <span className="text-emerald-400">✓ {match.successCount}</span>
          <span className="text-red-400">✗ {match.failCount}</span>
        </div>

        {/* Intro Phase */}
        {match.phase === 'intro' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-6">🏟️</div>
            <h2 className="text-2xl font-bold text-white mb-2">Матч начинается!</h2>
            <p className="text-gray-400 mb-8">{club.name} vs {match.opponent.name}</p>
            <button
              onClick={onAdvance}
              className="px-10 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all"
            >
              ⚽ Начать
            </button>
          </div>
        )}

        {/* Situation Phase */}
        {match.phase === 'situation' && currentEvent && (
          <div className="animate-fadeIn">
            <div className="bg-gradient-to-r from-emerald-900/30 to-slate-800 rounded-2xl p-5 border border-emerald-700/50 mb-4">
              <div className="text-sm text-emerald-400 font-medium mb-2">📢 {currentEvent.minute}' минута</div>
              <p className="text-white text-lg leading-relaxed">{currentEvent.situation.text}</p>
            </div>
            <div className="space-y-3">
              {currentEvent.situation.choices.map((choice, i) => (
                <button
                  key={i}
                  onClick={() => onChoose(i)}
                  className="w-full p-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-emerald-500 rounded-xl text-left transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{statEmoji[choice.stat]}</span>
                    <div className="flex-1">
                      <div className="text-white font-medium group-hover:text-emerald-400 transition-colors">{choice.label}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {statNames[choice.stat]} ({player.stats[choice.stat]}) • Сложность: {'⭐'.repeat(choice.difficulty)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Result Phase */}
        {match.phase === 'result' && currentEvent && currentEvent.resultText && (
          <div className="animate-fadeIn">
            <div className={`rounded-2xl p-6 border mb-4 ${
              currentEvent.goal
                ? 'bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border-yellow-600/50'
                : currentEvent.success
                ? 'bg-gradient-to-r from-emerald-900/30 to-green-900/30 border-emerald-600/50'
                : 'bg-gradient-to-r from-red-900/30 to-rose-900/30 border-red-600/50'
            }`}>
              <div className="text-center">
                {currentEvent.goal && <div className="text-6xl mb-3 animate-bounce">⚽</div>}
                {currentEvent.assist && <div className="text-5xl mb-3">🅰️</div>}
                {!currentEvent.goal && !currentEvent.assist && currentEvent.success && <div className="text-5xl mb-3">✅</div>}
                {!currentEvent.success && <div className="text-5xl mb-3">❌</div>}
                <p className={`text-lg font-medium ${
                  currentEvent.goal ? 'text-yellow-300' : currentEvent.success ? 'text-emerald-300' : 'text-red-300'
                }`}>
                  {currentEvent.resultText}
                </p>
                {currentEvent.goal && <p className="text-2xl font-black text-yellow-400 mt-2">ГООООЛ! 🔥</p>}
                {currentEvent.assist && <p className="text-xl font-bold text-emerald-400 mt-2">Голевой пас!</p>}
              </div>
            </div>
            <button
              onClick={onAdvance}
              className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
            >
              {match.currentIndex + 1 < match.events.length ? '▶️ Далее' : '🏁 Финальный свисток'}
            </button>
          </div>
        )}

        {/* Fulltime Phase */}
        {match.phase === 'fulltime' && (
          <div className="animate-fadeIn text-center">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 mb-6">
              <div className="text-4xl mb-4">🏁</div>
              <h2 className="text-3xl font-black text-white mb-6">Матч окончен!</h2>
              <div className="flex items-center justify-center gap-8 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-black text-white">{match.teamScore}</div>
                  <div className="text-sm text-gray-400">{club.name}</div>
                </div>
                <div className="text-gray-600 text-xl">—</div>
                <div className="text-center">
                  <div className="text-4xl font-black text-white">{match.opponentScore}</div>
                  <div className="text-sm text-gray-400">{match.opponent.name}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center mb-6">
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{match.playerGoals}</div>
                  <div className="text-xs text-gray-500">Ваши голы</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400">{match.playerAssists}</div>
                  <div className="text-xs text-gray-500">Передачи</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{calculateMatchRating(match).toFixed(1)}</div>
                  <div className="text-xs text-gray-500">Оценка</div>
                </div>
              </div>
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                match.teamScore > match.opponentScore ? 'bg-emerald-900/50 text-emerald-400' :
                match.teamScore < match.opponentScore ? 'bg-red-900/50 text-red-400' :
                'bg-gray-700 text-gray-300'
              }`}>
                {match.teamScore > match.opponentScore ? '🎉 ПОБЕДА!' : match.teamScore < match.opponentScore ? '😔 ПОРАЖЕНИЕ' : '🤝 НИЧЬЯ'}
              </div>
            </div>
            <button
              onClick={onFinish}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-bold rounded-2xl transition-all"
            >
              ✅ Продолжить
            </button>
          </div>
        )}

        {/* Back button */}
        <div className="mt-4 text-center">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-400 text-sm transition-colors">
            ← Назад
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Training Screen ─── */
function TrainingScreen({
  player, onTrain, onBack,
}: {
  player: Player;
  onTrain: (stat: keyof PlayerStats) => void;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-slate-900 to-gray-950 p-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-white text-center mb-2">💪 Тренировка</h1>
        <p className="text-gray-400 text-center mb-6">Энергия: <span className="text-emerald-400 font-bold">{player.energy}/{player.maxEnergy}</span></p>

        <div className="space-y-3">
          {(Object.keys(player.stats) as (keyof PlayerStats)[]).map(stat => (
            <button
              key={stat}
              onClick={() => player.energy > 0 && onTrain(stat)}
              disabled={player.energy <= 0}
              className="w-full p-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-600 hover:border-blue-500 rounded-xl text-left transition-all group disabled:hover:border-slate-600"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">{statEmoji[stat]}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium group-hover:text-blue-400 transition-colors">{statNames[stat]}</span>
                    <span className="text-white font-bold">{player.stats[stat]}</span>
                  </div>
                  <StatBar value={player.stats[stat]} color="#3b82f6" />
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onBack}
          className="w-full mt-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl transition-all"
        >
          ← Назад
        </button>
      </div>
    </div>
  );
}

/* ─── Transfers Screen ─── */
function TransfersScreen({
  player, offers, onAccept, onSkip,
}: {
  player: Player;
  offers: TransferOffer[];
  onAccept: (clubId: string) => void;
  onSkip: () => void;
}) {
  const currentClub = getClubById(player.clubId);
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-slate-900 to-gray-950 p-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">📋</div>
          <h1 className="text-3xl font-bold text-white mb-2">Трансферное окно</h1>
          <p className="text-gray-400">Сезон {player.season} завершён! Выберите предложение</p>
        </div>

        {/* Current Club */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Текущий клуб</div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentClub.emoji}</span>
            <span className="text-white font-medium">{currentClub.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ backgroundColor: tierColors[currentClub.tier] + '33', color: tierColors[currentClub.tier] }}>
              {leagueNames[currentClub.tier]}
            </span>
          </div>
        </div>

        {/* Offers */}
        <div className="space-y-3 mb-6">
          {offers.map((offer, i) => (
            <div
              key={i}
              className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 hover:border-emerald-700/50 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{offer.club.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-bold text-lg">{offer.club.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: tierColors[offer.club.tier] + '33', color: tierColors[offer.club.tier] }}>
                      {leagueNames[offer.club.tier]}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-1">
                    <span>💰 {offer.salary}</span>
                  </div>
                  <div className="text-sm text-gray-500 italic">{offer.reputation}</div>
                </div>
                {offer.club.id !== player.clubId && (
                  <button
                    onClick={() => onAccept(offer.club.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-lg transition-all whitespace-nowrap"
                  >
                    Принять
                  </button>
                )}
                {offer.club.id === player.clubId && (
                  <span className="px-3 py-1 bg-slate-700 text-gray-400 text-xs rounded-lg">Текущий</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onSkip}
          className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-gray-300 font-bold rounded-2xl transition-all"
        >
          Остаться в текущем клубе
        </button>
      </div>
    </div>
  );
}

/* ─── Season End Screen ─── */
function SeasonEndScreen({
  player, trophies, onContinue, onTransfers,
}: {
  player: Player;
  trophies: Trophy[];
  onContinue: () => void;
  onTransfers: () => void;
}) {
  const lastSeason = player.history[player.history.length - 1];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-slate-900 to-gray-950 p-4 flex items-center justify-center">
      <div className="max-w-lg mx-auto w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📅</div>
          <h1 className="text-3xl font-bold text-white mb-2">Сезон {player.season - 1} завершён!</h1>
          <p className="text-gray-400">Вам {player.age} лет</p>
        </div>

        {lastSeason && (
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{lastSeason.clubEmoji}</span>
              <span className="text-white font-medium">{lastSeason.clubName}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-white">{lastSeason.goals}</div>
                <div className="text-xs text-gray-500">Голов</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">{lastSeason.assists}</div>
                <div className="text-xs text-gray-500">Передач</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">{lastSeason.matches}</div>
                <div className="text-xs text-gray-500">Матчей</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-400">{lastSeason.avgRating}</div>
                <div className="text-xs text-gray-500">Ср. оценка</div>
              </div>
            </div>
          </div>
        )}

        {trophies.length > 0 && (
          <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-2xl p-6 border border-amber-700/50 mb-6">
            <h3 className="text-xl font-bold text-amber-400 mb-4 text-center">🏆 Трофеи сезона!</h3>
            <div className="space-y-2">
              {trophies.map((t, i) => (
                <div key={i} className="flex items-center gap-3 bg-amber-900/30 rounded-xl p-3">
                  <span className="text-2xl">{t.emoji}</span>
                  <span className="text-amber-300 font-medium">{t.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={onTransfers}
            className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white text-lg font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            📋 Открыть трансферное окно
          </button>
          <button
            onClick={onContinue}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-gray-300 font-bold rounded-2xl transition-all"
          >
            Продолжить без перехода
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Retirement Screen ─── */
function RetirementScreen({ player, onRestart }: { player: Player; onRestart: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-slate-900 to-gray-950 p-4 flex items-center justify-center">
      <div className="max-w-lg mx-auto w-full text-center">
        <div className="text-8xl mb-6">🏆</div>
        <h1 className="text-4xl font-black text-white mb-3">Конец карьеры</h1>
        <p className="text-xl text-gray-400 mb-8">{player.name} завершает карьеру в возрасте {player.age} лет</p>

        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-4xl font-black text-white">{player.careerGoals}</div>
              <div className="text-sm text-gray-500">Голов за карьеру</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white">{player.careerAssists}</div>
              <div className="text-sm text-gray-500">Передач за карьеру</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white">{player.careerMatches}</div>
              <div className="text-sm text-gray-500">Матчей</div>
            </div>
            <div>
              <div className="text-4xl font-black text-emerald-400">{calculateOverall(player.stats, player.position)}</div>
              <div className="text-sm text-gray-500">Макс. OVR</div>
            </div>
          </div>
        </div>

        {player.trophies.length > 0 && (
          <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-2xl p-6 border border-amber-700/50 mb-6">
            <h3 className="text-xl font-bold text-amber-400 mb-3">🏆 Все трофеи</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {player.trophies.map((t, i) => (
                <span key={i} className="px-3 py-1.5 bg-amber-900/50 rounded-full text-amber-300 text-sm">
                  {t.emoji} {t.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Career History */}
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 mb-6 text-left">
          <h3 className="text-lg font-bold text-white mb-3">📋 История карьеры</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {player.history.map((entry, i) => (
              <div key={i} className="flex items-center gap-3 text-sm bg-slate-700/50 rounded-lg p-2">
                <span className="text-lg">{entry.clubEmoji}</span>
                <span className="text-gray-300 flex-1">{entry.clubName}</span>
                <span className="text-gray-500">{entry.goals}⚽ {entry.assists}🅰️</span>
                <span className="text-emerald-400 font-medium">{entry.avgRating}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onRestart}
          className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-bold rounded-2xl transition-all"
        >
          🔄 Начать заново
        </button>
      </div>
    </div>
  );
}

/* ─── Main App ─── */
export default function App() {
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [player, setPlayer] = useState<Player | null>(null);
  const [match, setMatch] = useState<MatchState | null>(null);
  const [transferOffers, setTransferOffers] = useState<TransferOffer[]>([]);
  const [seasonTrophies, setSeasonTrophies] = useState<Trophy[]>([]);
  const [trainingResult, setTrainingResult] = useState<{ stat: string; gain: number } | null>(null);

  /* ── Create Player ── */
  const handleCreatePlayer = useCallback((name: string, position: Position, bonusStats: PlayerStats) => {
    const p = createPlayer(name, position);
    const stats: PlayerStats = {
      speed: 35 + bonusStats.speed,
      shooting: 35 + bonusStats.shooting,
      passing: 35 + bonusStats.passing,
      dribbling: 35 + bonusStats.dribbling,
      defense: 35 + bonusStats.defense,
      physical: 35 + bonusStats.physical,
    };
    p.stats = stats;
    setPlayer(p);
    setScreen('dashboard');
  }, []);

  /* ── Start Match ── */
  const handleStartMatch = useCallback(() => {
    if (!player) return;
    const m = startMatch(player);
    setMatch(m);
    setScreen('match');
  }, [player]);

  /* ── Match Choice ── */
  const handleChoice = useCallback((index: number) => {
    if (!player || !match) return;
    const updated = processChoice(match, player, index);
    setMatch(updated);
  }, [player, match]);

  /* ── Match Advance ── */
  const handleAdvance = useCallback(() => {
    if (!match) return;
    if (match.phase === 'intro') {
      setMatch({ ...match, phase: 'situation' });
    } else if (match.phase === 'result') {
      const nextIndex = match.currentIndex + 1;
      if (nextIndex < match.events.length) {
        setMatch({ ...match, currentIndex: nextIndex, phase: 'situation' });
      } else {
        // All events done, calculate final score
        if (player) {
          const final = finishMatch(match, player);
          setMatch(final);
        }
      }
    }
  }, [match, player]);

  /* ── Finish Match ── */
  const handleFinishMatch = useCallback(() => {
    if (!player || !match) return;
    const updated = applyMatchResult(player, match);
    setPlayer(updated);
    setScreen('matchResult');
    // Short delay then go to dashboard
    setTimeout(() => {
      setScreen('dashboard');
    }, 100);
  }, [player, match]);

  /* ── Training ── */
  const handleTrain = useCallback((stat: keyof PlayerStats) => {
    if (!player || player.energy <= 0) return;
    const oldValue = player.stats[stat];
    const updated = trainStat(player, stat);
    const gain = updated.stats[stat] - oldValue;
    setPlayer(updated);
    setTrainingResult({ stat: statNames[stat], gain });
  }, [player]);

  /* ── End Season ── */
  const handleEndSeason = useCallback(() => {
    if (!player) return;
    const { player: updatedPlayer, trophies } = endSeason(player);

    if (updatedPlayer.retired) {
      setPlayer(updatedPlayer);
      setScreen('retirement');
      return;
    }

    setPlayer(updatedPlayer);
    setSeasonTrophies(trophies);
    setScreen('seasonEnd');
  }, [player]);

  /* ── Transfers ── */
  const handleOpenTransfers = useCallback(() => {
    if (!player) return;
    const offers = generateTransferOffers(player);
    setTransferOffers(offers);
    setScreen('transfers');
  }, [player]);

  const handleAcceptTransfer = useCallback((clubId: string) => {
    if (!player) return;
    const updated = acceptTransfer(player, clubId);
    setPlayer(updated);
    setScreen('dashboard');
  }, [player]);

  /* ── Navigation ── */
  const handleBackToDashboard = useCallback(() => {
    setTrainingResult(null);
    setScreen('dashboard');
  }, []);

  const handleRestart = useCallback(() => {
    setPlayer(null);
    setMatch(null);
    setTransferOffers([]);
    setSeasonTrophies([]);
    setTrainingResult(null);
    setScreen('menu');
  }, []);

  /* ── Render ── */
  if (screen === 'menu' || !player) {
    return screen === 'menu'
      ? <MenuScreen onStart={() => setScreen('create')} />
      : <CreateScreen onCreate={handleCreatePlayer} />;
  }

  if (player.retired) {
    return <RetirementScreen player={player} onRestart={handleRestart} />;
  }

  switch (screen) {
    case 'create':
      return <CreateScreen onCreate={handleCreatePlayer} />;
    case 'match':
      return match ? (
        <MatchScreen
          player={player}
          match={match}
          onChoose={handleChoice}
          onAdvance={handleAdvance}
          onFinish={handleFinishMatch}
          onBack={handleBackToDashboard}
        />
      ) : (
        <DashboardScreen
          player={player}
          onPlayMatch={handleStartMatch}
          onTrain={() => { setTrainingResult(null); setScreen('training'); }}
          onEndSeason={handleEndSeason}
        />
      );
    case 'training':
      return (
        <div>
          <TrainingScreen player={player} onTrain={handleTrain} onBack={handleBackToDashboard} />
          {trainingResult && (
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg animate-fadeIn z-50">
              {statEmoji[Object.keys(statNames).find(k => statNames[k as keyof PlayerStats] === trainingResult.stat) as keyof PlayerStats || 'speed']} {trainingResult.stat} +{trainingResult.gain}!
            </div>
          )}
        </div>
      );
    case 'transfers':
      return (
        <TransfersScreen
          player={player}
          offers={transferOffers}
          onAccept={handleAcceptTransfer}
          onSkip={handleBackToDashboard}
        />
      );
    case 'seasonEnd':
      return (
        <SeasonEndScreen
          player={player}
          trophies={seasonTrophies}
          onContinue={handleBackToDashboard}
          onTransfers={handleOpenTransfers}
        />
      );
    default:
      return (
        <DashboardScreen
          player={player}
          onPlayMatch={handleStartMatch}
          onTrain={() => { setTrainingResult(null); setScreen('training'); }}
          onEndSeason={handleEndSeason}
        />
      );
  }
}
