import { generateUniquePseudo, generateCustomPseudo } from './index';

describe('Utils', () => {
  describe('generateUniquePseudo', () => {
    it('should generate a pseudo with verrou prefix', () => {
      const pseudo = generateUniquePseudo();
      expect(pseudo).toMatch(/^verrou_[a-z0-9]{6}$/);
    });

    it('should generate unique pseudos', () => {
      const pseudo1 = generateUniquePseudo();
      const pseudo2 = generateUniquePseudo();
      expect(pseudo1).not.toBe(pseudo2);
    });
  });

  describe('generateCustomPseudo', () => {
    it('should generate a pseudo with custom prefix', () => {
      const pseudo = generateCustomPseudo('test');
      expect(pseudo).toMatch(/^test_[a-z0-9]{6}$/);
    });

    it('should generate a pseudo with custom length', () => {
      const pseudo = generateCustomPseudo('user', 8);
      expect(pseudo).toMatch(/^user_[a-z0-9]{8}$/);
    });

    it('should use default values when not provided', () => {
      const pseudo = generateCustomPseudo();
      expect(pseudo).toMatch(/^user_[a-z0-9]{6}$/);
    });
  });
});
