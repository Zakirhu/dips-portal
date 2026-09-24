// Utility for managing persistent bookmarks and favorites per user
export function getBookmarkedResourceIds(userId: string): string[] {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(`dips_bookmarks_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleResourceBookmark(userId: string, resourceId: string): { isBookmarked: boolean; total: number } {
  if (!userId || !resourceId) return { isBookmarked: false, total: 0 };
  const current = getBookmarkedResourceIds(userId);
  const exists = current.includes(resourceId);
  let updated: string[];
  if (exists) {
    updated = current.filter((id) => id !== resourceId);
  } else {
    updated = [resourceId, ...current.filter((id) => id !== resourceId)];
  }
  
  try {
    localStorage.setItem(`dips_bookmarks_${userId}`, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to persist bookmark to localStorage:', err);
  }

  // Dispatch custom event to notify all components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dips_bookmarks_updated', { detail: { userId, updated } }));
  }

  return { isBookmarked: !exists, total: updated.length };
}

export function isResourceBookmarked(userId: string, resourceId: string): boolean {
  if (!userId || !resourceId) return false;
  return getBookmarkedResourceIds(userId).includes(resourceId);
}

export function clearAllUserBookmarks(userId: string): void {
  if (!userId) return;
  localStorage.removeItem(`dips_bookmarks_${userId}`);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dips_bookmarks_updated', { detail: { userId, updated: [] } }));
  }
}
