import { useState, useEffect, useRef } from 'react';
import styles from './styles.module.scss';

export interface SelectOption {
  value: string;
  label: string;
  imageUrl: string;
}

interface CustomSelectProps {
  options: string[];
  selectedValue: string;
  onChange: (value: string) => void;
}

const CustomSelect = ({ options, selectedValue, onChange }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option === selectedValue);

  function getImageUrl(name) {
    // note that this does not include files in subdirectories
    return new URL(`../../assets/currencies/${name}.png`, import.meta.url).href
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.selectWrapper} ref={wrapperRef}>
      <button
        type="button"
        className={styles.selectButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {selectedOption && (
          <>
            <img
              src={getImageUrl(selectedOption)}
              alt={selectedOption}
              className={styles.flagImage}
            />
            <span className={styles.currencyCode}>{selectedOption}</span>
          </>
        )}
        <span className={`${styles.arrow} ${isOpen ? styles.open : ''}`}></span>
      </button>

      {isOpen && (
        <ul className={styles.optionsList} role="listbox">
          {options.map((option) => (
            <li
              key={option}
              role="option"
              aria-selected={option === selectedValue}
              className={styles.optionItem}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              <img
                src={getImageUrl(option)}
                alt={option}
                className={styles.flagImage}
              />
              <div className={styles.currencyInfo}>
                <span className={styles.currencyCode}>{option}</span>
                <span className={styles.currencyName}>{option}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;