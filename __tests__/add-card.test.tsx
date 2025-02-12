import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddCardScreen from '../app/add-card';

// Mock the necessary dependencies
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('AddCardScreen', () => {
  // Test Card Holder Name Validation
  describe('Card Holder Name Validation', () => {
    it('should show error for empty card holder name', async () => {
      const { getByPlaceholderText, getByText } = render(<AddCardScreen />);
      const input = getByPlaceholderText('name name');
      const saveButton = getByText('Save Card');
      
      fireEvent.changeText(input, '');
      fireEvent.press(saveButton);
      
      await waitFor(() => {
        expect(getByText('Card holder name is required')).toBeTruthy();
      });
    });

    it('should show error for invalid characters in name', async () => {
      const { getByPlaceholderText, getByText } = render(<AddCardScreen />);
      const input = getByPlaceholderText('name name');
      const saveButton = getByText('Save Card');
      
      fireEvent.changeText(input, 'John123');
      fireEvent.press(saveButton);
      
      await waitFor(() => {
        expect(getByText('Invalid card holder name')).toBeTruthy();
      });
    });

    it('should accept valid card holder name', async () => {
      const { getByPlaceholderText, queryByText } = render(<AddCardScreen />);
      const input = getByPlaceholderText('name name');
      
      fireEvent.changeText(input, 'John Doe');
      
      expect(queryByText('Card holder name is required')).toBeNull();
      expect(queryByText('Invalid card holder name')).toBeNull();
    });
  });

  // Test Card Number Validation
  describe('Card Number Validation', () => {
    it('should validate Visa card number', async () => {
      const { getByPlaceholderText } = render(<AddCardScreen />);
      const input = getByPlaceholderText('123 ************');
      
      // Valid Visa test number
      fireEvent.changeText(input, '4532015112830366');
      
      expect(input.props.value).toBe('4532 0151 1283 0366');
    });

    it('should validate Mastercard number', async () => {
      const { getByPlaceholderText } = render(<AddCardScreen />);
      const input = getByPlaceholderText('123 ************');
      
      // Valid Mastercard test number
      fireEvent.changeText(input, '5555555555554444');
      
      expect(input.props.value).toBe('5555 5555 5555 4444');
    });

    it('should show error for invalid card number', async () => {
      const { getByPlaceholderText, getByText } = render(<AddCardScreen />);
      const input = getByPlaceholderText('123 ************');
      const saveButton = getByText('Save Card');
      
      fireEvent.changeText(input, '1234567890123456');
      fireEvent.press(saveButton);
      
      await waitFor(() => {
        expect(getByText('Invalid card number')).toBeTruthy();
      });
    });
  });

  // Test Expiry Date Validation
  describe('Expiry Date Validation', () => {
    it('should format expiry date correctly', () => {
      const { getByPlaceholderText } = render(<AddCardScreen />);
      const input = getByPlaceholderText('MM/YY');
      
      fireEvent.changeText(input, '1224');
      
      expect(input.props.value).toBe('12/24');
    });

    it('should show error for expired date', async () => {
      const { getByPlaceholderText, getByText } = render(<AddCardScreen />);
      const input = getByPlaceholderText('MM/YY');
      const saveButton = getByText('Save Card');
      
      // Set date to past
      fireEvent.changeText(input, '1220');
      fireEvent.press(saveButton);
      
      await waitFor(() => {
        expect(getByText('Card has expired')).toBeTruthy();
      });
    });

    it('should correct invalid month', () => {
      const { getByPlaceholderText } = render(<AddCardScreen />);
      const input = getByPlaceholderText('MM/YY');
      
      fireEvent.changeText(input, '1324');
      
      expect(input.props.value).toBe('12/24');
    });
  });

  // Test CVV Validation
  describe('CVV Validation', () => {
    it('should validate CVV length for Visa/Mastercard', async () => {
      const { getByPlaceholderText, getByText } = render(<AddCardScreen />);
      const input = getByPlaceholderText('***');
      const saveButton = getByText('Save Card');
      
      fireEvent.changeText(input, '12');
      fireEvent.press(saveButton);
      
      await waitFor(() => {
        expect(getByText('CVV must be 3 digits')).toBeTruthy();
      });
    });

    it('should accept valid CVV', () => {
      const { getByPlaceholderText, queryByText } = render(<AddCardScreen />);
      const input = getByPlaceholderText('***');
      
      fireEvent.changeText(input, '123');
      
      expect(queryByText('CVV must be 3 digits')).toBeNull();
    });
  });

  // Test Form Submission
  describe('Form Submission', () => {
    it('should handle successful form submission', async () => {
      const { getByPlaceholderText, getByText, queryByText } = render(<AddCardScreen />);
      
      // Fill in valid data
      fireEvent.changeText(getByPlaceholderText('name name'), 'John Doe');
      fireEvent.changeText(getByPlaceholderText('123 ************'), '4532015112830366');
      fireEvent.changeText(getByPlaceholderText('MM/YY'), '1224');
      fireEvent.changeText(getByPlaceholderText('***'), '123');
      
      const saveButton = getByText('Save Card');
      fireEvent.press(saveButton);
      
      // Verify no error messages are shown
      await waitFor(() => {
        expect(queryByText(/error/i)).toBeNull();
      });
    });

    it('should show all validation errors', async () => {
      const { getByText } = render(<AddCardScreen />);
      const saveButton = getByText('Save Card');
      
      fireEvent.press(saveButton);
      
      await waitFor(() => {
        expect(getByText('Card holder name is required')).toBeTruthy();
        expect(getByText('Card number is required')).toBeTruthy();
        expect(getByText('Invalid expiry date')).toBeTruthy();
        expect(getByText('CVV is required')).toBeTruthy();
      });
    });
  });

  // Test Security
  describe('Security', () => {
    it('should mask CVV input', () => {
      const { getByPlaceholderText } = render(<AddCardScreen />);
      const input = getByPlaceholderText('***');
      
      expect(input.props.secureTextEntry).toBe(true);
    });

    it('should only store last 4 digits of card number', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const { getByPlaceholderText, getByText } = render(<AddCardScreen />);
      
      // Fill in valid data
      fireEvent.changeText(getByPlaceholderText('name name'), 'John Doe');
      fireEvent.changeText(getByPlaceholderText('123 ************'), '4532015112830366');
      fireEvent.changeText(getByPlaceholderText('MM/YY'), '1224');
      fireEvent.changeText(getByPlaceholderText('***'), '123');
      
      const saveButton = getByText('Save Card');
      fireEvent.press(saveButton);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            cardNumber: '0366' // Only last 4 digits
          })
        );
      });
    });
  });
});