/**
 * Room Hierarchy Configuration
 * Defines the official order of lottery rooms for consistent display
 */

export const ROOM_HIERARCHY = [
  "Digital Reveil 7h",
  "Digital Reveil 8h",
  "Digital 21h",
  "Digital 22h",
  "Digital 23h",
  "Reveil",
  "Etoile",
  "Akwaba",
  "Monday Special",
  "National",
  "Special Weekend 1h",
  "Awale",
  "Prestige",
] as const;

export type RoomName = (typeof ROOM_HIERARCHY)[number];

/**
 * Get the sort order for a room name
 * Returns the index in hierarchy, or 999 for unknown rooms
 */
export function getRoomOrder(roomName: string): number {
  const index = ROOM_HIERARCHY.indexOf(roomName as RoomName);
  return index === -1 ? 999 : index;
}

/**
 * Sort rooms by predefined hierarchy
 */
export function sortRoomsByHierarchy<T extends { room_name: string }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => {
    const orderA = getRoomOrder(a.room_name);
    const orderB = getRoomOrder(b.room_name);
    return orderA - orderB;
  });
}

/**
 * Group and sort draws by room hierarchy
 */
export function groupByRoomHierarchy<T extends { room_name: string }>(
  items: T[]
): Record<string, T[]> {
  const grouped: Record<string, T[]> = {};

  items.forEach((item) => {
    if (!grouped[item.room_name]) {
      grouped[item.room_name] = [];
    }
    grouped[item.room_name].push(item);
  });

  // Return sorted by hierarchy
  const sortedEntries = Object.entries(grouped).sort(([roomA], [roomB]) => {
    return getRoomOrder(roomA) - getRoomOrder(roomB);
  });

  return Object.fromEntries(sortedEntries);
}
