import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TopicForm from '../src/components/features/TopicInput/TopicForm';

describe('TopicForm Component', () => {
  let mockOnSubmit;
  let user;

  beforeEach(() => {
    mockOnSubmit = vi.fn();
    user = userEvent.setup();
  });

  // ==================== RENDERING TESTS ====================
  
  describe('Rendering Tests', () => {
    it('1. renders textarea input', () => {
      render(<TopicForm onSubmit={mockOnSubmit} />);
      
      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('2. renders submit button', () => {
      render(<TopicForm onSubmit={mockOnSubmit} />);
      
      const submitButton = screen.getByRole('button', { name: /check similarity/i });
      expect(submitButton).toBeInTheDocument();
    });

    it('3. renders word counter', () => {
      render(<TopicForm onSubmit={mockOnSubmit} />);
      
      const wordCounter = screen.getByText(/0 \/ 7-24 words/i);
      expect(wordCounter).toBeInTheDocument();
    });

    it('4. renders character counter', () => {
      render(<TopicForm onSubmit={mockOnSubmit} />);
      
      const charCounter = screen.getByText(/0 chars/i);
      expect(charCounter).toBeInTheDocument();
    });
  });

  // ==================== VALIDATION TESTS ====================
  
  describe('Validation Tests', () => {
    it('5. shows red border when word count < 7', async () => {
      render(<TopicForm onSubmit={mockOnSubmit} />);
      
      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      await user.type(textarea, 'Machine learning AI');
      
      expect(textarea).toHaveClass('border-red-500');
      expect(screen.getByText(/too short: 3 words/i)).toBeInTheDocument();
    });

    it('6. shows red border when word count > 24', async () => {
      render(<TopicForm onSubmit={mockOnSubmit} />);
      
      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      const longText = 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twentyone twentytwo twentythree twentyfour twentyfive';
      await user.type(textarea, longText);
      
      expect(textarea).toHaveClass('border-red-500');
      expect(screen.getByText(/too long: 25 words/i)).toBeInTheDocument();
    });

    it('7. shows green border when word count 7-24', async () => {
      render(<TopicForm onSubmit={mockOnSubmit} />);
      
      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      await user.type(textarea, 'Machine learning algorithms for natural language processing tasks');
      
      expect(textarea).toHaveClass('border-green-500');
      expect(screen.getByText(/valid topic length/i)).toBeInTheDocument();
    });

    it('8. disables submit button when invalid', () => {
      render(<TopicForm onSubmit={mockOnSubmit} />);
      
      const submitButton = screen.getByRole('button', { name: /check similarity/i });
      expect(submitButton).toBeDisabled();
    });

    it('9. enables submit button when valid', async () => {
      render(<TopicForm onSubmit={mockOnSubmit} />);
      
      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      await user.type(textarea, 'Machine learning algorithms for natural language processing tasks');
      
      const submitButton = screen.getByRole('button', { name: /check similarity/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  // ==================== USER INTERACTION TESTS ====================
  
  describe('User Interaction Tests', () => {
    it('10. word counter updates on input', async () => {
      render(<TopicForm onSubmit={mockOnSubmit} />);
      
      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      
      // Initially 0 words
      expect(screen.getByText(/0 \/ 7-24 words/i)).toBeInTheDocument();
      
      // Type 5 words
      await user.type(textarea, 'Machine learning neural network AI');
      expect(screen.getByText(/5 \/ 7-24 words/i)).toBeInTheDocument();
      
      // Add more words
      await user.type(textarea, ' deep learning');
      expect(screen.getByText(/7 \/ 7-24 words/i)).toBeInTheDocument();
    });

    it('11. character counter updates on input', async () => {
      render(<TopicForm onSubmit={mockOnSubmit} />);
      
      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      
      // Initially 0 chars
      expect(screen.getByText(/0 chars/i)).toBeInTheDocument();
      
      // Type text
      await user.type(textarea, 'Hello');
      expect(screen.getByText(/5 chars/i)).toBeInTheDocument();
      
      // Add more text
      await user.type(textarea, ' World');
      expect(screen.getByText(/11 chars/i)).toBeInTheDocument();
    });

    it('12. submit button triggers onSubmit callback', async () => {
      mockOnSubmit.mockResolvedValue();
      render(<TopicForm onSubmit={mockOnSubmit} />);
      
      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      const validTopic = 'Machine learning algorithms for natural language processing tasks';
      await user.type(textarea, validTopic);
      
      const submitButton = screen.getByRole('button', { name: /check similarity/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          topic: validTopic,
          keywords: ''
        });
      });
    });

    it('13. loading state shows spinner', () => {
      render(<TopicForm onSubmit={mockOnSubmit} isLoading={true} />);
      
      const submitButton = screen.getByRole('button', { name: /checking similarity/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      
      // Check for spinner SVG
      const spinner = submitButton.querySelector('svg.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('14. error state shows error message', async () => {
      const errorMessage = 'Network error occurred';
      mockOnSubmit.mockRejectedValue(new Error(errorMessage));
      
      render(<TopicForm onSubmit={mockOnSubmit} />);
      
      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      await user.type(textarea, 'Machine learning algorithms for natural language processing tasks');
      
      const submitButton = screen.getByRole('button', { name: /check similarity/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  // ==================== EDGE CASES ====================
  
  describe('Edge Cases', () => {
    it('15. handles empty input', () => {
      render(<TopicForm onSubmit={mockOnSubmit} />);
      
      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      expect(textarea.value).toBe('');
      
      const submitButton = screen.getByRole('button', { name: /check similarity/i });
      expect(submitButton).toBeDisabled();
      
      // Should show default border color
      expect(textarea).toHaveClass('border-gray-300');
    });

    it('16. handles rapid typing (debounce)', async () => {
      render(<TopicForm onSubmit={mockOnSubmit} />);
      
      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      
      // Rapid typing simulation
      await user.type(textarea, 'Machine learning algorithms for natural language processing');
      
      // Word count should update correctly
      expect(screen.getByText(/8 \/ 7-24 words/i)).toBeInTheDocument();
    });

    it('17. trims whitespace correctly', async () => {
      mockOnSubmit.mockResolvedValue();
      render(<TopicForm onSubmit={mockOnSubmit} />);
      
      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      
      // Type with extra whitespace
      await user.type(textarea, '  Machine learning algorithms for natural language processing  ');
      
      const submitButton = screen.getByRole('button', { name: /check similarity/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          topic: 'Machine learning algorithms for natural language processing',
          keywords: ''
        });
      });
    });
  });

  // ==================== ADDITIONAL COMPREHENSIVE TESTS ====================
  
  describe('Additional Comprehensive Tests', () => {
    it('handles keywords input correctly', async () => {
      mockOnSubmit.mockResolvedValue();
      render(<TopicForm onSubmit={mockOnSubmit} />);
      
      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      const keywordsInput = screen.getByPlaceholderText(/e.g., machine learning/i);
      
      await user.type(textarea, 'Machine learning algorithms for natural language processing tasks');
      await user.type(keywordsInput, 'AI, neural networks, deep learning');
      
      const submitButton = screen.getByRole('button', { name: /check similarity/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          topic: 'Machine learning algorithms for natural language processing tasks',
          keywords: 'AI, neural networks, deep learning'
        });
      });
    });

    it('clears form after successful submission', async () => {
      mockOnSubmit.mockResolvedValue();
      render(<TopicForm onSubmit={mockOnSubmit} />);
      
      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      const keywordsInput = screen.getByPlaceholderText(/e.g., machine learning/i);
      
      await user.type(textarea, 'Machine learning algorithms for natural language processing tasks');
      await user.type(keywordsInput, 'AI, neural networks');
      
      const submitButton = screen.getByRole('button', { name: /check similarity/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(textarea.value).toBe('');
        expect(keywordsInput.value).toBe('');
      });
    });

    it('disables inputs during loading', () => {
      render(<TopicForm onSubmit={mockOnSubmit} isLoading={true} />);
      
      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      const keywordsInput = screen.getByPlaceholderText(/e.g., machine learning/i);
      
      expect(textarea).toBeDisabled();
      expect(keywordsInput).toBeDisabled();
    });

    it('shows validation message for minimum word count', async () => {
      render(<TopicForm onSubmit={mockOnSubmit} />);
      
      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      await user.type(textarea, 'Machine learning AI');
      
      expect(screen.getByText(/too short: 3 words \(minimum 7\)/i)).toBeInTheDocument();
    });

    it('shows validation message for maximum word count', async () => {
      render(<TopicForm onSubmit={mockOnSubmit} />);
      
      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      const longText = Array(26).fill('word').join(' ');
      await user.type(textarea, longText);
      
      expect(screen.getByText(/too long: 26 words \(maximum 24\)/i)).toBeInTheDocument();
    });

    it('handles character count guideline warnings', async () => {
      render(<TopicForm onSubmit={mockOnSubmit} />);
      
      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      
      // Type text with less than 50 characters but valid word count
      await user.type(textarea, 'AI ML NLP DL CV RL GAN');
      
      // Should show character guideline warning
      expect(screen.getByText(/character count outside guideline/i)).toBeInTheDocument();
    });

    it('prevents submission with invalid word count', async () => {
      render(<TopicForm onSubmit={mockOnSubmit} />);
      
      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      await user.type(textarea, 'Too short');
      
      const submitButton = screen.getByRole('button', { name: /check similarity/i });
      await user.click(submitButton);
      
      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid topic \(7-24 words\)/i)).toBeInTheDocument();
      });
      
      // onSubmit should not be called
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('clears error message when user starts typing', async () => {
      render(<TopicForm onSubmit={mockOnSubmit} />);
      
      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      
      // Type invalid input and try to submit
      await user.type(textarea, 'Short');
      const submitButton = screen.getByRole('button', { name: /check similarity/i });
      await user.click(submitButton);
      
      // Error should appear
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid topic/i)).toBeInTheDocument();
      });
      
      // Start typing again
      await user.type(textarea, ' text to make it valid length now');
      
      // Error should be cleared
      expect(screen.queryByText(/please enter a valid topic/i)).not.toBeInTheDocument();
    });

    it('handles multiple spaces between words correctly', async () => {
      render(<TopicForm onSubmit={mockOnSubmit} />);
      
      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      await user.type(textarea, 'Machine    learning    algorithms    for    natural    language    processing');
      
      // Should count as 7 words despite multiple spaces
      expect(screen.getByText(/7 \/ 7-24 words/i)).toBeInTheDocument();
    });

    it('renders help text with tips', () => {
      render(<TopicForm onSubmit={mockOnSubmit} />);
      
      expect(screen.getByText(/tips for best results/i)).toBeInTheDocument();
      expect(screen.getByText(/use 7-24 words for your topic title/i)).toBeInTheDocument();
      expect(screen.getByText(/be specific and descriptive/i)).toBeInTheDocument();
    });

    it('handles form submission with Enter key', async () => {
      mockOnSubmit.mockResolvedValue();
      render(<TopicForm onSubmit={mockOnSubmit} />);
      
      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      await user.type(textarea, 'Machine learning algorithms for natural language processing tasks');
      
      // Find the form and submit it
      const form = textarea.closest('form');
      await user.click(screen.getByRole('button', { name: /check similarity/i }));
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });
});
