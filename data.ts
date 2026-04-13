import { Club, MatchSituation } from './types';

export const clubs: Club[] = [
  // Tier 5 - Amateur
  { id: 'trava', name: 'ФК "Трава"', tier: 5, emoji: '⚽', league: 'Любительская лига', color: '#22c55e' },
  { id: 'dush', name: 'ДЮСШ №5', tier: 5, emoji: '🌱', league: 'Любительская лига', color: '#16a34a' },
  { id: 'rassvet', name: '"Рассвет"', tier: 5, emoji: '☀️', league: 'Любительская лига', color: '#eab308' },
  { id: 'sputnik', name: '"Спутник"', tier: 5, emoji: '🛰️', league: 'Любительская лига', color: '#64748b' },

  // Tier 4 - Third Division
  { id: 'torpedo', name: '"Торпедо"', tier: 4, emoji: '🔧', league: 'Вторая лига', color: '#1e40af' },
  { id: 'metallurg', name: '"Металлург"', tier: 4, emoji: '🔨', league: 'Вторая лига', color: '#b91c1c' },
  { id: 'start', name: '"Старт"', tier: 4, emoji: '⭐', league: 'Вторая лига', color: '#7c3aed' },
  { id: 'zenitm', name: '"Зенит-М"', tier: 4, emoji: '🚀', league: 'Вторая лига', color: '#0ea5e9' },

  // Tier 3 - Second Division
  { id: 'rostov', name: '"Ростов"', tier: 3, emoji: '🦁', league: 'Первая лига', color: '#f97316' },
  { id: 'fakel', name: '"Факел"', tier: 3, emoji: '🔥', league: 'Первая лига', color: '#dc2626' },
  { id: 'tom', name: '"Томь"', tier: 3, emoji: '🐻', league: 'Первая лига', color: '#7c2d12' },
  { id: 'baltika', name: '"Балтика"', tier: 3, emoji: '🌊', league: 'Первая лига', color: '#0369a1' },

  // Tier 2 - Top Division
  { id: 'rubin', name: '"Рубин"', tier: 2, emoji: '💎', league: 'Премьер-лига', color: '#dc2626' },
  { id: 'spartak', name: '"Спартак"', tier: 2, emoji: '🔴', league: 'Премьер-лига', color: '#b91c1c' },
  { id: 'cska', name: '"ЦСКА"', tier: 2, emoji: '🔵', league: 'Премьер-лига', color: '#1d4ed8' },
  { id: 'loko', name: '"Локомотив"', tier: 2, emoji: '🚂', league: 'Премьер-лига', color: '#15803d' },

  // Tier 1 - Champions League
  { id: 'real', name: 'Реал Мадрид', tier: 1, emoji: '👑', league: 'Лига Чемпионов', color: '#fbbf24' },
  { id: 'barca', name: 'Барселона', tier: 1, emoji: '🏆', league: 'Лига Чемпионов', color: '#a21caf' },
  { id: 'mancity', name: 'Манчестер Сити', tier: 1, emoji: '🟢', league: 'Лига Чемпионов', color: '#06b6d4' },
  { id: 'bayern', name: 'Бавария', tier: 1, emoji: '🔴', league: 'Лига Чемпионов', color: '#dc2626' },
];

export const positionNames: Record<string, string> = {
  forward: 'Нападающий',
  midfielder: 'Полузащитник',
  defender: 'Защитник',
};

export const positionEmoji: Record<string, string> = {
  forward: '⚡',
  midfielder: '🎯',
  defender: '🛡️',
};

export const statNames: Record<string, string> = {
  speed: 'Скорость',
  shooting: 'Удар',
  passing: 'Пас',
  dribbling: 'Дриблинг',
  defense: 'Защита',
  physical: 'Физика',
};

export const statEmoji: Record<string, string> = {
  speed: '💨',
  shooting: '🎯',
  passing: '📋',
  dribbling: '🔄',
  defense: '🛡️',
  physical: '💪',
};

