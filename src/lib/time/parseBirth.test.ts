import { describe, expect, it } from 'vitest';
import {
  formatBirthDateTime,
  parseBirthDate,
  parseBirthTime,
  toUTC,
} from './parseBirth';

describe('parseBirthDate', () => {
  it('正常な日付をパースできる', () => {
    const result = parseBirthDate('1990-01-15');
    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString()).toBe('1990-01-15T00:00:00.000Z');
  });

  it('無効な日付は null を返す', () => {
    expect(parseBirthDate('invalid')).toBeNull();
    expect(parseBirthDate('1990-02-30')).toBeNull();
  });
});

describe('parseBirthTime', () => {
  it('正常な時刻をパースできる', () => {
    expect(parseBirthTime('10:30')).toBe('10:30');
  });

  it('null を許容する', () => {
    expect(parseBirthTime(null)).toBeNull();
  });

  it('無効な時刻は null を返す', () => {
    expect(parseBirthTime('25:00')).toBeNull();
    expect(parseBirthTime('9:00')).toBeNull();
  });
});

describe('toUTC', () => {
  it('JST → UTC 変換が正しい', () => {
    const result = toUTC('1990-01-15', '10:30', 'Asia/Tokyo');
    expect(result.toISOString()).toContain('1990-01-15T01:30:00');
  });

  it('時刻不明時は 00:00 として扱う', () => {
    const result = toUTC('1990-01-15', null, 'Asia/Tokyo');
    expect(result.toISOString()).toContain('1990-01-14T15:00:00');
  });
});

describe('formatBirthDateTime', () => {
  it('時刻ありの表示を返す', () => {
    expect(formatBirthDateTime('1990-01-15', '10:30', 'Asia/Tokyo')).toBe(
      '1990年1月15日 10:30 (JST)',
    );
  });

  it('時刻不明の表示を返す', () => {
    expect(formatBirthDateTime('1990-01-15', null, 'Asia/Tokyo')).toBe(
      '1990年1月15日 (時刻不明) (JST)',
    );
  });
});
