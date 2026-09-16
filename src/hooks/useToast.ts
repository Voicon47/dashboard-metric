// ============================================================
// ADSUN Dashboard — useToast.ts
// Wrapper around Sonner with preset toast types
// ============================================================

import { toast } from 'sonner';

export interface ToastPresets {
  ping: (nodeName: string, latencyMs: number) => void;
  pingError: (nodeName: string) => void;
  copy: (label?: string) => void;
  save: (label?: string) => void;
  saveError: (message?: string) => void;
  deleteServer: (nodeName: string) => void;
  throttleOn: () => void;
  throttleOff: () => void;
  restartPod: (nodeName: string) => void;
  info: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  success: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

export function useToast(): ToastPresets {
  return {
    ping: (nodeName, latencyMs) =>
      toast.success(`Ping ${nodeName}`, {
        description: `Round-trip: ${latencyMs}ms — Node is responding`,
        duration: 3000,
      }),

    pingError: (nodeName) =>
      toast.error(`Ping ${nodeName} failed`, {
        description: 'No response from host. Node may be offline.',
        duration: 4000,
      }),

    copy: (label = 'Content') =>
      toast.success(`${label} copied`, {
        description: 'Copied to clipboard successfully.',
        duration: 2500,
      }),

    save: (label = 'Configuration') =>
      toast.success(`${label} saved`, {
        description: 'Changes have been applied.',
        duration: 3000,
      }),

    saveError: (message = 'Please check the form for errors.') =>
      toast.error('Save failed', {
        description: message,
        duration: 4000,
      }),

    deleteServer: (nodeName) =>
      toast.warning(`Server "${nodeName}" removed`, {
        description: 'Node has been removed from the dashboard.',
        duration: 3500,
      }),

    throttleOn: () =>
      toast.warning('Throttling Enabled', {
        description: 'HN-02 entering high-load simulation mode.',
        duration: 3000,
      }),

    throttleOff: () =>
      toast.info('Throttling Disabled', {
        description: 'HN-02 returned to normal operation.',
        duration: 3000,
      }),

    restartPod: (nodeName) =>
      toast.info(`Restarting ${nodeName}`, {
        description: 'Pod restart initiated. Status will update shortly.',
        duration: 4000,
      }),

    info: (title, description) =>
      toast.info(title, { description, duration: 3000 }),

    error: (title, description) =>
      toast.error(title, { description, duration: 4000 }),

    success: (title, description) =>
      toast.success(title, { description, duration: 3000 }),

    warning: (title, description) =>
      toast.warning(title, { description, duration: 3500 }),
  };
}
