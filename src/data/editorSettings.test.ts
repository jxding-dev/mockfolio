import { describe, it, expect } from 'vitest';
import { normalizeEditorSettings, DEFAULT_EDITOR_SETTINGS } from './editorSettings';

describe('normalizeEditorSettings', () => {
  it('returns defaults for non-object input', () => {
    expect(normalizeEditorSettings(null)).toEqual(DEFAULT_EDITOR_SETTINGS);
    expect(normalizeEditorSettings('garbage')).toEqual(DEFAULT_EDITOR_SETTINGS);
    expect(normalizeEditorSettings(42)).toEqual(DEFAULT_EDITOR_SETTINGS);
  });

  it('clamps out-of-range numbers', () => {
    const s = normalizeEditorSettings({ shadowIntensity: 9999, frameCornerRadius: -50, compositeScale: 100 });
    expect(s.shadowIntensity).toBe(100);
    expect(s.frameCornerRadius).toBe(0);
    expect(s.compositeScale).toBe(3);
  });

  it('rejects invalid enum values and falls back', () => {
    const s = normalizeEditorSettings({ activeMode: 'hacker', frameId: 'evil', exportScale: 7 });
    expect(s.activeMode).toBe('inspect');
    expect(s.frameId).toBe(DEFAULT_EDITOR_SETTINGS.frameId);
    expect(s.exportScale).toBe(2);
  });

  it('only accepts a 6-digit hex text color', () => {
    expect(normalizeEditorSettings({ mockupTextColor: 'red' }).mockupTextColor).toBe(DEFAULT_EDITOR_SETTINGS.mockupTextColor);
    expect(normalizeEditorSettings({ mockupTextColor: '#ABCDEF' }).mockupTextColor).toBe('#ABCDEF');
    expect(normalizeEditorSettings({ mockupTextColor: 'javascript:1' }).mockupTextColor).toBe(DEFAULT_EDITOR_SETTINGS.mockupTextColor);
  });

  it('caps long strings and coerces non-strings', () => {
    const long = 'a'.repeat(500);
    const s = normalizeEditorSettings({ projectName: long, urlInput: 123 });
    expect(s.projectName.length).toBeLessThanOrEqual(80);
    expect(s.urlInput).toBe(DEFAULT_EDITOR_SETTINGS.urlInput);
  });
});
