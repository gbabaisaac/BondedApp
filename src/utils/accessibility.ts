/**
 * Accessibility utilities and helpers
 */

/**
 * Generate ARIA label for profile card
 */
export function getProfileCardAriaLabel(profile: {
  name: string;
  major?: string;
  year?: string;
  school?: string;
}): string {
  const parts = [profile.name];
  if (profile.major) parts.push(profile.major);
  if (profile.year) parts.push(profile.year);
  if (profile.school) parts.push(`at ${profile.school}`);
  return parts.join(', ');
}

/**
 * Generate ARIA label for action button
 */
export function getActionButtonAriaLabel(action: string, targetName: string): string {
  return `${action} ${targetName}`;
}

/**
 * Keyboard navigation handler for grid items
 */
export function handleGridKeyDown(
  event: React.KeyboardEvent,
  onSelect: () => void,
  onNext?: () => void,
  onPrev?: () => void
): void {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      onSelect();
      break;
    case 'ArrowRight':
      event.preventDefault();
      onNext?.();
      break;
    case 'ArrowLeft':
      event.preventDefault();
      onPrev?.();
      break;
  }
}

/**
 * Focus trap for modals
 */
export function createFocusTrap(
  container: HTMLElement,
  firstFocusable?: HTMLElement,
  lastFocusable?: HTMLElement
): () => void {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const first = firstFocusable || (focusableElements[0] as HTMLElement);
  const last = lastFocusable || (focusableElements[focusableElements.length - 1] as HTMLElement);

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleTab);
  first?.focus();

  return () => {
    container.removeEventListener('keydown', handleTab);
  };
}

/**
 * Announce to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}


