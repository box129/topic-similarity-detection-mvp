import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import App from '../../src/App';

describe('End-to-End User Flow Tests', () => {
  let mock;
  let user;

  beforeEach(() => {
    // Create axios mock adapter
    mock = new MockAdapter(axios);
    user = userEvent.setup();
  });

  afterEach(() => {
    // Restore axios
    mock.restore();
  });

  // ==================== MOCK DATA ====================

  const mockHighRiskResponse = {
    overallRisk: 'HIGH',
    overallMaxSimilarity: 85,
    algorithmStatus: { sbert: true },
    results: {
      tier1_historical: [
      {
        id: 1,
        title: 'Knowledge and practices of malaria prevention among mothers of children under five',
        supervisorName: 'Dr. Jane Smith',
        sessionYear: '2023/2024',
        scores: { jaccard: 85, tfidf: 82, sbert: 80, combined: 85 }
      },
      {
        id: 2,
        title: 'Malaria prevention knowledge among caregivers of under-five children',
        supervisorName: 'Dr. John Doe',
        sessionYear: '2022/2023',
        scores: { jaccard: 78, tfidf: 75, sbert: 73, combined: 78 }
      },
      {
        id: 3,
        title: 'Awareness of malaria prevention in children under five years',
        supervisorName: 'Prof. Sarah Williams',
        sessionYear: '2023/2024',
        scores: { jaccard: 72, tfidf: 70, sbert: 68, combined: 72 }
      },
      {
        id: 4,
        title: 'Maternal knowledge on malaria prevention among under-five children',
        supervisorName: 'Dr. Michael Brown',
        sessionYear: '2021/2022',
        scores: { jaccard: 70, tfidf: 68, sbert: 65, combined: 70 }
      },
      {
        id: 5,
        title: 'Prevention strategies for malaria in children below five years',
        supervisorName: 'Dr. Emily Davis',
        sessionYear: '2023/2024',
        scores: { jaccard: 68, tfidf: 65, sbert: 62, combined: 68 }
      }
    ],
      tier2_current_session: [
      {
        id: 6,
        title: 'Malaria control measures in pediatric populations',
        supervisorName: 'Dr. Robert Wilson',
        sessionYear: '2022/2023',
        scores: { jaccard: 55, tfidf: 52, sbert: 50, combined: 55 }
      }
    ],
      tier3_under_review: []
    }
  };

  const mockLowRiskResponse = {
    overallRisk: 'LOW',
    overallMaxSimilarity: 42,
    algorithmStatus: { sbert: true },
    results: {
      tier1_historical: [
      {
        id: 10,
        title: 'Blockchain integration in healthcare information systems',
        supervisorName: 'Dr. Alex Martinez',
        sessionYear: '2023/2024',
        scores: { jaccard: 42, tfidf: 38, sbert: 35, combined: 42 }
      },
      {
        id: 11,
        title: 'Telemedicine platforms using distributed ledger technology',
        supervisorName: 'Prof. Linda Garcia',
        sessionYear: '2022/2023',
        scores: { jaccard: 38, tfidf: 35, sbert: 32, combined: 38 }
      },
      {
        id: 12,
        title: 'Digital health records management with blockchain',
        supervisorName: 'Dr. David Thompson',
        sessionYear: '2023/2024',
        scores: { jaccard: 35, tfidf: 32, sbert: 30, combined: 35 }
      },
      {
        id: 13,
        title: 'Secure medical data exchange using cryptocurrency protocols',
        supervisorName: 'Dr. Jennifer Moore',
        sessionYear: '2022/2023',
        scores: { jaccard: 30, tfidf: 28, sbert: 25, combined: 30 }
      },
      {
        id: 14,
        title: 'Remote patient monitoring via decentralized networks',
        supervisorName: 'Prof. Christopher Lee',
        sessionYear: '2021/2022',
        scores: { jaccard: 28, tfidf: 25, sbert: 22, combined: 28 }
      }
    ],
      tier2_current_session: [],
      tier3_under_review: []
    }
  };

  // ==================== SCENARIO 1: DUPLICATE TOPIC DETECTION ====================

  describe('Scenario 1: Duplicate Topic Detection (HIGH Risk)', () => {
    it('completes full user flow for duplicate topic detection', async () => {
      // Mock API response with HIGH risk
      mock.onPost('/api/similarity/check').reply(200, mockHighRiskResponse);

      // 1. User lands on page
      render(<App />);

      expect(screen.getByTestId('app')).toBeInTheDocument();
      expect(screen.getByText('UNIOSUN Research Topic Similarity Detector')).toBeInTheDocument();

      // 2. User enters topic
      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      await user.type(textarea, 'Knowledge of malaria prevention among children under five');

      // 3. Word counter shows "8 / 7-24 words"
      await waitFor(() => {
        expect(screen.getByTestId('word-count')).toHaveTextContent('8 / 7-24 words');
      });

      // 4. Submit button is enabled
      const submitButton = screen.getByRole('button', { name: /check similarity/i });
      expect(submitButton).not.toBeDisabled();

      // 5. User clicks submit
      await user.click(submitButton);

      // 6. Loading spinner appears
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /checking similarity/i })).toBeInTheDocument();
      });

      // 7. Results display after ~1 second
      await waitFor(() => {
        expect(screen.getByTestId('results-container')).toBeInTheDocument();
      }, { timeout: 3000 });

      // 8. Risk banner shows "HIGH" (red)
      const riskBanner = screen.getByTestId('risk-banner');
      expect(riskBanner).toHaveAttribute('data-risk-level', 'HIGH');
      expect(riskBanner).toHaveClass('bg-red-50', 'border-red-500');
      expect(screen.getByTestId('risk-title')).toHaveTextContent('High Risk');

      // 9. Tier 1 shows 5 historical topics
      expect(screen.getByTestId('tier-section-tier1')).toBeInTheDocument();
      const tierSection = screen.getByTestId('tier-section-tier1');
      const tier1Matches = tierSection.querySelectorAll('[data-testid^="topic-match-"]');
      expect(tier1Matches.length).toBe(5);

      // 10. Top match has >70% similarity (check within tier 1 section)
      await user.click(tierSection.querySelector('[data-testid="expand-details-0"]'));
      const jaccard0 = tierSection.querySelector('[data-testid="jaccard-badge-0"]');
      const tfidf0 = tierSection.querySelector('[data-testid="tfidf-badge-0"]');
      const sbert0 = tierSection.querySelector('[data-testid="sbert-badge-0"]');
      expect(jaccard0).toHaveTextContent('85%');
      expect(tfidf0).toHaveTextContent('82%');
      expect(sbert0).toHaveTextContent('80%');

      // 11. Recommendation uses the current high-risk copy
      expect(screen.getByTestId('risk-recommendation')).toHaveTextContent('Significant overlap detected');
    });

    it('displays all expected details for duplicate detection', async () => {
      mock.onPost('/api/similarity/check').reply(200, mockHighRiskResponse);

      render(<App />);

      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      await user.type(textarea, 'Knowledge of malaria prevention among children under five');

      const submitButton = screen.getByRole('button', { name: /check similarity/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('results-container')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify top match details in Tier 1
      const tier1Section = screen.getByTestId('tier-section-tier1');
      const topTitle = tier1Section.querySelector('[data-testid="topic-title-0"]');
      const topSupervisor = tier1Section.querySelector('[data-testid="supervisor-0"]');
      const topSession = tier1Section.querySelector('[data-testid="session-0"]');

      expect(topTitle).toHaveTextContent('Knowledge and practices of malaria prevention among mothers of children under five');
      expect(topSupervisor).toHaveTextContent('Dr. Jane Smith');
      expect(topSession).toHaveTextContent('2023/2024');

      // Verify Tier 2 matches shown
      expect(screen.getByTestId('tier-section-tier2')).toBeInTheDocument();

      // Verify max similarity
      expect(screen.getByTestId('max-similarity')).toHaveTextContent('85%');

      // Verify total matches count (5 tier1 + 1 tier2 = 6)
      expect(screen.getByTestId('summary-total-matches')).toHaveTextContent('6');
    });
  });

  // ==================== SCENARIO 2: UNIQUE TOPIC ====================

  describe('Scenario 2: Unique Topic (LOW Risk)', () => {
    it('completes full user flow for unique topic', async () => {
      // Mock API response with LOW risk
      mock.onPost('/api/similarity/check').reply(200, mockLowRiskResponse);

      // 1. User enters topic
      render(<App />);

      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      await user.type(textarea, 'Blockchain applications in telemedicine systems');

      // 2. Word counter shows valid
      await waitFor(() => {
        expect(screen.getByTestId('word-count')).toHaveTextContent('5 / 7-24 words');
      });

      // Add more words to make it valid
      await user.type(textarea, ' for remote patient healthcare');

      await waitFor(() => {
        expect(screen.getByTestId('word-count')).toHaveTextContent('9 / 7-24 words');
      });

      // 3. User submits
      const submitButton = screen.getByRole('button', { name: /check similarity/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('results-container')).toBeInTheDocument();
      }, { timeout: 3000 });

      // 4. Results show "LOW" risk (green)
      const riskBanner = screen.getByTestId('risk-banner');
      expect(riskBanner).toHaveAttribute('data-risk-level', 'LOW');
      expect(riskBanner).toHaveClass('bg-green-50', 'border-green-500');
      expect(screen.getByTestId('risk-title')).toHaveTextContent('Low Risk');

      // 5. All similarities <50%
      expect(screen.getByTestId('max-similarity')).toHaveTextContent('42%');
      await user.click(screen.getByTestId('expand-details-0'));
      expect(screen.getByTestId('jaccard-badge-0')).toHaveTextContent('42%');

      // 6. Recommendation uses the current low-risk copy
      expect(screen.getByTestId('risk-recommendation')).toHaveTextContent('appears unique');
    });

    it('allows user to check another topic after viewing results', async () => {
      mock.onPost('/api/similarity/check').reply(200, mockLowRiskResponse);

      render(<App />);

      // Submit first topic
      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      await user.type(textarea, 'Blockchain applications in telemedicine systems for remote patient healthcare');

      const submitButton = screen.getByRole('button', { name: /check similarity/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('results-container')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Click "Check Another Topic" button
      const resetButton = screen.getByTestId('reset-button');
      await user.click(resetButton);

      // Results should be hidden
      expect(screen.queryByTestId('results-container')).not.toBeInTheDocument();

      // Form should be visible again
      expect(screen.getByPlaceholderText(/enter your research topic/i)).toBeInTheDocument();
    });
  });

  // ==================== ERROR HANDLING ====================

  describe('Error Handling', () => {
    it('handles network failure gracefully', async () => {
      // Mock network error
      mock.onPost('/api/similarity/check').networkError();

      render(<App />);

      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      await user.type(textarea, 'Machine learning algorithms for natural language processing');

      const submitButton = screen.getByRole('button', { name: /check similarity/i });
      await user.click(submitButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByTestId('error-display')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Error message should contain "Network Error"
      expect(screen.getByTestId('error-display')).toHaveTextContent(/network error/i);

      // Results should not be displayed
      expect(screen.queryByTestId('results-container')).not.toBeInTheDocument();
    });

    it('handles API error response', async () => {
      // Mock API error
      mock.onPost('/api/similarity/check').reply(500, {
        message: 'Internal server error'
      });

      render(<App />);

      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      await user.type(textarea, 'Machine learning algorithms for natural language processing');

      const submitButton = screen.getByRole('button', { name: /check similarity/i });
      await user.click(submitButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByTestId('error-display')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByTestId('error-display')).toHaveTextContent(/internal server error/i);
    });

    it('handles timeout gracefully', async () => {
      // Mock timeout
      mock.onPost('/api/similarity/check').timeout();

      render(<App />);

      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      await user.type(textarea, 'Machine learning algorithms for natural language processing');

      const submitButton = screen.getByRole('button', { name: /check similarity/i });
      await user.click(submitButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByTestId('error-display')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByTestId('error-display')).toHaveTextContent(/timeout/i);
    });
  });

  // ==================== LOADING STATES ====================

  describe('Loading States', () => {
    it('shows loading spinner during API call', async () => {
      // Mock delayed response
      mock.onPost('/api/similarity/check').reply(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve([200, mockLowRiskResponse]);
          }, 500);
        });
      });

      render(<App />);

      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      await user.type(textarea, 'Machine learning algorithms for natural language processing');

      const submitButton = screen.getByRole('button', { name: /check similarity/i });
      await user.click(submitButton);

      // Loading state should appear
      expect(screen.getByRole('button', { name: /checking similarity/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /checking similarity/i })).toBeDisabled();

      // Wait for results
      await waitFor(() => {
        expect(screen.getByTestId('results-container')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Loading should be gone
      expect(screen.queryByRole('button', { name: /checking similarity/i })).not.toBeInTheDocument();
    });

    it('disables form inputs during loading', async () => {
      mock.onPost('/api/similarity/check').reply(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve([200, mockLowRiskResponse]);
          }, 500);
        });
      });

      render(<App />);

      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      await user.type(textarea, 'Machine learning algorithms for natural language processing');

      const submitButton = screen.getByRole('button', { name: /check similarity/i });
      await user.click(submitButton);

      // Form should be disabled during loading
      await waitFor(() => {
        expect(textarea).toBeDisabled();
      });

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByTestId('results-container')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  // ==================== INTEGRATION TESTS ====================

  describe('Component Integration', () => {
    it('integrates TopicForm and ResultsDisplay correctly', async () => {
      mock.onPost('/api/similarity/check').reply(200, mockHighRiskResponse);

      render(<App />);

      // TopicForm should be rendered
      expect(screen.getByText('Check Topic Similarity')).toBeInTheDocument();

      // Enter and submit
      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      await user.type(textarea, 'Knowledge of malaria prevention among children under five');

      const submitButton = screen.getByRole('button', { name: /check similarity/i });
      await user.click(submitButton);

      // ResultsDisplay should be rendered
      await waitFor(() => {
        expect(screen.getByTestId('results-display')).toBeInTheDocument();
      }, { timeout: 3000 });

      // TopicForm should still be visible but in loading state
      expect(screen.getByText('Check Topic Similarity')).toBeInTheDocument();
    });

    it('passes correct data from form to results', async () => {
      // Capture the request data
      let requestData = null;
      mock.onPost('/api/similarity/check').reply((config) => {
        requestData = JSON.parse(config.data);
        return [200, mockLowRiskResponse];
      });

      render(<App />);

      const textarea = screen.getByPlaceholderText(/enter your research topic/i);
      const keywordsInput = screen.getByPlaceholderText(/e.g., machine learning/i);

      await user.type(textarea, 'Blockchain applications in telemedicine systems for remote healthcare');
      await user.type(keywordsInput, 'blockchain, healthcare, telemedicine');

      const submitButton = screen.getByRole('button', { name: /check similarity/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('results-container')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify request data
      expect(requestData).toEqual({
        topic: 'Blockchain applications in telemedicine systems for remote healthcare',
        keywords: 'blockchain, healthcare, telemedicine',
        category: ''
      });
    });
  });
});