export const matchSituations: MatchSituation[] = [
  {
    text: 'Вы получили мяч в центре поля. Впереди пространство для атаки!',
    choices: [
      { label: '📋 Точный пас вперёд', stat: 'passing', difficulty: 2, successText: 'Отличный пас на ход партнёру! Зрители аплодируют.', failText: 'Пас перехвачен соперником. Атака сорвана.', canGoal: false, canAssist: true },
      { label: '🔄 Обводка', stat: 'dribbling', difficulty: 2, successText: 'Вы красиво обыграли оппонента и продвинулись вперёд!', failText: 'Вы потеряли мяч при попытке обводки.', canGoal: false, canAssist: false },
      { label: '💨 Рывок вперёд', stat: 'speed', difficulty: 2, successText: 'Мощный рывок! Вы оставили соперника позади!', failText: 'Соперник успел перекрыть вам путь.', canGoal: false, canAssist: false },
    ],
  },
  {
    text: 'Вы вблизи штрафной площади. Мяч у вас, защитник рядом!',
    choices: [
      { label: '🎯 Удар по воротам!', stat: 'shooting', difficulty: 3, successText: 'УДАР! Мяч летит точно в цель! Вратарь не успел!', failText: 'Удар заблокирован защитником. Опасный момент упущен.', canGoal: true, canAssist: false },
      { label: '📋 Пас в штрафную', stat: 'passing', difficulty: 2, successText: 'Идеальный пас на партнёра в штрафную! Момент!', failText: 'Пас перехвачен. Защита сыграла надежно.', canGoal: false, canAssist: true },
      { label: '🔄 Обойти защитника', stat: 'dribbling', difficulty: 3, successText: 'Финт! Вы прошли защитника и выходите на ворота!', failText: 'Защитник уверенно забрал мяч.', canGoal: true, canAssist: false },
    ],
  },
  {
    text: 'Один на один с защитником! Трибуны замерли в ожидании...',
    choices: [
      { label: '🎯 Удар с ходу!', stat: 'shooting', difficulty: 3, successText: 'Мощный удар! Мяч в сетке! ГОООЛ!', failText: 'Удар прошёл рядом со штангой. Близко!', canGoal: true, canAssist: false },
      { label: '🔄 Финт и проход', stat: 'dribbling', difficulty: 3, successText: 'Обводка! Вы прошли защитника как стоячего!', failText: 'Защитник прочитал ваш ход и выбил мяч.', canGoal: false, canAssist: false },
      { label: '📋 Скинуть партнёру', stat: 'passing', difficulty: 2, successText: 'Гениальный пас! Партнёр выходит на ворота!', failText: 'Пас оказался неточным. Момент потерян.', canGoal: false, canAssist: true },
    ],
  },
  {
    text: 'Штрафной удар с 25 метров. Вы у мяча...',
    choices: [
      { label: '🎯 Обвести стенку!', stat: 'shooting', difficulty: 4, successText: 'Великолепный удар! Мяч обвёл стенку и влетел в девятку! ГОООЛ!', failText: 'Мяч ударился в стенку. Рикошет.', canGoal: true, canAssist: false },
      { label: '📋 Подача в штрафную', stat: 'passing', difficulty: 2, successText: 'Отличная подача! Партнёр бьёт головой!', failText: 'Подача перехвачена вратарём.', canGoal: false, canAssist: true },
      { label: '💨 Быстрый штрафной', stat: 'speed', difficulty: 2, successText: 'Хитро! Вы быстро разыграли штрафной и убежали!', failText: 'Судья остановил игру. Не по правилам.', canGoal: false, canAssist: false },
    ],
  },
  {
    text: 'Угловой удар. Вы в штрафной площади, ждёте подачу...',
    choices: [
      { label: '💪 Удар головой!', stat: 'physical', difficulty: 3, successText: 'Сильный удар головой! Мяч в воротах! ГОООЛ!', failText: 'Не удалось выиграть воздух. Защитник сыграл выше.', canGoal: true, canAssist: false },
      { label: '🎯 Удар с разворота', stat: 'shooting', difficulty: 4, successText: 'Бicycle kick!! Невероятно! ГОООЛ!', failText: 'Не удалось пробить. Мяч отскочил к защитнику.', canGoal: true, canAssist: false },
      { label: '📋 Откат партнёру', stat: 'passing', difficulty: 1, successText: 'Вы грамотно скинули мяч партнёру на удар!', failText: 'Передача оказалась слишком сильной.', canGoal: false, canAssist: true },
    ],
  },
  {
    text: 'Контратака! Вы бежите вперёд, партнёр рядом...',
    choices: [
      { label: '📋 Пас на ход партнёру', stat: 'passing', difficulty: 2, successText: 'Идеальный пас! Партнёр выходит один на один!', failText: 'Пас перехвачен. Контратака сорвана.', canGoal: false, canAssist: true },
      { label: '💨 Ускорение', stat: 'speed', difficulty: 3, successText: 'Невероятная скорость! Вы оторвались от всех!', failText: 'Соперник догнал вас. Нехватка скорости.', canGoal: false, canAssist: false },
      { label: '🎯 Сам бью!', stat: 'shooting', difficulty: 4, successText: 'Дальний удар! Вратарь не достал! ГОООЛ!', failText: 'Удар неточный. Мяч улетел за ворота.', canGoal: true, canAssist: false },
    ],
  },
  {
    text: 'Соперник атакует! Нужно помочь команде в обороне...',
    choices: [
      { label: '🛡️ Отбор мяча', stat: 'defense', difficulty: 3, successText: 'Чистый отбор! Вы забрали мяч и начали атаку!', failText: 'Соперник обыграл вас. Опасно!', canGoal: false, canAssist: false },
      { label: '💪 Позиционная борьба', stat: 'physical', difficulty: 2, successText: 'Вы выдержали контакт и забрали мяч!', failText: 'Соперник оказался сильнее. Фол.', canGoal: false, canAssist: false },
      { label: '💨 Прессинг', stat: 'speed', difficulty: 2, successText: 'Скоростной прессинг! Вы заставили соперника ошибиться!', failText: 'Не успели накрыть. Соперник ушёл от вас.', canGoal: false, canAssist: false },
    ],
  },
  {
    text: 'Пенальти! Судья указывает на точку. Вы берёте мяч...',
    choices: [
      { label: '🎯 Удар в угол!', stat: 'shooting', difficulty: 2, successText: 'Хладнокровный удар! Вратарь прыгнул не туда! ГОООЛ!', failText: 'Вратарь угадал направление и парировал!', canGoal: true, canAssist: false },
      { label: '🎯 Паненка!', stat: 'shooting', difficulty: 4, successText: 'ПАНЕНКА!! Невероятная наглость! ГОООЛ! Трибуны в восторге!', failText: 'Вратарь не повёлся и легко забрал мяч. Позор!', canGoal: true, canAssist: false },
    ],
  },
  {
    text: 'Навес в штрафную. Мяч летит к вам...',
    choices: [
      { label: '💪 Выиграть воздух', stat: 'physical', difficulty: 3, successText: 'Вы выпрыгнули выше всех и пробили головой!', failText: 'Защитник оказался проворнее.', canGoal: true, canAssist: false },
      { label: '📋 Сбросить партнёру', stat: 'passing', difficulty: 2, successText: 'Грамотный скидка головой на партнёра!', failText: 'Не удалось точно скинуть мяч.', canGoal: false, canAssist: true },
      { label: '🔄 Приём и разворот', stat: 'dribbling', difficulty: 3, successText: 'Вы приняли мяч грудью и развернулись! Красота!', failText: 'Тяжёлый мяч, не удалось обработать.', canGoal: false, canAssist: false },
    ],
  },
  {
    text: 'Вы с мячом на фланге. Что предпримете?',
    choices: [
      { label: '📋 Прострел в штрафную', stat: 'passing', difficulty: 2, successText: 'Отличный прострел! Партнёр замыкает! ГОООЛ!', failText: 'Прострел заблокирован. Угловой.', canGoal: false, canAssist: true },
      { label: '🔄 Срезать внутрь', stat: 'dribbling', difficulty: 3, successText: 'Вы срезали внутрь и открыли момент для удара!', failText: 'Защитник вытеснил вас за пределы поля.', canGoal: false, canAssist: false },
      { label: '🎯 Удар со острого угла', stat: 'shooting', difficulty: 4, successText: 'Дерзкий удар! Вратарь не ждал! ГОООЛ!', failText: 'Мяч прошёл над перекладиной. Риск не оправдался.', canGoal: true, canAssist: false },
    ],
  },
  {
    text: 'Длинная передача на вас. Мяч летит высоко...',
    choices: [
      { label: '💨 Рвануть за мячом', stat: 'speed', difficulty: 2, successText: 'Вы первые на мяче! Скорость решила всё!', failText: 'Соперник оказался быстрее.', canGoal: false, canAssist: false },
      { label: '💪 Принять на грудь', stat: 'physical', difficulty: 2, successText: 'Отличный приём! Вы зафиксировали мяч!', failText: 'Мяч отскочил неудачно. Потеря.', canGoal: false, canAssist: false },
      { label: '📋 Скинуть головой', stat: 'passing', difficulty: 3, successText: 'Точный скидка головой на партнёра!', failText: 'Скидка неточная. Мяч перешёл к сопернику.', canGoal: false, canAssist: true },
    ],
  },
  {
    text: 'Последние минуты матча. Команда проигрывает. Нужен гол!',
    choices: [
      { label: '🎯 Удар из-за пределов', stat: 'shooting', difficulty: 4, successText: 'Дальний удар!! ГОООЛ!! Невероятная развязка!', failText: 'Удар заблокирован. Время уходит...', canGoal: true, canAssist: false },
      { label: '🔄 Прорыв через центр', stat: 'dribbling', difficulty: 4, successText: 'Вы прошли троих! Трибуны стоят!', failText: 'Фол на вас! Но судья играет Advantage...', canGoal: false, canAssist: false },
      { label: '📋 Заброс в штрафную', stat: 'passing', difficulty: 3, successText: 'Блестящий заброс! Партнёр бьёт! ГОООЛ!!', failText: 'Слишком сильно. Вратарь на выходе.', canGoal: false, canAssist: true },
    ],
  },
  {
    text: 'Перехват мяча! Вы можете начать быструю атаку!',
    choices: [
      { label: '💨 Голо на гонку!', stat: 'speed', difficulty: 3, successText: 'Вы рванули вперёд! Никто не может догнать!', failText: 'Соперник быстро перестроился и отрезал вас.', canGoal: false, canAssist: false },
      { label: '📋 Длинная передача', stat: 'passing', difficulty: 3, successText: 'Разящий пас на 40 метров! Партнёр выходит один!', failText: 'Передача неточная. Возможность упущена.', canGoal: false, canAssist: true },
      { label: '🔄 Повести мяч', stat: 'dribbling', difficulty: 2, successText: 'Вы уверенно повели мяч вперёд, разыгрывая атаку.', failText: 'Вас настигли и отобрали мяч.', canGoal: false, canAssist: false },
    ],
  },
];

export const leagueNames: Record<number, string> = {
  5: 'Любительская лига',
  4: 'Вторая лига',
  3: 'Первая лига',
  2: 'Премьер-лига',
  1: 'Лига Чемпионов',
};

export const tierColors: Record<number, string> = {
  5: '#6b7280',
  4: '#a16207',
  3: '#b45309',
  2: '#dc2626',
  1: '#fbbf24',
};

export function getClubById(id: string): Club {
  return clubs.find(c => c.id === id) || clubs[0];
}

export function getClubsByTier(tier: number): Club[] {
  return clubs.filter(c => c.tier === tier);
}
