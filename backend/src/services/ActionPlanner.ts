import { TaskIntent, PlannedAction } from '../types';

export class ActionPlanner {
  plan(intent: TaskIntent): PlannedAction[] {
    const { intent: type, target, value } = intent;

    switch (type) {
      case 'SEARCH':
        return [
          { action: 'FIND', target: 'search', reason: 'Locate search input' },
          { action: 'FILL', target: 'search', value: value || target, reason: 'Enter search query' },
          { action: 'CLICK', target: 'search-button', reason: 'Submit search' },
        ];

      case 'NAVIGATE':
        return [
          { action: 'FIND', target, reason: `Locate ${target}` },
          { action: 'CLICK', target, reason: `Open ${target}` },
        ];

      case 'SELECT':
        return [
          { action: 'FIND', target, reason: `Locate ${target} dropdown` },
          { action: 'SELECT', target, value: value || target, reason: `Select ${value} from ${target}` },
        ];

      case 'SCROLL_AND_CLICK':
        return [
          { action: 'SCROLL', target: 'page', value: 'down', reason: 'Scroll to reveal element' },
          { action: 'FIND', target, reason: `Locate ${target}` },
          { action: 'CLICK', target, reason: `Click ${target}` },
        ];

      case 'FILL_FORM':
        return [
          { action: 'FIND', target: `${target} form`, reason: 'Locate form' },
          { action: 'FILL_FORM', target, value: value || 'sample data', reason: 'Fill form fields with sample data' },
        ];

      case 'CLICK':
        return [
          { action: 'FIND', target, reason: `Locate ${target}` },
          { action: 'CLICK', target, reason: `Click ${target}` },
        ];

      case 'SCROLL':
        return [
          { action: 'SCROLL', target: 'page', value: value || 'down', reason: 'Scroll page' },
        ];

      default:
        return [
          { action: 'FIND', target, reason: `Locate ${target}` },
          { action: 'CLICK', target, reason: `Interact with ${target}` },
        ];
    }
  }
}
