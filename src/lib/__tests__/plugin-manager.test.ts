import { PluginManager } from '../plugin-manager';
import type { Plugin } from '@/types/plugin.types';

describe('PluginManager', () => {
  let manager: PluginManager;

  beforeEach(() => {
    manager = new PluginManager();
  });

  describe('register', () => {
    it('should register a plugin', () => {
      const plugin: Plugin = {
        name: 'test-plugin',
      };

      manager.register(plugin);
      expect(manager.getPlugins()).toHaveLength(1);
      expect(manager.getPlugins()[0].name).toBe('test-plugin');
    });

    it('should throw error when registering duplicate plugin', () => {
      const plugin: Plugin = {
        name: 'test-plugin',
      };

      manager.register(plugin);
      expect(() => manager.register(plugin)).toThrow(
        'Plugin "test-plugin" is already registered'
      );
    });
  });

  describe('unregister', () => {
    it('should unregister a plugin', () => {
      const plugin: Plugin = {
        name: 'test-plugin',
      };

      manager.register(plugin);
      expect(manager.getPlugins()).toHaveLength(1);

      manager.unregister('test-plugin');
      expect(manager.getPlugins()).toHaveLength(0);
    });

    it('should do nothing when unregistering non-existent plugin', () => {
      expect(() => manager.unregister('non-existent')).not.toThrow();
    });
  });

  describe('executeBeforeParse', () => {
    it('should execute beforeParse hooks in order', async () => {
      const plugin1: Plugin = {
        name: 'plugin-1',
        beforeParse: async (html) => html + '1',
      };

      const plugin2: Plugin = {
        name: 'plugin-2',
        beforeParse: async (html) => html + '2',
      };

      manager.register(plugin1);
      manager.register(plugin2);

      const result = await manager.executeBeforeParse(
        'test',
        { slideSelector: '.slide' },
        { metadata: {}, state: new Map() }
      );

      expect(result).toBe('test12');
    });
  });
});
