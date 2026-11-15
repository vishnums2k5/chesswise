import { describe, it, expect } from 'vitest';
import { getMirrorBotConfig } from './mirror-bot';

describe('Mirror Bot Configuration Engine', () => {
  it('targets tactics when tactics is the weakest axis', () => {
    const profile = {
      tactics: 30,
      strategy: 70,
      endgame: 60,
      opening: 50,
      calculation: 80,
    };
    const config = getMirrorBotConfig(profile);

    expect(config.skillLevel).toBe(14);
    expect(config.description).toContain('tactical');
    expect(config.openingHint).toContain('sharp');
  });

  it('targets calculation when calculation is the weakest axis', () => {
    const profile = {
      tactics: 70,
      strategy: 70,
      endgame: 60,
      opening: 50,
      calculation: 20,
    };
    const config = getMirrorBotConfig(profile);

    expect(config.description).toContain('forcing lines');
  });

  it('targets endgame when endgame is the weakest axis', () => {
    const profile = {
      tactics: 70,
      strategy: 65,
      endgame: 25,
      opening: 50,
      calculation: 60,
    };
    const config = getMirrorBotConfig(profile);

    expect(config.description).toContain('endgame');
  });

  it('targets opening when opening is the weakest axis', () => {
    const profile = {
      tactics: 70,
      strategy: 65,
      endgame: 60,
      opening: 20,
      calculation: 60,
    };
    const config = getMirrorBotConfig(profile);

    expect(config.description).toContain('opening');
  });
});
