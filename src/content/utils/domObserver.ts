/**
 * DOM Observer Utility
 * Watches for elements matching a selector and calls a callback when found
 */

export interface ObserverOptions {
  /**
   * CSS selector to watch for
   */
  selector: string;

  /**
   * Callback function when element is found
   */
  onFound: (element: Element) => void;

  /**
   * Callback function when element is removed
   */
  onRemoved?: (element: Element) => void;

  /**
   * Whether to observe only once (stop after first match)
   */
  once?: boolean;

  /**
   * Debounce time in milliseconds to avoid rapid callbacks
   */
  debounce?: number;
}

/**
 * Observes DOM for elements matching a selector and calls callback when found.
 * Handles both existing elements and dynamically added ones.
 *
 * @param options Observer configuration
 * @returns MutationObserver instance (call .disconnect() to stop observing)
 *
 * @example
 * ```ts
 * const observer = observeAndEnhance({
 *   selector: 'textarea[name="prompt"]',
 *   onFound: (element) => {
 *     console.log('Found prompt input!', element);
 *     // Enhance the element
 *   },
 *   onRemoved: (element) => {
 *     console.log('Element removed', element);
 *     // Cleanup
 *   }
 * });
 *
 * // Later: observer.disconnect();
 * ```
 */
export function observeAndEnhance(options: ObserverOptions): MutationObserver {
  const { selector, onFound, onRemoved, once = false, debounce = 0 } = options;

  // Track which elements we've already processed
  const processedElements = new WeakSet<Element>();

  // Debounce timer
  let debounceTimer: number | null = null;

  /**
   * Process an element if it matches and hasn't been processed
   */
  function processElement(element: Element) {
    if (processedElements.has(element)) {
      return;
    }

    if (debounce > 0) {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = window.setTimeout(() => {
        executeCallback(element);
      }, debounce);
    } else {
      executeCallback(element);
    }
  }

  function executeCallback(element: Element) {
    processedElements.add(element);
    onFound(element);

    if (once && observer) {
      observer.disconnect();
    }
  }

  /**
   * Check an element and its descendants for matches
   */
  function checkElement(element: Element) {
    // Check if the element itself matches
    if (element.matches(selector)) {
      processElement(element);
    }

    // Check descendants
    const matches = element.querySelectorAll(selector);
    matches.forEach(match => processElement(match));
  }

  /**
   * Handle removed nodes
   */
  function handleRemovedNodes(nodes: NodeList) {
    if (!onRemoved) return;

    nodes.forEach(node => {
      if (node instanceof Element) {
        if (node.matches(selector) && processedElements.has(node)) {
          onRemoved(node);
        }

        // Check descendants
        const matches = node.querySelectorAll(selector);
        matches.forEach(match => {
          if (processedElements.has(match)) {
            onRemoved(match);
          }
        });
      }
    });
  }

  // Check for existing elements immediately
  const existingElements = document.querySelectorAll(selector);
  existingElements.forEach(element => processElement(element));

  // If we found elements and once is true, don't set up observer
  if (once && existingElements.length > 0) {
    // Return a dummy observer that's already disconnected
    const dummyObserver = new MutationObserver(() => {});
    return dummyObserver;
  }

  // Set up MutationObserver for future changes
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      // Handle added nodes
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node instanceof Element) {
            checkElement(node);
          }
        });

        // Handle removed nodes
        if (mutation.removedNodes.length > 0) {
          handleRemovedNodes(mutation.removedNodes);
        }
      }

      // Handle attribute changes (in case selector uses attributes)
      if (mutation.type === 'attributes' && mutation.target instanceof Element) {
        checkElement(mutation.target);
      }
    }
  });

  // Start observing the document
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: selector.match(/\[([^\]]+)\]/)?.[1]?.split('=')[0]
      ? [selector.match(/\[([^\]]+)\]/)?.[1]?.split('=')[0]!]
      : undefined
  });

  return observer;
}

/**
 * Shorthand for observing a single selector once
 *
 * @example
 * ```ts
 * observeOnce('textarea[name="prompt"]', (element) => {
 *   console.log('Found it!', element);
 * });
 * ```
 */
export function observeOnce(
  selector: string,
  onFound: (element: Element) => void
): MutationObserver {
  return observeAndEnhance({ selector, onFound, once: true });
}

/**
 * Wait for an element to appear in the DOM
 * Returns a promise that resolves when the element is found
 *
 * @example
 * ```ts
 * const element = await waitForElement('textarea[name="prompt"]');
 * console.log('Element appeared!', element);
 * ```
 */
export function waitForElement(
  selector: string,
  timeout?: number
): Promise<Element> {
  return new Promise((resolve, reject) => {
    // Check if it already exists
    const existing = document.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    // Set up timeout if specified
    let timeoutId: number | undefined;
    if (timeout) {
      timeoutId = window.setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout waiting for element: ${selector}`));
      }, timeout);
    }

    // Observe for the element
    const observer = observeOnce(selector, (element) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      resolve(element);
    });
  });
}
