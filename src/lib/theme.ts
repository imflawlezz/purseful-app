export type Theme = 'light' | 'dark' | 'system';

export const theme = {
  getTheme(): Theme {
    if (typeof window === 'undefined') return 'system';
    const stored = localStorage.getItem('theme') as Theme;
    return stored || 'system';
  },

  setTheme(newTheme: Theme): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('theme', newTheme);
    this.applyTheme(newTheme);
  },

  getEffectiveTheme(): 'light' | 'dark' {
    const theme = this.getTheme();
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  },

  applyTheme(theme: Theme): void {
    if (typeof window === 'undefined') return;
    
    const effectiveTheme = theme === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(effectiveTheme);
  },

  init(): void {
    if (typeof window === 'undefined') return;
    this.applyTheme(this.getTheme());
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.getTheme() === 'system') {
        this.applyTheme('system');
      }
    });
  },
};

