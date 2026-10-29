export function formatDriveLink(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }
  return trimmed;
}
