import { useState, useEffect, useRef } from 'react';
import type { SearchResult } from '../../../functions/_shared/types';
import styles from './SearchBox.module.css';

interface SearchBoxProps {
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBox({ placeholder = 'Search restaurants, takeaways...', autoFocus = false }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        setResults(data.results || []);
        setIsOpen(true);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'location') {
      window.location.href = `/area/${result.slug}`;
    } else {
      window.location.href = `/business/${result.slug}`;
    }
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.inputWrapper}>
        <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className={styles.input}
          autoFocus={autoFocus}
          autoComplete="off"
        />
        {isLoading && <span className={styles.spinner} />}
      </div>

      {isOpen && results.length > 0 && (
        <ul className={styles.dropdown}>
          {results.map((result, index) => (
            <li key={`${result.type}-${result.slug}-${index}`}>
              <button
                className={styles.result}
                onClick={() => handleResultClick(result)}
                type="button"
              >
                <span className={styles.resultIcon}>
                  {result.type === 'location' ? '📍' : '🍽️'}
                </span>
                <div className={styles.resultContent}>
                  <span className={styles.resultName}>{result.name}</span>
                  <span className={styles.resultSubtitle}>{result.subtitle}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className={styles.noResults}>
          No results found for "{query}"
        </div>
      )}
    </div>
  );
}
