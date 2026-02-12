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
    risk_level: 'HIGH',
    max_similarity: 85,
    sbert_available: true,
    tier1_matches: [
      {
        id: 1,
        topic_title: 'Knowledge and practices of malaria prevention among mothers of children under five',
        supervisor_name: 'Dr. Jane Smith',
        session_year: '2023/2024',
        status: 'Approved',
        jaccard_score: 85,
        tfidf_score: 82,
        sbert_score: 80
      },
      {
        id: 2,
        topic_title: 'Malaria prevention knowledge among caregivers of under-five children',
        supervisor_name: 'Dr. John Doe',
        session_year: '2022/2023',
        status: 'Completed',
        jaccard_score: 78,
        tfidf_score: 75,
        sbert_score: 73
      },
      {
        id: 3,
        topic_title: 'Awareness of malaria prevention in children under five years',
        supervisor_name: 'Prof. Sarah Williams',
        session_year: '2023/2024',
        status: 'In Progress',
        jaccard_score: 72,
        tfidf_score: 70,
        sbert_score: 68
      },
      {
        id: 4,
        topic_title: 'Maternal knowledge on malaria prevention among under-five children',
        supervisor_name: 'Dr. Michael Brown',
        session_year: '2021/2022',
        status: 'Completed',
        jaccard_score: 70,
        tfidf_score: 68,
        sbert_score: 65
      },
      {
        id: 5,
        topic_title: 'Prevention strategies for malaria in children below five years',
        supervisor_name: 'Dr. Emily Davis',
        session_year: '2023/2024',
        status: 'Under Review',
        jaccard_score: 68,
        tfidf_score: 65,
        sbert_score: 62
      }
    ],
    tier2_matches: [
      {
        id: 6,
        topic_title: 'Malaria control measures in pediatric populations',
        supervisor_name: 'Dr. Robert Wilson',
        session_year: '2022/2023',
        status: 'Completed',
        jaccard_score: 55,
        tfidf_score: 52,
        sbert_score: 50
      }
    ],
    tier3_matches: []
  };

  const mockLowRiskResponse = {
    risk_level: 'LOW',
    max_similarity: 42,
    sbert_available: true,
    tier1_matches: [
      {
        id: 10,
        topic_title: 'Blockchain integration in healthcare information systems',
        supervisor_name: 'Dr. Alex Martinez',
        session_year: '2023/2024',
        status: 'Approved',
        jaccard_score: 42,
        tfidf_score: 38,
        sbert_score: 35
      },
      {
        id: 11,
        topic_title: 'Telemedicine platforms using distributed ledger technology',
        supervisor_name: 'Prof. Linda Garcia',
        session_year: '2022/2023',
        status: 'Completed',
        jaccard_score: 38,
        tfidf_score: 35,
        sbert_score: 32
      },
      {
        id: 12,
        topic_title: 'Digital health records management with blockchain',
        supervisor_name: 'Dr. David Thompson',
        session_year: '2023/2024',
        status: 'In Progress',
        jaccard_score: 35,
        tfidf_score: 32,
        sbert_score: 30
      },
      {
        id: 13,
        topic_title: 'Secure medical data exchange using cryptocurrency protocols',
        supervisor_name: 'Dr. Jennifer Moore',
        session_year: '2022/2023',
        status: 'Completed',
        jaccard_score: 30,
        tfidf_score: 28,
        sbert_score: 25
      },
      {
        id: 14,
        topic_title: 'Remote patient monitoring via decentralized networks',
        supervisor_name: 'Prof. Christopher Lee',
        session_year: '2021/2022',
        status: 'Completed',
        jaccard_score: 28,
        tfidf_score: 25,
        sbert_score: 22
      }
    ],
    tier2_matches: [],
    tier3_matches: []
  };

  // ==================== SCENARIO 1: DUPLICATE TOPIC DETECTION ====================

  describe('Scenario 1: Duplicate Topic Detection (HIGH Risk)', () => {
    it('completes full user flow for duplicate topic detection', async () => {
      // Mock API response with HIGH risk
      mock.onPost('/api/similarity/check').reply(200, mockHighRiskResponse);

      // 1. User lands on page
      render(<App />);

      expect(screen.getByTestId('app')).toBeInTheDocument();
      expect(screen.getByText('Topic Similarity Checker')).toBeInTheDocument();

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
      expect(screen.getByTestId('tier-section-tier 1: high similarity matches')).toBeInTheDocument();
      const tierSection = screen.getByTestId('tier-section-tier 1: high similarity matches');
      const tier1Matches = tierSection.querySelectorAll('[data-testid^="topic-match-"]');
      expect(tier1Matches.length).toBe(5);

      // 10. Top match has >70% similarity (check within tier 1 section)
      const jaccard0 = tierSection.querySelector('[data-testid="jaccard-badge-0"]');
      const tfidf0 = tierSection.querySelector('[data-testid="tfidf-badge-0"]');
      const sbert0 = tierSection.querySelector('[data-testid="sbert-badge-0"]');
      expect(jaccard0).toHaveTextContent('85%');
      expect(tfidf0).toHaveTextContent('82%');
      expect(sbert0).toHaveTextContent('80%');

      // 11. Recommendation: "Request topic modification"
      expect(screen.getByTestId('risk-recommendation')).toHaveTextContent('Request modification');
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
      const tier1Section = screen.getByTestId('tier-section-tier 1: high similarity matches');
      const topTitle = tier1Section.querySelector('[data-testid="topic-title-0"]');
      const topSupervisor = tier1Section.querySelector('[data-testid="supervisor-0"]');
      const topSession = tier1Section.querySelector('[data-testid="session-0"]');
      const topStatus = tier1Section.querySelector('[data-testid="status-0"]');

      expect(topTitle).toHaveTextContent('Knowledge and practices of malaria prevention among mothers of children under five');
      expect(topSupervisor).toHaveTextContent('Dr. Jane Smith');
      expect(topSession).toHaveTextContent('2023/2024');
      expect(topStatus).toHaveTextContent('Approved');

      // Verify Tier 2 matches shown
      expect(screen.getByTestId('tier-section-tier 2: medium similarity matches')).toBeInTheDocument();

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
      expect(screen.getByTestId('jaccard-badge-0')).toHaveTextContent('42%');

      // 6. Recommendation: "Proceed with approval"
      expect(screen.getByTestId('risk-recommendation')).toHaveTextContent('Proceed with approval');
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
        keywords: 'blockchain, healthcare, telemedicine'
      });
    });
  });
});
