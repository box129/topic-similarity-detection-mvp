import { useState, useRef } from 'react';
import axios from 'axios';
import TopicForm from './components/features/TopicInput/TopicForm';
import ResultsDisplay from './components/features/Results/ResultsDisplay';

function App() {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Create abort controller for cancelling requests
  const abortControllerRef = useRef(null);

  /**
   * Handle topic similarity check submission
   * @param {Object} data - Form data with topic and keywords
   */
  const handleSubmit = async (data) => {
    // Abort any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      // Call API to check topic similarity
      const response = await axios.post('/api/similarity/check', data, {
        signal: abortControllerRef.current.signal
      });

      // Validate response structure before setting
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response format from server');
      }

      // Brief loading visual for better UX (300ms)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Map backend response to the format expected by ResultsDisplay
        const fypData = response.data.data;
        const isFypResponse = ['success', 'partial_success'].includes(response.data.status) && fypData;

        const mapFypTier1Matches = (matches = []) => matches.map(m => ({
          id: m.id,
          topic_title: m.title || '',
          supervisor_name: m.supervisor || '',
          session_year: m.year || '',
          category: m.category || '',
          jaccard_score: m.jaccard || 0,
          tfidf_score: m.tfidf || 0,
          sbert_score: m.sbert || 0,
          combined_similarity_score: m.sbert || m.jaccard || 0
        }));

        const mapFypTier2Matches = (matches = []) => matches.map(m => ({
          id: m.id,
          topic_title: m.title || '',
          supervisor_name: m.supervisor || '',
          session_year: m.approved_date || '',
          jaccard_score: m.jaccard || 0,
          tfidf_score: m.tfidf || 0,
          sbert_score: m.sbert || 0,
          combined_similarity_score: m.sbert || m.jaccard || 0
        }));

        const mapFypTier3Matches = (matches = []) => matches.map(m => ({
          id: m.id,
          topic_title: m.title || '',
          supervisor_name: m.reviewing_lecturer || '',
          session_year: m.review_started_at || '',
          jaccard_score: m.jaccard || 0,
          tfidf_score: m.tfidf || 0,
          sbert_score: m.sbert || 0,
          combined_similarity_score: m.sbert || m.jaccard || 0
        }));

        const mapLegacyMatches = (matches = []) => matches.map(m => ({
          id: m.id,
          topic_title: m.title || '',
          supervisor_name: m.supervisorName || '',
          session_year: m.sessionYear || '',
          category: m.category || '',
          jaccard_score: m.scores?.jaccard || 0,
          tfidf_score: m.scores?.tfidf || 0,
          sbert_score: m.scores?.sbert || 0,
          combined_similarity_score: m.scores?.combined || 0
        }));

        const backendResults = response.data.results || {};
        const maxScore = backendResults.tier1_historical?.length > 0 
           ? backendResults.tier1_historical[0].scores?.combined 
           : 0;

        const mappedResults = isFypResponse ? {
          risk_level: fypData.overall_risk || 'LOW',
          max_similarity: fypData.max_similarity ?? 0,
          recommendation: fypData.recommendation,
          sbert_available: response.data.status !== 'partial_success',
          tier1_matches: mapFypTier1Matches(fypData.tier1_historical),
          tier2_matches: mapFypTier2Matches(fypData.tier2_current),
          tier3_matches: mapFypTier3Matches(fypData.tier3_under_review)
        } : {
          risk_level: response.data.overallRisk || 'LOW',
          max_similarity: response.data.overallMaxSimilarity ?? maxScore,
          sbert_available: response.data.algorithmStatus?.sbert || false,
          tier1_matches: mapLegacyMatches(backendResults.tier1_historical),
          tier2_matches: mapLegacyMatches(backendResults.tier2_current_session),
          tier3_matches: mapLegacyMatches(backendResults.tier3_under_review)
        };
        
        setResults(mappedResults);
    } catch (err) {
      // Don't show error if request was aborted by user
      if (err.name === 'AbortError') {
        console.info('Similarity check was cancelled');
        return;
      }
      
      // Distinguish error types for better messaging
      let errorMessage = 'An error occurred while checking similarity';
      
      if (err.response) {
        // Server responded with error
        errorMessage = err.response.data?.message || 
                       `Server error (${err.response.status}): ${err.response.statusText}`;
      } else if (err.request) {
        // Request made but no response
        errorMessage = 'No response from server. Please check your connection.';
      } else if (err.message) {
        // Error in request setup
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Log error for debugging (not re-throwing)
      console.error('Similarity check failed:', {
        message: err.message,
        status: err.response?.status,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset to initial state
   */
  const handleReset = () => {
    setResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="app">
      {/* Header Banner */}
      <header className="bg-white border-b border-gray-200 py-6 mb-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold font-sans text-gray-900 px-4">
          UNIOSUN Research Topic Similarity Detector
        </h1>
      </header>

      <div className="max-w-[1200px] mx-auto px-4 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Topic Input Form */}
          <div className="w-full lg:w-1/3 flex-shrink-0">
            <TopicForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>

          {/* Right Column: Results Display & Errors */}
          <div className="w-full lg:w-2/3">
            {/* Error Display */}
            {error && !results && (
              <div className="w-full mb-8" data-testid="error-display">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-red-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Results Display */}
            {results && (
              <div data-testid="results-container" className="animate-fade-in">
                <ResultsDisplay results={results} />

                {/* Reset Button */}
                <div className="text-center mt-8 pb-8">
                  <button
                    onClick={handleReset}
                    data-testid="reset-button"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Check Another Topic
                  </button>
                </div>
              </div>
            )}
            
            {!results && !error && (
              <div className="hidden lg:flex flex-col items-center justify-center h-full text-gray-400 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50 p-12">
                <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p className="text-lg font-medium text-gray-500">Awaiting submission</p>
                <p className="text-sm mt-2 text-center">Fill out the form on the left to check for topic similarity.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
