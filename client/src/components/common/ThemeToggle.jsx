import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Laptop, Check, ChevronDown, Sparkles } from 'lucide-react';

export function ThemeToggle({ variant = 'icon', className = '' }) {
  const { theme, setTheme, toggleTheme, isDark } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    toggleTheme();
  };

  // 3-way Pill toggle
  if (variant === 'pill') {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300/60 dark:border-slate-700/60 shadow-inner ${className}`}
      >
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            theme === 'light'
              ? 'bg-white text-amber-600 shadow-md scale-100'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Light theme"
        >
          <Sun className="w-3.5 h-3.5 fill-amber-500/20" />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            theme === 'dark'
              ? 'bg-slate-900 text-blue-400 shadow-md scale-100 ring-1 ring-blue-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Dark theme"
        >
          <Moon className="w-3.5 h-3.5 fill-blue-500/20" />
          <span>Dark</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('system')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            theme === 'system'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md scale-100'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Match system default"
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Auto</span>
        </button>
      </div>
    );
  }

  // Interactive Dropdown Menu Variant (Used in Navbar)
  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`} ref={ref}>
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/60 shadow-sm transition-all duration-150"
          aria-label="Theme selector"
          aria-expanded={dropdownOpen}
        >
          <div className="w-4 h-4 flex items-center justify-center">
            {isDark ? (
              <Moon className="w-4 h-4 text-blue-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
          </div>
          <span className="hidden sm:inline capitalize">
            {theme === 'system' ? 'System' : isDark ? 'Dark' : 'Light'}
          </span>
          <ChevronDown className="w-3 h-3 text-slate-400 transition-transform duration-200" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/80 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Appearance
            </div>

            <button
              type="button"
              onClick={() => {
                setTheme('light');
                setDropdownOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-left transition-colors ${
                theme === 'light'
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light Mode</span>
              </div>
              {theme === 'light' && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setTheme('dark');
                setDropdownOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-left transition-colors ${
                theme === 'dark'
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Moon className="w-4 h-4 text-blue-400" />
                <span>Dark Mode</span>
              </div>
              {theme === 'dark' && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setTheme('system');
                setDropdownOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-left transition-colors ${
                theme === 'system'
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Laptop className="w-4 h-4 text-indigo-500" />
                <span>System Auto</span>
              </div>
              {theme === 'system' && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Default 1-Click Toggle icon button
  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all duration-200 border border-slate-200/80 dark:border-slate-700/60 shadow-sm cursor-pointer select-none group ${className}`}
      aria-label="Toggle light/dark theme"
      title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Moon className="w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform duration-200 fill-blue-400/20" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 group-hover:rotate-45 transition-transform duration-200 fill-amber-500/20" />
        )}
      </div>
    </button>
  );
}

/**
 * FloatingThemeSwitcher
 * A Flutter / Material 3 inspired floating pill with smooth animations
 * providing 1-click theme switching + options menu from anywhere in the app!
 */
export function FloatingThemeSwitcher() {
  const { theme, setTheme, toggleTheme, isDark } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-5 right-5 z-50 flex flex-col items-end print:hidden select-none"
    >
      {/* Expanded Choices Popover */}
      {menuOpen && (
        <div className="mb-2 p-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-2xl flex flex-col gap-1 w-36 animate-in slide-in-from-bottom-2 duration-150 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setTheme('light');
              setMenuOpen(false);
            }}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-left transition-colors ${
              theme === 'light'
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Light</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme('dark');
              setMenuOpen(false);
            }}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-left transition-colors ${
              theme === 'dark'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Moon className="w-4 h-4 text-blue-400" />
            <span>Dark</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme('system');
              setMenuOpen(false);
            }}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-left transition-colors ${
              theme === 'system'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Laptop className="w-4 h-4 text-indigo-500" />
            <span>Auto</span>
          </button>
        </div>
      )}

      {/* Floating Pill Button */}
      <div className="flex items-center rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-700/80 shadow-2xl p-1 pl-3.5 pr-1.5 transition-all duration-200 hover:shadow-blue-500/10 hover:border-blue-400/50 group">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center space-x-2 text-xs font-extrabold text-slate-800 dark:text-slate-100 pr-1 cursor-pointer"
          title={`Currently ${isDark ? 'Dark Mode' : 'Light Mode'} — Click to toggle`}
        >
          <div className="w-5 h-5 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            {isDark ? (
              <Moon className="w-4 h-4 text-blue-400 fill-blue-400/20" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            )}
          </div>
          <span className="text-[11px] font-bold tracking-tight">
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="More theme options"
          aria-label="Theme options"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
}
