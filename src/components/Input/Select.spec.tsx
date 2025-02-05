import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomSelect from './Select';

const mockOptions = ['USD', 'AED', 'BRL', 'BTC', 'XRP', 'EUR'];

describe('CustomSelect', () => {
  test('renders with selected value', () => {
    render(
      <CustomSelect
        options={mockOptions}
        selectedValue="USD"
        onChange={() => {}}
      />
    );
    
    expect(screen.getByTestId('select-button')).toBeInTheDocument();
    expect(screen.getByAltText('USD')).toBeInTheDocument();
  });

  test('opens dropdown when clicked', async () => {
    render(
      <CustomSelect
        options={mockOptions}
        selectedValue="USD"
        onChange={() => {}}
      />
    );
    const button = screen.getByTestId('select-button');
    fireEvent.click(button);
    
    expect(await screen.findByRole('listbox')).toBeInTheDocument();
  });

  test('selects new value', async () => {
    const mockOnChange = vi.fn();
    
    render(
      <CustomSelect
        options={mockOptions}
        selectedValue="EUR"
        onChange={mockOnChange}
      />
    );

    const button = screen.getByTestId('select-button');
    fireEvent.click(button);

    const eurOption = await screen.findByTestId('EUR-test')
    fireEvent.click(eurOption);
    
    expect(mockOnChange).toHaveBeenCalledWith('EUR');
  });
});