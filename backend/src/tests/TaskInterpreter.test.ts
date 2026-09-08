import { TaskInterpreter } from '../services/TaskInterpreter';

describe('TaskInterpreter', () => {
  const interpreter = new TaskInterpreter();

  test('interprets search task', () => {
    const result = interpreter.interpret('Search for ISRO missions');
    expect(result.intent).toBe('SEARCH');
    expect(result.target).toBe('search');
    expect(result.value).toContain('ISRO');
  });

  test('interprets navigate to chandrayaan', () => {
    const result = interpreter.interpret('Find the Chandrayaan mission and open it');
    expect(result.intent).toBe('NAVIGATE');
    expect(result.target.toLowerCase()).toContain('chandrayaan');
  });

  test('interprets select dropdown', () => {
    const result = interpreter.interpret('Select India from the country dropdown');
    expect(result.intent).toBe('SELECT');
    expect(result.value).toBe('India');
    expect(result.target.toLowerCase()).toContain('country');
  });

  test('interprets fill form', () => {
    const result = interpreter.interpret('Fill the contact form with sample data');
    expect(result.intent).toBe('FILL_FORM');
    expect(result.target.toLowerCase()).toContain('contact');
  });

  test('interprets click action', () => {
    const result = interpreter.interpret('Click the Learn More button');
    expect(result.intent).toBe('CLICK');
    expect(result.target.toLowerCase()).toContain('learn more');
  });

  test('interprets scroll and click', () => {
    const result = interpreter.interpret('Scroll down and click Learn More');
    expect(result.intent).toBe('SCROLL_AND_CLICK');
    expect(result.target.toLowerCase()).toContain('learn more');
  });

  test('handles unknown tasks with fallback', () => {
    const result = interpreter.interpret('Do something weird');
    expect(result.intent).toBeDefined();
    expect(result.target).toBeDefined();
  });
});
