import { mount } from "svelte";
import App from "./views/App.svelte";
import FormEnhancer from "./views/FormEnhancer.svelte";
// DO NOT import style.css here - it will affect the host page
import styleText from "./style.css?inline";
import { observeAndEnhance } from "./utils/domObserver";

console.log("[CRXJS] Hello world from content script!");

/**
 * Mount the Svelte app to the DOM using Shadow DOM for style isolation.
 */
function mountApp() {
  const host = document.createElement("div");
  host.id = "crxjs-app-host";
  document.body.appendChild(host);

  // Create Shadow DOM to isolate styles
  const shadowRoot = host.attachShadow({ mode: "open" });

  // Inject styles ONLY inside Shadow DOM
  const style = document.createElement("style");
  style.textContent = styleText;
  shadowRoot.appendChild(style);

  const container = document.createElement("div");
  shadowRoot.appendChild(container);

  mount(App, {
    target: container,
  });
}

/**
 * Enhance form inputs dynamically using MutationObserver pattern
 * This watches for textarea and input elements and adds enhancement UI
 */
function enhanceFormInputs() {
  // Track which inputs we've already enhanced to avoid duplicates
  const enhancedInputs = new WeakMap<Element, { host: HTMLElement; observer: MutationObserver }>();

  // Define selectors for inputs we want to enhance
  const inputSelectors = [
    'textarea[name*="prompt"]',
    'textarea[placeholder*="prompt" i]',
    'textarea[id*="prompt"]',
    'textarea.prompt-input',
    // Add more specific selectors for your target sites:
    // 'textarea#chat-input',
    // 'div[contenteditable="true"][role="textbox"]', // For contenteditable divs
  ].join(', ');

  // Use MutationObserver to watch for matching inputs
  observeAndEnhance({
    selector: inputSelectors,
    onFound: (element) => {
      console.log('[CRXJS] Found input to enhance:', element);

      // Skip if already enhanced
      if (enhancedInputs.has(element)) {
        return;
      }

      // Ensure it's a valid input element
      if (!(element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement)) {
        return;
      }

      // Create host for FormEnhancer with Shadow DOM
      const enhancerHost = document.createElement("div");
      enhancerHost.id = `crxjs-form-enhancer-${Date.now()}`;
      document.body.appendChild(enhancerHost);

      // Create Shadow DOM for the enhancer
      const shadowRoot = enhancerHost.attachShadow({ mode: "open" });

      // Inject styles into Shadow DOM
      const style = document.createElement("style");
      style.textContent = styleText;
      shadowRoot.appendChild(style);

      // Create container inside Shadow DOM
      const container = document.createElement("div");
      shadowRoot.appendChild(container);

      // Mount FormEnhancer component
      mount(FormEnhancer, {
        target: container,
        props: {
          targetInput: element,
        },
      });

      console.log('[CRXJS] FormEnhancer mounted for input');

      // Track this enhancement
      enhancedInputs.set(element, {
        host: enhancerHost,
        observer: new MutationObserver(() => {}), // Placeholder for cleanup
      });
    },
    onRemoved: (element) => {
      console.log('[CRXJS] Input removed from DOM:', element);

      // Cleanup: remove enhancer when input is removed
      const enhancement = enhancedInputs.get(element);
      if (enhancement) {
        enhancement.host.remove();
        enhancement.observer.disconnect();
        enhancedInputs.delete(element);
        console.log('[CRXJS] FormEnhancer cleaned up');
      }
    },
    debounce: 100, // Debounce to avoid rapid mounting
  });

  console.log('[CRXJS] Form input observer started');
}

// Initialize
mountApp();
enhanceFormInputs();
