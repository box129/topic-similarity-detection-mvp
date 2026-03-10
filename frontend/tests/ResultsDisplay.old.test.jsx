import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResultsDisplay from '../src/components/features/Results/ResultsDisplay';

describe('ResultsDisplay Component', () => {
  // ==================== MOCK DATA ====================

  const mockLowRiskData = {
    risk_level: 'LOW',
    max_similarity: 45,
    sbert_available: true,
    tier1_matches: [
      {
        id: 1,
        topic_title: 'Machine Learning in Healthcare',
        supervisor_name: 'Dr. Smith',
        session_year: '2023/2024',
        status: 'Approved',
        jaccard_score: 45,
        tfidf_score: 42,
        sbert_score: 40
      },
      {
        id: 2,
        topic_title: 'Deep Learning for Medical Diagnosis',
        supervisor_name: 'Dr. Johnson',
        session_year: '2022/2023',
        status: 'Completed',
        jaccard_score: 38,
        tfidf_score: 35,
        sbert_score: 33
      },
      {
        id: 3,
        topic_title: 'AI in Clinical Decision Support',
        supervisor_name: 'Dr. Williams',
        session_year: '2023/2024',
        status: 'In Progress',
        jaccard_score: 30,
        tfidf_score: 28,
        sbert_score: 25
      },
      {
        id: 4,
        topic_title: 'Neural Networks for Patient Care',
        supervisor_name: 'Dr. Brown',
        session_year: '2021/2022',
        status: 'Completed',
        jaccard_score: 25,
        tfidf_score: 22,
        sbert_score: 20
      },
      {
        id: 5,
        topic_title: 'Predictive Analytics in Medicine',
        supervisor_name: 'Dr. Davis',
        session_year: '2023/2024',
        status: 'Approved',
        jaccard_score: 20,
        tfidf_score: 18,
        sbert_score: 15
      }
    ],
    tier2_matches: [],
    tier3_matches: []
  };

  const mockMediumRiskData = {
    risk_level: 'MEDIUM',
    max_similarity: 62,
    sbert_available: true,
    tier1_matches: [
      {
        id: 1,
        topic_title: 'Blockchain Technology in Finance',
        supervisor_name: 'Prof. Anderson',
        session_year: '2023/2024',
        status: 'Under Review',
        jaccard_score: 62,
        tfidf_score: 60,
        sbert_score: 58
      },
      {
        id: 2,
        topic_title: 'Cryptocurrency Security Systems',
        supervisor_name: 'Dr. Martinez',
        session_year: '2023/2024',
        status: 'Approved',
        jaccard_score: 55,
        tfidf_score: 52,
        sbert_score: 50
      }
    ],
    tier2_matches: [
      {
        id: 3,
        topic_title: 'Distributed Ledger Technologies',
        supervisor_name: 'Dr. Wilson',
        session_year: '2022/2023',
        status: 'Completed',
        jaccard_score: 48,
        tfidf_score: 45,
        sbert_score: 42
      }
    ],
    tier3_matches: []
  };

  const mockHighRiskData = {
    risk_level: 'HIGH',
    max_similarity: 85,
    sbert_available: true,
    tier1_matches: [
      {
        id: 1,
        topic_title: 'Quantum Computing Algorithms',
        supervisor_name: 'Prof. Taylor',
        session_year: '2024/2025',
        status: 'In Progress',
        jaccard_score: 85,
        tfidf_score: 82,
        sbert_score: 80
      }
    ],
    tier2_matches: [
      {
        id: 2,
        topic_title: 'Quantum Algorithm Optimization',
        supervisor_name: 'Dr. Thompson',
        session_year: '2023/2024',
        status: 'Completed',
        jaccard_score: 75,
        tfidf_score: 72,
        sbert_score: 70
      }
    ],
    tier3_matches: [
      {
        id: 3,
        topic_title: 'Quantum Information Processing',
        supervisor_name: 'Prof. Moore',
        session_year: '2022/2023',
        status: 'Completed',
        jaccard_score: 65,
        tfidf_score: 60,
        sbert_score: 58
      }
    ]
  };

  const mockSbertUnavailableData = {
    risk_level: 'MEDIUM',
    max_similarity: 55,
    sbert_available: false,
    tier1_matches: [
      {
        id: 1,
        topic_title: 'Natural Language Processing',
        supervisor_name: 'Dr. White',
        session_year: '2023/2024',
        status: 'Approved',
        jaccard_score: 55,
        tfidf_score: 52,
        sbert_score: null
      }
    ],
    tier2_matches: [],
    tier3_matches: []
  };

  const mockNoMatchesData = {
    risk_level: 'LOW',
    max_similarity: 0,
    sbert_available: true,
    tier1_matches: [],
    tier2_matches: [],
    tier3_matches: []
  };

  // ==================== RENDERING TESTS ====================

  describe('Rendering Tests', () => {
    it('1. renders the component', () => {
      render(<ResultsDisplay results={mockLowRiskData} />);

      expect(screen.getByTestId('results-display')).toBeInTheDocument();
    });

    it('2. renders risk banner with LOW risk (green)', () => {
      render(<ResultsDisplay results={mockLowRiskData} />);

      const banner = screen.getByTestId('risk-banner');
      expect(banner).toBeInTheDocument();
      expect(banner).toHaveAttribute('data-risk-level', 'LOW');
      expect(banner).toHaveClass('bg-green-50', 'border-green-500');
      expect(screen.getByTestId('risk-title')).toHaveTextContent('Low Risk');
    });

    it('3. renders risk banner with MEDIUM risk (yellow)', () => {
      render(<ResultsDisplay results={mockMediumRiskData} />);

      const banner = screen.getByTestId('risk-banner');
      expect(banner).toBeInTheDocument();
      expect(banner).toHaveAttribute('data-risk-level', 'MEDIUM');
      expect(banner).toHaveClass('bg-yellow-50', 'border-yellow-500');
      expect(screen.getByTestId('risk-title')).toHaveTextContent('Medium Risk');
    });

    it('4. renders risk banner with HIGH risk (red)', () => {
      render(<ResultsDisplay results={mockHighRiskData} />);

      const banner = screen.getByTestId('risk-banner');
      expect(banner).toBeInTheDocument();
      expect(banner).toHaveAttribute('data-risk-level', 'HIGH');
      expect(banner).toHaveClass('bg-red-50', 'border-red-500');
      expect(screen.getByTestId('risk-title')).toHaveTextContent('High Risk');
    });

    it('5. renders Tier 1 results', () => {
      render(<ResultsDisplay results={mockLowRiskData} />);

      expect(screen.getByTestId('tier-section-tier1')).toBeInTheDocument();
      expect(screen.getByTestId('tier-title-tier1')).toHaveTextContent('Similar Past Projects');
    });

    it('6. renders Tier 2 results when present', () => {
      render(<ResultsDisplay results={mockMediumRiskData} />);

      expect(screen.getByTestId('tier-section-tier 2: medium similarity matches')).toBeInTheDocument();
      expect(screen.getByTestId('tier-title-tier 2: medium similarity matches')).toHaveTextContent('Tier 2: Medium Similarity Matches');
    });

    it('7. renders Tier 3 results when present', () => {
      render(<ResultsDisplay results={mockHighRiskData} />);

      expect(screen.getByTestId('tier-section-tier 3: lower similarity matches')).toBeInTheDocument();
      expect(screen.getByTestId('tier-title-tier 3: lower similarity matches')).toHaveTextContent('Tier 3: Lower Similarity Matches');
    });

    it('8. shows algorithm badges (Jaccard, TF-IDF, SBERT)', () => {
      render(<ResultsDisplay results={mockLowRiskData} />);

      expect(screen.getByTestId('jaccard-badge-0')).toBeInTheDocument();
      expect(screen.getByTestId('jaccard-badge-0')).toHaveTextContent('Jaccard: 45%');

      expect(screen.getByTestId('tfidf-badge-0')).toBeInTheDocument();
      expect(screen.getByTestId('tfidf-badge-0')).toHaveTextContent('TF-IDF: 42%');

      expect(screen.getByTestId('sbert-badge-0')).toBeInTheDocument();
      expect(screen.getByTestId('sbert-badge-0')).toHaveTextContent('SBERT: 40%');
    });
  });

  // ==================== DATA DISPLAY TESTS ====================

  describe('Data Display Tests', () => {
    it('9. displays similarity scores as percentages', () => {
      render(<ResultsDisplay results={mockLowRiskData} />);

      expect(screen.getByTestId('max-similarity')).toHaveTextContent('45%');
      expect(screen.getByTestId('summary-max-similarity')).toHaveTextContent('45%');
    });

    it('10. displays topic titles correctly', () => {
      render(<ResultsDisplay results={mockLowRiskData} />);

      expect(screen.getByTestId('topic-title-0')).toHaveTextContent('Machine Learning in Healthcare');
      expect(screen.getByTestId('topic-title-1')).toHaveTextContent('Deep Learning for Medical Diagnosis');
    });

    it('11. displays supervisor names', () => {
      render(<ResultsDisplay results={mockLowRiskData} />);

      expect(screen.getByTestId('supervisor-0')).toHaveTextContent('Supervisor: Dr. Smith');
      expect(screen.getByTestId('supervisor-1')).toHaveTextContent('Supervisor: Dr. Johnson');
    });

    it('12. displays session years/status', () => {
      render(<ResultsDisplay results={mockLowRiskData} />);

      expect(screen.getByTestId('session-0')).toHaveTextContent('Session: 2023/2024');
      expect(screen.getByTestId('status-0')).toHaveTextContent('Status: Approved');
    });

    it('13. displays total matches count', () => {
      render(<ResultsDisplay results={mockHighRiskData} />);

      // 1 tier1 + 1 tier2 + 1 tier3 = 3 total
      expect(screen.getByTestId('summary-total-matches')).toHaveTextContent('3');
    });

    it('14. displays risk level in summary', () => {
      render(<ResultsDisplay results={mockMediumRiskData} />);

      expect(screen.getByTestId('summary-risk')).toHaveTextContent('MEDIUM');
    });
  });

  // ==================== CONDITIONAL RENDERING TESTS ====================

  describe('Conditional Rendering Tests', () => {
    it('15. shows SBERT warning when unavailable', () => {
      render(<ResultsDisplay results={mockSbertUnavailableData} />);

      const warning = screen.getByTestId('sbert-warning');
      expect(warning).toBeInTheDocument();
      expect(warning).toHaveTextContent('SBERT Unavailable');
      expect(warning).toHaveTextContent('Advanced semantic similarity scores are not available');
    });

    it('16. hides SBERT warning when available', () => {
      render(<ResultsDisplay results={mockLowRiskData} />);

      expect(screen.queryByTestId('sbert-warning')).not.toBeInTheDocument();
    });

    it('17. hides empty Tier 2 section', () => {
      render(<ResultsDisplay results={mockLowRiskData} />);

      expect(screen.queryByTestId('tier-section-tier 2: medium similarity matches')).not.toBeInTheDocument();
    });

    it('18. hides empty Tier 3 section', () => {
      render(<ResultsDisplay results={mockLowRiskData} />);

      expect(screen.queryByTestId('tier-section-tier 3: lower similarity matches')).not.toBeInTheDocument();
    });

    it('19. shows recommendation text', () => {
      render(<ResultsDisplay results={mockLowRiskData} />);

      expect(screen.getByTestId('risk-recommendation')).toHaveTextContent('Proceed with approval - No significant overlap detected');
    });

    it('20. shows no matches message when no results', () => {
      render(<ResultsDisplay results={mockNoMatchesData} />);

      expect(screen.getByTestId('no-matches')).toBeInTheDocument();
      expect(screen.getByTestId('no-matches')).toHaveTextContent('No similar topics found.');
    });

    it('21. hides SBERT badge when score is null', () => {
      render(<ResultsDisplay results={mockSbertUnavailableData} />);

      expect(screen.queryByTestId('sbert-badge-0')).not.toBeInTheDocument();
      expect(screen.getByTestId('jaccard-badge-0')).toBeInTheDocument();
      expect(screen.getByTestId('tfidf-badge-0')).toBeInTheDocument();
    });
  });

  // ==================== RISK LEVEL TESTS ====================

  describe('Risk Level Tests', () => {
    it('22. LOW risk: green banner, "Proceed with approval"', () => {
      render(<ResultsDisplay results={mockLowRiskData} />);

      const banner = screen.getByTestId('risk-banner');
      expect(banner).toHaveClass('bg-green-50', 'border-green-500');
      expect(screen.getByTestId('risk-title')).toHaveTextContent('Low Risk');
      expect(screen.getByTestId('risk-recommendation')).toHaveTextContent('Proceed with approval');
    });

    it('23. MEDIUM risk: yellow banner, "Review flagged topics"', () => {
      render(<ResultsDisplay results={mockMediumRiskData} />);

      const banner = screen.getByTestId('risk-banner');
      expect(banner).toHaveClass('bg-yellow-50', 'border-yellow-500');
      expect(screen.getByTestId('risk-title')).toHaveTextContent('Medium Risk');
      expect(screen.getByTestId('risk-recommendation')).toHaveTextContent('Review flagged topics');
    });

    it('24. HIGH risk: red banner, "Request modification"', () => {
      render(<ResultsDisplay results={mockHighRiskData} />);

      const banner = screen.getByTestId('risk-banner');
      expect(banner).toHaveClass('bg-red-50', 'border-red-500');
      expect(screen.getByTestId('risk-title')).toHaveTextContent('High Risk');
      expect(screen.getByTestId('risk-recommendation')).toHaveTextContent('Request modification');
    });

    it('25. displays correct risk icon for each level', () => {
      const { rerender } = render(<ResultsDisplay results={mockLowRiskData} />);
      expect(screen.getByTestId('risk-icon')).toBeInTheDocument();

      rerender(<ResultsDisplay results={mockMediumRiskData} />);
      expect(screen.getByTestId('risk-icon')).toBeInTheDocument();

      rerender(<ResultsDisplay results={mockHighRiskData} />);
      expect(screen.getByTestId('risk-icon')).toBeInTheDocument();
    });
  });

  // ==================== ALGORITHM BADGE TESTS ====================

  describe('Algorithm Badge Tests', () => {
    it('26. renders Jaccard badge with correct styling', () => {
      render(<ResultsDisplay results={mockLowRiskData} />);

      const badge = screen.getByTestId('jaccard-badge-0');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('27. renders TF-IDF badge with correct styling', () => {
      render(<ResultsDisplay results={mockLowRiskData} />);

      const badge = screen.getByTestId('tfidf-badge-0');
      expect(badge).toHaveClass('bg-purple-100', 'text-purple-800');
    });

    it('28. renders SBERT badge with correct styling', () => {
      render(<ResultsDisplay results={mockLowRiskData} />);

      const badge = screen.getByTestId('sbert-badge-0');
      expect(badge).toHaveClass('bg-indigo-100', 'text-indigo-800');
    });
  });

  // ==================== EDGE CASES ====================

  describe('Edge Cases', () => {
    it('29. handles multiple topics in Tier 1', () => {
      render(<ResultsDisplay results={mockLowRiskData} />);

      // Should render 5 topics
      expect(screen.getByTestId('topic-match-0')).toBeInTheDocument();
      expect(screen.getByTestId('topic-match-1')).toBeInTheDocument();
      expect(screen.getByTestId('topic-match-2')).toBeInTheDocument();
      expect(screen.getByTestId('topic-match-3')).toBeInTheDocument();
      expect(screen.getByTestId('topic-match-4')).toBeInTheDocument();
    });

    it('30. handles zero similarity score', () => {
      render(<ResultsDisplay results={mockNoMatchesData} />);

      expect(screen.getByTestId('max-similarity')).toHaveTextContent('0%');
    });

    it('31. handles missing optional fields (supervisor, session, status)', () => {
      const dataWithMissingFields = {
        ...mockLowRiskData,
        tier1_matches: [
          {
            id: 1,
            topic_title: 'Test Topic',
            jaccard_score: 50,
            tfidf_score: 48,
            sbert_score: 45
          }
        ]
      };

      render(<ResultsDisplay results={dataWithMissingFields} />);

      expect(screen.queryByTestId('supervisor-0')).not.toBeInTheDocument();
      expect(screen.queryByTestId('session-0')).not.toBeInTheDocument();
      expect(screen.queryByTestId('status-0')).not.toBeInTheDocument();
    });

    it('32. rounds similarity scores correctly', () => {
      const dataWithDecimalScores = {
        ...mockLowRiskData,
        max_similarity: 45.7,
        tier1_matches: [
          {
            id: 1,
            topic_title: 'Test Topic',
            supervisor_name: 'Dr. Test',
            session_year: '2023/2024',
            status: 'Approved',
            jaccard_score: 45.3,
            tfidf_score: 42.8,
            sbert_score: 40.1
          }
        ]
      };

      render(<ResultsDisplay results={dataWithDecimalScores} />);

      expect(screen.getByTestId('max-similarity')).toHaveTextContent('46%');
      expect(screen.getByTestId('jaccard-badge-0')).toHaveTextContent('Jaccard: 45%');
      expect(screen.getByTestId('tfidf-badge-0')).toHaveTextContent('TF-IDF: 43%');
      expect(screen.getByTestId('sbert-badge-0')).toHaveTextContent('SBERT: 40%');
    });

    it('33. displays all three tiers when all present', () => {
      render(<ResultsDisplay results={mockHighRiskData} />);

      expect(screen.getByTestId('tier-section-tier 1: high similarity matches')).toBeInTheDocument();
      expect(screen.getByTestId('tier-section-tier 2: medium similarity matches')).toBeInTheDocument();
      expect(screen.getByTestId('tier-section-tier 3: lower similarity matches')).toBeInTheDocument();
    });

    it('34. handles singular vs plural match count', () => {
      const singleMatchData = {
        ...mockLowRiskData,
        tier1_matches: [mockLowRiskData.tier1_matches[0]]
      };

      render(<ResultsDisplay results={singleMatchData} />);

      expect(screen.getByText('1 match')).toBeInTheDocument();
    });

    it('35. displays correct match count text for multiple matches', () => {
      render(<ResultsDisplay results={mockLowRiskData} />);

      expect(screen.getByText('5 matches')).toBeInTheDocument();
    });
  });
});
