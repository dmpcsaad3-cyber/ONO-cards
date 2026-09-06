import { Card, CardColor, CardValue, Player } from '../types';

export const COLORS: CardColor[] = ['red', 'blue', 'green', 'yellow'];

export function createStandardDeck(): Card[] {
  const deck: Card[] = [];
  let idCounter = 1;

  // 1. Color Cards
  for (const color of COLORS) {
    // Single 0 card
    deck.push({
      id: `card-${idCounter++}`,
      color,
      value: '0',
      scoreValue: 0,
    });

    // Two of each 1-9
    for (let num = 1; num <= 9; num++) {
      const val = num.toString() as CardValue;
      for (let i = 0; i < 2; i++) {
        deck.push({
          id: `card-${idCounter++}`,
          color,
          value: val,
          scoreValue: num,
        });
      }
    }

    // Action cards: 2 of each per color
    const actions: CardValue[] = ['skip', 'reverse', 'draw2'];
    for (const action of actions) {
      for (let i = 0; i < 2; i++) {
        deck.push({
          id: `card-${idCounter++}`,
          color,
          value: action,
          scoreValue: 20,
        });
      }
    }
  }

  // 2. Wild Cards: 4 regular Wild, 4 Wild Draw 4
  for (let i = 0; i < 4; i++) {
    deck.push({
      id: `card-${idCounter++}`,
      color: 'wild',
      value: 'wild',
      scoreValue: 50,
    });
    deck.push({
      id: `card-${idCounter++}`,
      color: 'wild',
      value: 'wild_draw4',
      scoreValue: 50,
    });
  }

  return deck;
}

// Fisher-Yates shuffle
export function shuffleDeck(deck: Card[]): Card[] {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Can a card be played legally?
export function isCardPlayable(
  card: Card,
  topCard: Card | null,
  activeColor: CardColor,
  pendingDrawCount: number = 0,
  enableStacking: boolean = false
): boolean {
  if (!topCard) return true;

  // If stacking is active and there's a pending draw penalty
  if (pendingDrawCount > 0 && enableStacking) {
    if (topCard.value === 'draw2' && card.value === 'draw2') return true;
    if (topCard.value === 'wild_draw4' && (card.value === 'wild_draw4' || card.value === 'draw2')) return true;
    return false;
  }

  // Wild cards can always be played
  if (card.color === 'wild' || card.value === 'wild' || card.value === 'wild_draw4') {
    return true;
  }

  // Color match
  if (card.color === activeColor) {
    return true;
  }

  // Value / action match (even if color is different)
  if (card.value === topCard.value) {
    return true;
  }

  return false;
}

// Calculate score of cards remaining in losers' hands to award to the winner
export function calculateRoundScore(players: Player[], winnerId: string): number {
  let totalScore = 0;
  for (const p of players) {
    if (p.id !== winnerId) {
      for (const card of p.hand) {
        totalScore += card.scoreValue;
      }
    }
  }
  return totalScore;
}

// AI Bot Decision Strategy
export interface AIBotMove {
  action: 'play' | 'draw';
  card?: Card;
  chosenColor?: CardColor;
  shoutOno?: boolean;
}

export function chooseAIBotMove(
  bot: Player,
  topCard: Card,
  activeColor: CardColor,
  pendingDrawCount: number = 0,
  enableStacking: boolean = false
): AIBotMove {
  const playableCards = bot.hand.filter((c) =>
    isCardPlayable(c, topCard, activeColor, pendingDrawCount, enableStacking)
  );

  if (playableCards.length === 0) {
    return { action: 'draw' };
  }

  // Priority scoring:
  // 1. If we can stack a pending draw, play the draw card immediately
  // 2. Play special cards (draw2, skip, reverse) to disrupt opponents
  // 3. Play number cards matching active color or value
  // 4. Save Wild / Wild Draw 4 as last resort unless it's the only option or winning move
  playableCards.sort((a, b) => {
    // If bot has 2 cards, playing wild might guarantee victory
    if (bot.hand.length === 2 && a.color === 'wild') return -1;
    // Prefer non-wild first to conserve wilds
    if (a.color !== 'wild' && b.color === 'wild') return -1;
    if (a.color === 'wild' && b.color !== 'wild') return 1;

    // Prefer action cards over regular numbers
    const isActionA = a.value === 'draw2' || a.value === 'skip' || a.value === 'reverse';
    const isActionB = b.value === 'draw2' || b.value === 'skip' || b.value === 'reverse';
    if (isActionA && !isActionB) return -1;
    if (!isActionA && isActionB) return 1;

    // Highest points first to unload from hand
    return b.scoreValue - a.scoreValue;
  });

  const cardToPlay = playableCards[0];

  // If playing wild, choose the color bot has the most of
  let chosenColor: CardColor = 'red';
  if (cardToPlay.color === 'wild') {
    const colorCounts: Record<CardColor, number> = {
      red: 0,
      blue: 0,
      green: 0,
      yellow: 0,
      wild: 0,
    };
    for (const c of bot.hand) {
      if (c.id !== cardToPlay.id && c.color !== 'wild') {
        colorCounts[c.color]++;
      }
    }
    const sortedColors = (['red', 'blue', 'green', 'yellow'] as CardColor[]).sort(
      (a, b) => colorCounts[b] - colorCounts[a]
    );
    chosenColor = sortedColors[0] || 'blue';
  }

  // Bot shout ONO if playing this leaves them with 1 card (90% reliability)
  const willHaveOneCardLeft = bot.hand.length === 2;
  const shoutOno = willHaveOneCardLeft ? Math.random() < 0.92 : false;

  return {
    action: 'play',
    card: cardToPlay,
    chosenColor,
    shoutOno,
  };
}
