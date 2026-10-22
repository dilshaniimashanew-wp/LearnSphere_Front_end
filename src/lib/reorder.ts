/** Returns a copy of `ids` with `id` removed and re-inserted before `beforeId` (or at the end). */
export function moved(ids: string[], id: string, beforeId?: string) {
  const rest = ids.filter((x) => x !== id);
  const at = beforeId ? rest.indexOf(beforeId) : -1;
  rest.splice(at === -1 ? rest.length : at, 0, id);
  return rest;
}
