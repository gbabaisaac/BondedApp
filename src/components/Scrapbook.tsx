/**
 * Scrapbook Component
 * Dating mode with Bonded Stages progression
 * Wrapper around LoveModeNew to match spec naming
 */

import { LoveModeNew } from './LoveModeNew';

interface ScrapbookProps {
  onExit: () => void;
}

export function Scrapbook({ onExit }: ScrapbookProps) {
  return <LoveModeNew onExit={onExit} />;
}

