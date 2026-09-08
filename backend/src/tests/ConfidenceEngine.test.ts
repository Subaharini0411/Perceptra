import { ConfidenceEngine } from '../services/ConfidenceEngine';

describe('ConfidenceEngine', () => {
  const engine = new ConfidenceEngine(0.70);

  test('score >= 0.90 is HIGH and auto-executes', () => {
    const d = engine.evaluate(0.95);
    expect(d.level).toBe('HIGH');
    expect(d.canExecute).toBe(true);
    expect(d.requiresVerification).toBe(false);
  });

  test('score 0.90 is exactly HIGH', () => {
    const d = engine.evaluate(0.90);
    expect(d.level).toBe('HIGH');
    expect(d.canExecute).toBe(true);
  });

  test('score 0.80 is MEDIUM and requires verification', () => {
    const d = engine.evaluate(0.80);
    expect(d.level).toBe('MEDIUM');
    expect(d.canExecute).toBe(true);
    expect(d.requiresVerification).toBe(true);
  });

  test('score at threshold 0.70 is MEDIUM', () => {
    const d = engine.evaluate(0.70);
    expect(d.level).toBe('MEDIUM');
    expect(d.canExecute).toBe(true);
  });

  test('score 0.50 is LOW and cannot execute', () => {
    const d = engine.evaluate(0.50);
    expect(d.level).toBe('LOW');
    expect(d.canExecute).toBe(false);
  });

  test('score 0 is LOW', () => {
    const d = engine.evaluate(0);
    expect(d.level).toBe('LOW');
    expect(d.canExecute).toBe(false);
  });

  test('custom threshold respected', () => {
    const engine2 = new ConfidenceEngine(0.80);
    expect(engine2.evaluate(0.75).level).toBe('LOW');
    expect(engine2.evaluate(0.85).level).toBe('MEDIUM');
  });
});
