import { SafetyEngine } from '../services/SafetyEngine';

describe('SafetyEngine', () => {
  const engine = new SafetyEngine(true);

  test('click is SAFE and needs no confirmation', () => {
    const d = engine.evaluate('click', 'search button');
    expect(d.level).toBe('SAFE');
    expect(d.requiresConfirmation).toBe(false);
  });

  test('scroll is SAFE', () => {
    const d = engine.evaluate('scroll', 'page');
    expect(d.level).toBe('SAFE');
  });

  test('navigate is SAFE', () => {
    const d = engine.evaluate('navigate', 'missions page');
    expect(d.level).toBe('SAFE');
  });

  test('submit is SENSITIVE with confirmation', () => {
    const d = engine.evaluate('submit', 'registration form');
    expect(d.level).toBe('SENSITIVE');
    expect(d.requiresConfirmation).toBe(true);
    expect(d.message).toBeDefined();
  });

  test('delete action is SENSITIVE', () => {
    const d = engine.evaluate('delete', 'account');
    expect(d.level).toBe('SENSITIVE');
  });

  test('login target is SENSITIVE even for click action', () => {
    const d = engine.evaluate('click', 'login button');
    expect(d.level).toBe('SENSITIVE');
  });

  test('fill_form is SENSITIVE', () => {
    const d = engine.evaluate('fill_form', 'contact form');
    expect(d.level).toBe('SENSITIVE');
  });

  test('confirmation disabled works', () => {
    const noConfirmEngine = new SafetyEngine(false);
    const d = noConfirmEngine.evaluate('submit', 'form');
    expect(d.requiresConfirmation).toBe(false);
  });

  test('message includes action and target info', () => {
    const d = engine.evaluate('submit', 'payment form', 0.95);
    expect(d.message).toContain('submit');
    expect(d.message).toContain('95%');
  });
});
