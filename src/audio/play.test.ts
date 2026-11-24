import { beforeEach, describe, expect, it, vi } from 'vitest';

const cue = { type: 'penalty' } as const;
let created = 0;
let closed = 0;

class FakeAudioContext {
  state = 'suspended';
  constructor() {
    created++;
  }
  // Nothing is scheduled: only the contexts matter here.
  resume = () => Promise.reject(new Error('blocked'));
  close = () => {
    closed++;
    return Promise.resolve();
  };
}

/** A fresh copy of the module, as after a page reload. */
async function reload() {
  vi.resetModules();
  return import('./play');
}

beforeEach(() => {
  created = closed = 0;
  const items = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => items.set(key, value),
    removeItem: (key: string) => items.delete(key),
  });
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('navigator', {});
});

describe('sound setting', () => {
  it('is on at first', async () => {
    const { isSoundOn, play } = await reload();
    expect(isSoundOn()).toBe(true);
    await play(cue);
    expect(created).toBe(1);
  });

  it('off survives a reload and does not touch audio', async () => {
    (await reload()).setSoundOn(false);
    const { isSoundOn, play } = await reload();
    expect(isSoundOn()).toBe(false);
    await play(cue);
    expect(created).toBe(0);
  });

  it('off stops what is playing, and on starts again', async () => {
    const { play, setSoundOn } = await reload();
    await play(cue);
    setSoundOn(false);
    expect(closed).toBe(1);
    setSoundOn(true);
    await play(cue);
    expect(created).toBe(2);
  });
});
