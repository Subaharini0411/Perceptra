/**
 * PERCEPTA - Task Interpreter (100% Local / Zero Cloud LLM)
 * Parses natural-language user instructions into structured action plans
 * with target intent, extraction entities, and parameter bindings.
 */

class TaskInterpreter {
  /**
   * Interpret natural-language task into high-level sub-actions
   * @param {string} instruction 
   * @param {string} baseUrl Current or target base demo URL
   * @returns {Object} Structured plan
   */
  parse(instruction, baseUrl = 'http://localhost:5000/demo') {
    const text = (instruction || '').toLowerCase().trim();
    const plan = [];

    // Task 1: "Search for ISRO missions"
    if (text.includes('search for isro missions') || (text.includes('search') && text.includes('missions'))) {
      plan.push({
        type: 'NAVIGATE',
        target: 'Missions Portal',
        url: `${baseUrl}/index.html`,
        description: 'Navigate to ISRO Missions Portal'
      });
      plan.push({
        type: 'INPUT',
        target: 'Search Input Box',
        selector: '#mission-search-input',
        targetKeyword: 'search',
        value: 'Chandrayaan',
        description: 'Focus search input and enter query "Chandrayaan"'
      });
      plan.push({
        type: 'CLICK',
        target: 'Search Button',
        selector: '#mission-search-button',
        targetKeyword: 'search',
        expectedOutcome: 'URL_CHANGE',
        description: 'Click Search button to trigger query'
      });
    }

    // Task 2: "Open the Chandrayaan mission card"
    else if (text.includes('chandrayaan')) {
      plan.push({
        type: 'NAVIGATE',
        target: 'Missions Portal',
        url: `${baseUrl}/index.html`,
        description: 'Navigate to Missions Portal'
      });
      plan.push({
        type: 'CLICK',
        target: 'Chandrayaan Mission Card Details',
        selector: '#btn-open-chandrayaan',
        targetKeyword: 'chandrayaan',
        expectedOutcome: 'MODAL_OPEN',
        description: 'Click "View Mission Details" on Chandrayaan-3 Card'
      });
    }

    // Task 3: "Fill the contact form with sample data" / proposal
    else if (text.includes('form') || text.includes('contact') || text.includes('proposal') || text.includes('fill')) {
      plan.push({
        type: 'NAVIGATE',
        target: 'Payload Proposal Form',
        url: `${baseUrl}/forms.html`,
        description: 'Navigate to Payload Proposal Form'
      });
      plan.push({
        type: 'INPUT',
        target: 'Principal Investigator Name',
        selector: '#investigator-name',
        targetKeyword: 'name',
        value: 'Dr. K. Sivan',
        description: 'Input scientist name'
      });
      plan.push({
        type: 'INPUT',
        target: 'Institutional Email',
        selector: '#investigator-email',
        targetKeyword: 'email',
        value: 'sivan@isro.gov.in',
        description: 'Input institutional email'
      });
      plan.push({
        type: 'SELECT',
        target: 'Country Selector',
        selector: '#country-select',
        value: 'India',
        description: 'Select country option "India"'
      });
      plan.push({
        type: 'CLICK',
        target: 'Submit Proposal Application',
        selector: '#btn-submit-proposal',
        targetKeyword: 'submit',
        isSensitive: true, // Triggers safety check!
        expectedOutcome: 'FORM_ALERT',
        description: 'Submit proposal application (Sensitive Action)'
      });
    }

    // Task 4: "Find the Mars mission and open its details"
    else if (text.includes('mars') || text.includes('mangalyaan')) {
      plan.push({
        type: 'NAVIGATE',
        target: 'Missions Portal',
        url: `${baseUrl}/index.html`,
        description: 'Navigate to Missions Portal'
      });
      plan.push({
        type: 'CLICK',
        target: 'Mars Orbiter Mission Details',
        selector: '#btn-open-mars',
        targetKeyword: 'mars',
        expectedOutcome: 'MODAL_OPEN',
        description: 'Click "View Mission Details" on Mars Mission Card'
      });
    }

    // Task 5: "Select India from the country dropdown"
    else if (text.includes('select') && (text.includes('india') || text.includes('dropdown'))) {
      plan.push({
        type: 'NAVIGATE',
        target: 'Payload Proposal Form',
        url: `${baseUrl}/forms.html`,
        description: 'Navigate to Payload Proposal Form'
      });
      plan.push({
        type: 'SELECT',
        target: 'Country Dropdown',
        selector: '#country-select',
        value: 'India',
        description: 'Select "India" from dropdown'
      });
    }

    // Task 6: "Scroll down and click the Learn More button"
    else if (text.includes('scroll') || text.includes('learn more')) {
      plan.push({
        type: 'NAVIGATE',
        target: 'News & Launches',
        url: `${baseUrl}/news.html`,
        description: 'Navigate to ISRO News & Bulletins'
      });
      plan.push({
        type: 'SCROLL',
        target: 'Viewport',
        direction: 'DOWN',
        description: 'Scroll down towards Next-Gen Launch Vehicle publication'
      });
      plan.push({
        type: 'CLICK',
        target: 'Learn More Button',
        selector: '#btn-learn-more',
        targetKeyword: 'learn more',
        description: 'Click "Learn More" on NGLV article'
      });
    }

    // Task 7: "Search for satellite communication and open the first result"
    else if (text.includes('satellite') || text.includes('telecom')) {
      plan.push({
        type: 'NAVIGATE',
        target: 'Search Database',
        url: `${baseUrl}/search.html`,
        description: 'Navigate to Mission Search Portal'
      });
      plan.push({
        type: 'INPUT',
        target: 'Search Query Input',
        selector: '#query-input',
        targetKeyword: 'query',
        value: 'Satellite',
        description: 'Enter search keyword "Satellite"'
      });
      plan.push({
        type: 'CLICK',
        target: 'Search Database Button',
        selector: '#btn-search-exec',
        targetKeyword: 'search',
        description: 'Click Search Database button'
      });
      plan.push({
        type: 'CLICK',
        target: 'First Search Result Details',
        selector: '#btn-result-1',
        targetKeyword: 'open details',
        description: 'Open details of first satellite result'
      });
    }

    // Shopping / Equipment Store Task: "Open the demo shopping site and search for a laptop"
    else if (text.includes('shopping') || text.includes('laptop') || text.includes('equipment') || text.includes('store')) {
      plan.push({
        type: 'NAVIGATE',
        target: 'Equipment Store',
        url: `${baseUrl}/shopping.html`,
        description: 'Navigate to Flight Equipment & Store'
      });
      plan.push({
        type: 'INPUT',
        target: 'Hardware Filter Search',
        selector: '#shop-search-input',
        targetKeyword: 'laptop',
        value: 'laptop',
        description: 'Filter hardware by keyword "laptop"'
      });
      plan.push({
        type: 'CLICK',
        target: 'Filter Hardware Button',
        selector: '#btn-shop-search',
        targetKeyword: 'filter',
        description: 'Click Filter Hardware button'
      });
      plan.push({
        type: 'CLICK',
        target: 'Add Ground Control Laptop to Cart',
        selector: '#btn-buy-laptop',
        targetKeyword: 'cart',
        description: 'Add Rugged Laptop to Requisition Cart'
      });
    }

    // Login Task: "Login with scientist credentials"
    else if (text.includes('login') || text.includes('authenticate') || text.includes('credentials') || text.includes('signin')) {
      plan.push({
        type: 'NAVIGATE',
        target: 'Scientist Gateway',
        url: `${baseUrl}/login.html`,
        description: 'Navigate to ISRO Operator Gateway'
      });
      plan.push({
        type: 'INPUT',
        target: 'Scientist Badge ID',
        selector: '#badge-id',
        targetKeyword: 'badge',
        value: 'ISRO-SC-88192',
        description: 'Enter Scientist Badge ID'
      });
      plan.push({
        type: 'INPUT',
        target: 'Security Keyphrase',
        selector: '#security-pin',
        targetKeyword: 'pin',
        value: 'orbit-secure-token',
        description: 'Enter Security Keyphrase'
      });
      plan.push({
        type: 'CLICK',
        target: 'Authenticate and Access Telemetry',
        selector: '#btn-login-submit',
        targetKeyword: 'authenticate',
        isSensitive: true, // Triggers safety modal!
        description: 'Submit credentials to access telemetry'
      });
    }
    else {
      let guessedIntent = 'CLICK';
      let extractedQuery = text.replace(/(click|find|open|search for|go to)/gi, '').trim();

      if (text.includes('search') || text.includes('find')) {
        guessedIntent = 'SEARCH';
        plan.push({
          type: 'INPUT',
          target: 'Search Box',
          selector: 'input[type="text"], input[type="search"]',
          targetKeyword: 'search',
          value: extractedQuery || 'ISRO',
          description: `Enter search query "${extractedQuery || 'ISRO'}"`
        });
        plan.push({
          type: 'CLICK',
          target: 'Submit Search',
          selector: 'button',
          targetKeyword: 'search',
          description: 'Trigger search button'
        });
      } else {
        plan.push({
          type: 'CLICK',
          target: extractedQuery || 'Target Element',
          targetKeyword: extractedQuery,
          description: `Locate and click "${extractedQuery}"`
        });
      }
    }

    return {
      rawInstruction: instruction,
      taskName: instruction,
      totalSteps: plan.length,
      plan
    };
  }
}

module.exports = new TaskInterpreter();
