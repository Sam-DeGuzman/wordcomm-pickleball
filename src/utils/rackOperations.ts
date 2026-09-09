import { Player } from '../types';

/**
 * Move a player from one slot index to another in the queue.
 * Returns a new array with the player repositioned.
 * If either fromIndex or toIndex is out of bounds, returns the original array unchanged.
 */
export function movePlayerInRack(
  players: Player[],
  fromIndex: number,
  toIndex: number
): Player[] {
  if (fromIndex < 0 || fromIndex >= players.length) return players;
  if (toIndex < 0 || toIndex >= players.length) return players;
  const result = [...players];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

/**
 * Insert or promote a player to the Priority Deck (index 0 / slot 1).
 * Deduplicates if the player was already in the rack.
 */
export function insertPlayerAtPriorityDeck(
  players: Player[],
  player: Player
): Player[] {
  const filtered = players.filter((p) => p.id !== player.id);
  return [player, ...filtered];
}

/**
 * Remove a player from the queue by their player ID.
 */
export function removePlayerFromRack(
  players: Player[],
  playerId: string
): Player[] {
  return players.filter((p) => p.id !== playerId);
}
