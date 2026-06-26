import { toPng } from 'html-to-image';

function safeProjectName(value: string): string {
  const normalized = value.trim().replace(/\s+/g, '-');
  const withoutControlCharacters = Array.from(normalized)
    .filter((character) => (character.codePointAt(0) ?? 0) >= 32)
    .join('');
  const withoutReservedCharacters = withoutControlCharacters.replace(/[\\/:*?"<>|]/g, '').replace(/[. ]+$/, '');
  return (withoutReservedCharacters || 'project').slice(0, 80);
}

function exportFileName(projectName: string): string {
  const now = new Date();
  const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  return `mockfolio-${safeProjectName(projectName)}-${date}.png`;
}

export async function exportPng(node: HTMLElement, projectName: string, scale: number): Promise<string> {
  const dataUrl = await toPng(node, {
    pixelRatio: scale,
    cacheBust: true,
  });
  const fileName = exportFileName(projectName);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  link.click();
  return fileName;
}
