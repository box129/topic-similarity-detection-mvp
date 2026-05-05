import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResultsDisplay from '../src/components/features/Results/ResultsDisplay';

describe('ResultsDisplay current behavior coverage', () => {
  const results = {
    risk_level: 'HIGH',
    max_similarity: 85,
    sbert_available: true,
    tier1_matches: [
      {
        id: 1,
        topic_title: 'Knowledge and practices of malaria prevention among mothers',
        supervisor_name: 'Dr. Jane Smith',
        session_year: '2023/2024',
        jaccard_score: 85,
        tfidf_score: 82,
        sbert_score: 80,
        combined_similarity_score: 85
      }
    ],
    tier2_matches: [
      {
        id: 2,
        topic_title: 'Malaria control measures in pediatric populations',
        supervisor_name: 'Dr. Robert Wilson',
        session_year: '2022/2023',
        jaccard_score: 65,
        tfidf_score: 62,
        sbert_score: 60,
        combined_similarity_score: 65
      }
    ],
    tier3_matches: []
  };

  it('renders current tier names and score scale', () => {
    render(<ResultsDisplay results={results} />);

    expect(screen.getByTestId('risk-title')).toHaveTextContent('High Risk');
    expect(screen.getByTestId('max-similarity')).toHaveTextContent('85%');
    expect(screen.getByTestId('tier-section-tier1')).toBeInTheDocument();
    expect(screen.getByTestId('tier-title-tier1')).toHaveTextContent('Similar Past Projects');
    expect(screen.getByTestId('tier-section-tier2')).toBeInTheDocument();
    expect(screen.getByTestId('tier-title-tier2')).toHaveTextContent('Current Session Projects');
    expect(screen.queryByTestId('tier-section-tier3')).not.toBeInTheDocument();
  });

  it('keeps technical score badges hidden until expanded', async () => {
    const user = userEvent.setup();
    render(<ResultsDisplay results={results} />);

    expect(screen.queryByTestId('jaccard-badge-0')).not.toBeInTheDocument();

    await user.click(screen.getByTestId('tier-section-tier1').querySelector('[data-testid="expand-details-0"]'));

    expect(screen.getByTestId('jaccard-badge-0')).toHaveTextContent('Exact Match: 85%');
    expect(screen.getByTestId('tfidf-badge-0')).toHaveTextContent('Term Weight: 82%');
    expect(screen.getByTestId('sbert-badge-0')).toHaveTextContent('Semantic: 80%');
  });
});
