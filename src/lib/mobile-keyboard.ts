'use client';

import * as React from 'react';

export interface ViewportInfo {
  height: number;
  width: number;
  isKeyboardOpen: boolean;
  keyboardHeight: number;
}

export interface KeyboardOptions {
  preventBodyScroll?: boolean;
  adjustViewport?: boolean;
  scrollActiveElementIntoView?: boolean;
  onKeyboardShow?: (keyboardHeight: number) => void;
  onKeyboardHide?: () => void;
}

const DEFAULT_OPTIONS: KeyboardOptions = {
  preventBodyScroll: true,
  adjustViewport: true,
  scrollActiveElementIntoView: true,
};

class MobileKeyboardManager {
  private static instance: MobileKeyboardManager;
  private initialViewportHeight: number = 0;
  private currentViewportHeight: number = 0;
  private keyboardHeight: number = 0;
  private isKeyboardOpen: boolean = false;
  private options: KeyboardOptions = DEFAULT_OPTIONS;
  private resizeObserver?: ResizeObserver;
  private activeElement: HTMLElement | null = null;
  private originalBodyStyle = {
    overflow: '',
    position: '',
    height: '',
    touchAction: '',
  };

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initialViewportHeight = window.innerHeight;
      this.currentViewportHeight = window.innerHeight;
      this.setupEventListeners();
    }
  }

  static getInstance(): MobileKeyboardManager {
    if (!MobileKeyboardManager.instance) {
      MobileKeyboardManager.instance = new MobileKeyboardManager();
    }
    return MobileKeyboardManager.instance;
  }

  configure(options: Partial<KeyboardOptions>): void {
    this.options = { ...this.options, ...options };
  }

  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    // Track viewport changes
    this.resizeObserver = new ResizeObserver(this.handleViewportChange);
    this.resizeObserver.observe(document.documentElement);

    // Alternative method for older browsers
    window.addEventListener('resize', this.handleViewportChange);

    // Track focus events to identify active form fields
    document.addEventListener('focusin', this.handleFocusIn);
    document.addEventListener('focusout', this.handleFocusOut);

    // Handle visual viewport changes (modern browsers)
    if ('visualViewport' in window) {
      window.visualViewport!.addEventListener(
        'resize',
        this.handleVisualViewportChange
      );
    }
  }

  private handleViewportChange = (): void => {
    const currentHeight = window.innerHeight;
    const heightDifference = this.initialViewportHeight - currentHeight;
    const threshold = 150; // Minimum height change to consider keyboard open

    if (heightDifference > threshold && !this.isKeyboardOpen) {
      // Keyboard opened
      this.keyboardHeight = heightDifference;
      this.isKeyboardOpen = true;
      this.currentViewportHeight = currentHeight;
      this.onKeyboardShow();
    } else if (heightDifference <= threshold && this.isKeyboardOpen) {
      // Keyboard closed
      this.keyboardHeight = 0;
      this.isKeyboardOpen = false;
      this.currentViewportHeight = currentHeight;
      this.onKeyboardHide();
    }
  };

  private handleVisualViewportChange = (): void => {
    if (!window.visualViewport) return;

    const visualHeight = window.visualViewport.height;
    const heightDifference = this.initialViewportHeight - visualHeight;
    const threshold = 150;

    if (heightDifference > threshold && !this.isKeyboardOpen) {
      this.keyboardHeight = heightDifference;
      this.isKeyboardOpen = true;
      this.onKeyboardShow();
    } else if (heightDifference <= threshold && this.isKeyboardOpen) {
      this.keyboardHeight = 0;
      this.isKeyboardOpen = false;
      this.onKeyboardHide();
    }
  };

  private handleFocusIn = (event: FocusEvent): void => {
    const target = event.target as HTMLElement;

    if (this.isFormField(target)) {
      this.activeElement = target;

      if (this.options.scrollActiveElementIntoView) {
        setTimeout(() => {
          this.scrollIntoView(target);
        }, 300); // Wait for keyboard animation
      }
    }
  };

  private handleFocusOut = (): void => {
    this.activeElement = null;
  };

  private isFormField(element: HTMLElement): boolean {
    const formFieldTags = ['INPUT', 'TEXTAREA', 'SELECT'];
    return (
      formFieldTags.includes(element.tagName) ||
      element.contentEditable === 'true'
    );
  }

  private scrollIntoView(element: HTMLElement): void {
    if (!element || !this.isKeyboardOpen) return;

    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const keyboardTop = viewportHeight - this.keyboardHeight;

    // Check if element is hidden behind keyboard
    if (rect.bottom > keyboardTop - 20) {
      // 20px buffer
      const scrollOffset = rect.bottom - keyboardTop + 40; // 40px buffer

      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      // Additional manual scroll if needed
      setTimeout(() => {
        window.scrollBy(0, -scrollOffset);
      }, 100);
    }
  }

  private onKeyboardShow(): void {
    if (this.options.adjustViewport) {
      this.adjustViewportForKeyboard();
    }

    if (this.options.preventBodyScroll) {
      this.preventBodyScroll();
    }

    // Add CSS class for keyboard-aware styling
    document.documentElement.classList.add('keyboard-open');
    document.documentElement.style.setProperty(
      '--keyboard-height',
      `${this.keyboardHeight}px`
    );

    this.options.onKeyboardShow?.(this.keyboardHeight);

    if (this.activeElement && this.options.scrollActiveElementIntoView) {
      setTimeout(() => {
        this.scrollIntoView(this.activeElement!);
      }, 100);
    }
  }

  private onKeyboardHide(): void {
    this.restoreViewport();
    this.restoreBodyScroll();

    // Remove CSS class
    document.documentElement.classList.remove('keyboard-open');
    document.documentElement.style.removeProperty('--keyboard-height');

    this.options.onKeyboardHide?.();
  }

  private adjustViewportForKeyboard(): void {
    if (typeof window === 'undefined') return;

    // Store original body styles
    const body = document.body;
    this.originalBodyStyle = {
      overflow: body.style.overflow,
      position: body.style.position,
      height: body.style.height,
      touchAction: body.style.touchAction,
    };

    // Adjust viewport
    body.style.height = `${this.currentViewportHeight}px`;
    body.style.overflow = 'hidden';
  }

  private preventBodyScroll(): void {
    const body = document.body;
    body.style.touchAction = 'pan-x pan-y';
    body.style.overflow = 'hidden';
  }

  private restoreViewport(): void {
    const body = document.body;
    body.style.height = this.originalBodyStyle.height;
    body.style.overflow = this.originalBodyStyle.overflow;
  }

  private restoreBodyScroll(): void {
    const body = document.body;
    body.style.touchAction = this.originalBodyStyle.touchAction;
    if (!this.options.preventBodyScroll) {
      body.style.overflow = this.originalBodyStyle.overflow;
    }
  }

  getViewportInfo(): ViewportInfo {
    return {
      height: this.currentViewportHeight,
      width: window.innerWidth,
      isKeyboardOpen: this.isKeyboardOpen,
      keyboardHeight: this.keyboardHeight,
    };
  }

  isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  isAndroid(): boolean {
    return /Android/.test(navigator.userAgent);
  }

  isMobile(): boolean {
    return this.isIOS() || this.isAndroid();
  }

  destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    window.removeEventListener('resize', this.handleViewportChange);
    document.removeEventListener('focusin', this.handleFocusIn);
    document.removeEventListener('focusout', this.handleFocusOut);

    if ('visualViewport' in window) {
      window.visualViewport!.removeEventListener(
        'resize',
        this.handleVisualViewportChange
      );
    }

    this.restoreViewport();
    this.restoreBodyScroll();
    document.documentElement.classList.remove('keyboard-open');
    document.documentElement.style.removeProperty('--keyboard-height');
  }
}

// React hook for mobile keyboard management
export function useMobileKeyboard(
  options?: Partial<KeyboardOptions>
): ViewportInfo {
  const [viewportInfo, setViewportInfo] = React.useState<ViewportInfo>({
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    width: typeof window !== 'undefined' ? window.innerWidth : 400,
    isKeyboardOpen: false,
    keyboardHeight: 0,
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const manager = MobileKeyboardManager.getInstance();

    manager.configure({
      ...options,
      onKeyboardShow: (height) => {
        setViewportInfo(manager.getViewportInfo());
        options?.onKeyboardShow?.(height);
      },
      onKeyboardHide: () => {
        setViewportInfo(manager.getViewportInfo());
        options?.onKeyboardHide?.();
      },
    });

    return () => {
      // Don't destroy on unmount as it's a singleton
      // manager.destroy();
    };
  }, [options]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const manager = MobileKeyboardManager.getInstance();
    setViewportInfo(manager.getViewportInfo());
  }, []);

  return viewportInfo;
}

export { MobileKeyboardManager };
