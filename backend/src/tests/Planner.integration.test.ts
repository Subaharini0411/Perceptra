import { TaskInterpreter } from '../services/TaskInterpreter';
import { ActionPlanner } from '../services/ActionPlanner';

describe('ActionPlanner Integration', () => {
  const interpreter = new TaskInterpreter();
  const planner = new ActionPlanner();

  test('search task produces correct plan', () => {
    const intent = interpreter.interpret('Search for ISRO missions');
    const plan = planner.plan(intent);
    expect(plan.length).toBeGreaterThan(0);
    expect(plan.some(a => a.action === 'FILL')).toBe(true);
    expect(plan.some(a => a.action === 'CLICK')).toBe(true);
    expect(plan.find(a => a.action === 'FILL')?.value).toContain('ISRO');
  });

  test('navigate task produces FIND + CLICK', () => {
    const intent = interpreter.interpret('Find the Chandrayaan mission and open it');
    const plan = planner.plan(intent);
    const actions = plan.map(a => a.action);
    expect(actions).toContain('FIND');
    expect(actions).toContain('CLICK');
  });

  test('select task produces FIND + SELECT', () => {
    const intent = interpreter.interpret('Select India from the country dropdown');
    const plan = planner.plan(intent);
    const selectAction = plan.find(a => a.action === 'SELECT');
    expect(selectAction).toBeDefined();
    expect(selectAction?.value).toBe('India');
  });

  test('fill form task produces FILL_FORM', () => {
    const intent = interpreter.interpret('Fill the contact form with sample data');
    const plan = planner.plan(intent);
    expect(plan.some(a => a.action === 'FILL_FORM')).toBe(true);
  });

  test('scroll and click produces SCROLL + CLICK', () => {
    const intent = interpreter.interpret('Scroll down and click Learn More');
    const plan = planner.plan(intent);
    const actions = plan.map(a => a.action);
    expect(actions).toContain('SCROLL');
    expect(actions).toContain('CLICK');
  });

  test('all plan actions have required fields', () => {
    const intent = interpreter.interpret('Search for ISRO missions');
    const plan = planner.plan(intent);
    for (const action of plan) {
      expect(action.action).toBeDefined();
      expect(action.target).toBeDefined();
      expect(action.reason).toBeDefined();
    }
  });
});
