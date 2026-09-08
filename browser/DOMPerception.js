/**
 * PERCEPTA - DOM Perception Engine
 * Injects non-intrusive inspection script into the target page to extract
 * complete DOM intelligence: tags, computed bounds, text content, accessibility roles,
 * form attributes, and visibility hierarchy.
 */

class DOMPerception {
  /**
   * Scans page and extracts structured candidate elements
   * @param {import('playwright').Page} page 
   * @returns {Promise<Array>} List of raw DOM elements with geometry and semantics
   */
  async scan(page) {
    if (!page) {
      throw new Error('No active Playwright page available for DOM scan');
    }

    const domElements = await page.evaluate(() => {
      const candidates = [];
      const selectors = [
        'button', 
        'input', 
        'a', 
        'select', 
        'textarea', 
        '[role="button"]', 
        '[role="link"]', 
        '[role="checkbox"]', 
        '.mission-card', 
        '.card-btn', 
        '.search-btn', 
        'h1', 'h2', 'h3'
      ];

      const elements = Array.from(document.querySelectorAll(selectors.join(',')));

      elements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        
        // Skip invisible or zero-dimension elements
        if (rect.width === 0 || rect.height === 0) return;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return;

        // Extract clean text content
        const text = (el.innerText || el.textContent || el.value || el.placeholder || el.getAttribute('aria-label') || '').trim();
        
        // Compute unique DOM path/selector
        let selector = el.id ? `#${el.id}` : el.tagName.toLowerCase();
        if (el.className && typeof el.className === 'string' && !el.id) {
          selector += '.' + el.className.split(' ').filter(Boolean).slice(0, 2).join('.');
        }

        candidates.push({
          domId: el.id || `dom-node-${index + 1}`,
          tag: el.tagName.toLowerCase(),
          type: el.getAttribute('type') || null,
          role: el.getAttribute('role') || el.tagName.toLowerCase(),
          text: text.slice(0, 120),
          placeholder: el.getAttribute('placeholder') || null,
          name: el.getAttribute('name') || null,
          ariaLabel: el.getAttribute('aria-label') || null,
          selector,
          x: Math.round(rect.left + window.scrollX),
          y: Math.round(rect.top + window.scrollY),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          isVisible: true,
          isClickable: ['button', 'a', 'select', 'input'].includes(el.tagName.toLowerCase()) || el.classList.contains('mission-card') || el.classList.contains('card-btn')
        });
      });

      return candidates;
    });

    return domElements;
  }
}

module.exports = new DOMPerception();
