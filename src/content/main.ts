import { mount } from "svelte";
import App from "./views/App.svelte";
// DO NOT import style.css here - it will affect the host page
import styleText from "./style.css?inline";

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

mountApp();
