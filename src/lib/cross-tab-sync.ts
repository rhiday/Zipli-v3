'use client';

import { toast } from '@/hooks/use-toast';

export interface TabMessage {
  type: string;
  data?: any;
  timestamp: number;
  tabId: string;
}

export interface TabSyncConfig {
  channelName: string;
  isLeader: boolean;
  onMessage?: (message: TabMessage) => void;
  onLeaderChange?: (isLeader: boolean) => void;
}

class CrossTabSync {
  private static instances = new Map<string, CrossTabSync>();
  private channel: BroadcastChannel;
  private tabId: string;
  private isLeader: boolean = false;
  private heartbeatInterval?: NodeJS.Timeout;
  private leaderCheckInterval?: NodeJS.Timeout;
  private config: TabSyncConfig;
  private lastHeartbeat = new Map<string, number>();

  constructor(config: TabSyncConfig) {
    this.config = config;
    this.tabId = this.generateTabId();
    this.channel = new BroadcastChannel(config.channelName);

    this.channel.addEventListener('message', this.handleMessage.bind(this));

    // Initialize leadership
    this.initializeLeadership();

    // Start heartbeat
    this.startHeartbeat();

    // Check for leader periodically
    this.startLeaderCheck();

    // Handle tab close
    window.addEventListener('beforeunload', this.cleanup.bind(this));
  }

  static getInstance(config: TabSyncConfig): CrossTabSync {
    const key = config.channelName;
    if (!CrossTabSync.instances.has(key)) {
      CrossTabSync.instances.set(key, new CrossTabSync(config));
    }
    return CrossTabSync.instances.get(key)!;
  }

  private generateTabId(): string {
    return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleMessage(event: MessageEvent<TabMessage>) {
    const message = event.data;

    // Ignore own messages
    if (message.tabId === this.tabId) return;

    switch (message.type) {
      case 'HEARTBEAT':
        this.lastHeartbeat.set(message.tabId, message.timestamp);
        break;

      case 'LEADER_ELECTION':
        this.handleLeaderElection(message);
        break;

      case 'STATE_UPDATE':
        this.config.onMessage?.(message);
        if (!this.isLeader) {
          toast({
            title: 'Updated from another tab',
            description: 'Your data has been synchronized',
            variant: 'info',
          });
        }
        break;

      case 'TAB_CLOSING':
        this.lastHeartbeat.delete(message.tabId);
        break;

      default:
        this.config.onMessage?.(message);
    }
  }

  private initializeLeadership() {
    // Request leadership
    this.broadcast({
      type: 'LEADER_ELECTION',
      data: { requesting: true },
    });

    // If no response in 500ms, become leader
    setTimeout(() => {
      if (!this.isLeader) {
        this.becomeLeader();
      }
    }, 500);
  }

  private handleLeaderElection(message: TabMessage) {
    if (message.data?.requesting) {
      if (this.isLeader) {
        // Respond that we are already the leader
        this.broadcast({
          type: 'LEADER_ELECTION',
          data: { isLeader: true },
        });
      }
    } else if (message.data?.isLeader && !this.isLeader) {
      // Another tab is already the leader
      this.isLeader = false;
      this.config.onLeaderChange?.(false);
    }
  }

  private becomeLeader() {
    const wasLeader = this.isLeader;
    this.isLeader = true;

    if (!wasLeader) {
      this.config.onLeaderChange?.(true);
      this.broadcast({
        type: 'LEADER_ELECTION',
        data: { isLeader: true },
      });
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.broadcast({
        type: 'HEARTBEAT',
      });
    }, 5000); // Every 5 seconds
  }

  private startLeaderCheck() {
    this.leaderCheckInterval = setInterval(() => {
      // Clean up old heartbeats (tabs that closed without notification)
      const now = Date.now();
      const entries = Array.from(this.lastHeartbeat.entries());
      for (const [tabId, lastSeen] of entries) {
        if (now - lastSeen > 15000) {
          // 15 seconds timeout
          this.lastHeartbeat.delete(tabId);
        }
      }

      // If we're not the leader and no heartbeats from other tabs, become leader
      if (!this.isLeader && this.lastHeartbeat.size === 0) {
        this.becomeLeader();
      }
    }, 10000); // Every 10 seconds
  }

  private broadcast(message: Omit<TabMessage, 'timestamp' | 'tabId'>) {
    const fullMessage: TabMessage = {
      ...message,
      timestamp: Date.now(),
      tabId: this.tabId,
    };

    this.channel.postMessage(fullMessage);
  }

  public syncState(type: string, data: any) {
    this.broadcast({
      type: 'STATE_UPDATE',
      data: { type, data },
    });
  }

  public isCurrentLeader(): boolean {
    return this.isLeader;
  }

  public getTabId(): string {
    return this.tabId;
  }

  private cleanup() {
    this.broadcast({
      type: 'TAB_CLOSING',
    });

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    if (this.leaderCheckInterval) {
      clearInterval(this.leaderCheckInterval);
    }

    this.channel.close();
    CrossTabSync.instances.delete(this.config.channelName);
  }
}

// Hook for easy usage in React components
export function useCrossTabSync(channelName: string) {
  const sync = CrossTabSync.getInstance({
    channelName,
    isLeader: false, // Will be determined automatically
    onMessage: (message) => {
      // Handle custom message types here if needed
    },
    onLeaderChange: (isLeader) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `Tab ${isLeader ? 'became' : 'lost'} leadership for ${channelName}`
        );
      }
    },
  });

  return {
    syncState: (type: string, data: any) => sync.syncState(type, data),
    isLeader: sync.isCurrentLeader(),
    tabId: sync.getTabId(),
  };
}

export { CrossTabSync };
