<script lang="ts">
  /**
   * FormEnhancer Component
   * Enhances form inputs with additional features like templates, stats, and quick actions
   */

  interface Props {
    /**
     * The target input/textarea element to enhance
     */
    targetInput: HTMLInputElement | HTMLTextAreaElement;

    /**
     * Optional position offset from the target element
     */
    offsetY?: number;
  }

  let { targetInput, offsetY = 8 }: Props = $props();

  // Reactive state synchronized with host input
  let inputValue = $state(targetInput.value);
  let isExpanded = $state(false);

  // Derived stats
  let charCount = $derived(inputValue.length);
  let wordCount = $derived(inputValue.split(/\s+/).filter(Boolean).length);
  let lineCount = $derived(inputValue.split('\n').length);

  // Template library
  const templates = [
    {
      name: 'Question Template',
      icon: '❓',
      text: 'Context:\n\nQuestion:\n\nExpected output:'
    },
    {
      name: 'Bug Report',
      icon: '🐛',
      text: 'Steps to reproduce:\n1. \n\nExpected behavior:\n\nActual behavior:\n\nEnvironment:'
    },
    {
      name: 'Code Review',
      icon: '💻',
      text: 'Code:\n```\n\n```\n\nIssues:\n\nSuggestions:'
    },
    {
      name: 'Feature Request',
      icon: '✨',
      text: 'Feature:\n\nUse case:\n\nProposed solution:\n\nAlternatives considered:'
    }
  ];

  /**
   * Sync input value from host element to Svelte state
   * Listens for input events on the target element
   */
  $effect(() => {
    const handleInput = () => {
      inputValue = targetInput.value;
    };

    const handleChange = () => {
      inputValue = targetInput.value;
    };

    targetInput.addEventListener('input', handleInput);
    targetInput.addEventListener('change', handleChange);

    return () => {
      targetInput.removeEventListener('input', handleInput);
      targetInput.removeEventListener('change', handleChange);
    };
  });

  /**
   * Update the host input element and trigger its events
   * This ensures the host page's JavaScript is aware of changes
   */
  function updateHost(newValue: string) {
    inputValue = newValue;
    targetInput.value = newValue;

    // Dispatch events that the host page might be listening for
    targetInput.dispatchEvent(new Event('input', { bubbles: true }));
    targetInput.dispatchEvent(new Event('change', { bubbles: true }));

    // Some frameworks need these
    targetInput.dispatchEvent(new Event('keyup', { bubbles: true }));
    targetInput.dispatchEvent(new Event('blur', { bubbles: true }));
    targetInput.focus();
  }

  /**
   * Insert a template into the input
   */
  function insertTemplate(template: typeof templates[0]) {
    const newValue = inputValue.trim()
      ? `${inputValue}\n\n${template.text}`
      : template.text;
    updateHost(newValue);
  }

  /**
   * Clear the input with confirmation
   */
  function clearInput() {
    if (inputValue && !confirm('Clear all text?')) {
      return;
    }
    updateHost('');
  }

  /**
   * Copy current value to clipboard
   */
  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(inputValue);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  /**
   * Format text (simple example - add line breaks)
   */
  function formatText() {
    // Remove multiple consecutive blank lines
    const formatted = inputValue
      .split('\n')
      .reduce((acc: string[], line, i, arr) => {
        if (line.trim() || (i > 0 && arr[i - 1].trim())) {
          acc.push(line);
        }
        return acc;
      }, [])
      .join('\n')
      .trim();

    updateHost(formatted);
  }
</script>

<div class="fixed right-5 bottom-5 z-[9999] flex flex-col items-end gap-2 font-sans select-none">
  <!-- Main enhancer card -->
  <div
    class="bg-white text-gray-800 rounded-lg shadow-lg border border-gray-200 transition-all duration-300 overflow-hidden"
    class:w-80={isExpanded}
    class:w-auto={!isExpanded}
  >
    <!-- Header - Always visible -->
    <div class="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-lg">✏️</span>
          <h3 class="font-semibold text-sm">Form Enhancer</h3>
        </div>
        <button
          onclick={() => isExpanded = !isExpanded}
          class="hover:bg-white/20 rounded p-1 transition-colors"
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          <svg
            class="w-4 h-4 transition-transform duration-300"
            class:rotate-180={isExpanded}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Stats - Always visible when content exists -->
    {#if charCount > 0}
      <div class="px-3 py-2 bg-gray-50 border-b border-gray-200">
        <div class="flex gap-4 text-xs text-gray-600">
          <span class="flex items-center gap-1">
            <span class="font-medium">Chars:</span>
            <span class="font-semibold text-gray-900">{charCount}</span>
          </span>
          <span class="flex items-center gap-1">
            <span class="font-medium">Words:</span>
            <span class="font-semibold text-gray-900">{wordCount}</span>
          </span>
          <span class="flex items-center gap-1">
            <span class="font-medium">Lines:</span>
            <span class="font-semibold text-gray-900">{lineCount}</span>
          </span>
        </div>
      </div>
    {/if}

    <!-- Expanded content -->
    {#if isExpanded}
      <div class="p-3 space-y-3">
        <!-- Templates section -->
        <div>
          <h4 class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Templates
          </h4>
          <div class="grid grid-cols-2 gap-2">
            {#each templates as template}
              <button
                onclick={() => insertTemplate(template)}
                class="flex items-center gap-2 px-3 py-2 text-left text-sm bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-md transition-colors"
                title={template.name}
              >
                <span class="text-base">{template.icon}</span>
                <span class="text-xs font-medium text-gray-700 truncate">
                  {template.name}
                </span>
              </button>
            {/each}
          </div>
        </div>

        <!-- Quick actions -->
        <div>
          <h4 class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Quick Actions
          </h4>
          <div class="flex gap-2">
            <button
              onclick={copyToClipboard}
              disabled={!charCount}
              class="flex-1 px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Copy to clipboard"
            >
              📋 Copy
            </button>
            <button
              onclick={formatText}
              disabled={!charCount}
              class="flex-1 px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Format text"
            >
              ✨ Format
            </button>
            <button
              onclick={clearInput}
              disabled={!charCount}
              class="flex-1 px-3 py-2 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Clear all text"
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        <!-- Preview section (if content is long) -->
        {#if charCount > 200}
          <div>
            <h4 class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Preview
            </h4>
            <div class="p-2 bg-gray-50 rounded text-xs text-gray-600 max-h-24 overflow-y-auto">
              {inputValue.slice(0, 200)}...
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Minimized indicator when collapsed -->
  {#if !isExpanded && charCount > 0}
    <button
      onclick={() => isExpanded = true}
      class="px-3 py-1 bg-blue-500 text-white text-xs rounded-full shadow hover:bg-blue-600 transition-colors"
    >
      {charCount} chars • {wordCount} words
    </button>
  {/if}
</div>

<style>
  /* Additional custom styles if needed beyond Tailwind */
  button:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  /* Smooth animations */
  .space-y-3 > * {
    animation: slideIn 0.2s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
