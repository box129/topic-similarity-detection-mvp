import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import TopicForm from './components/features/TopicInput/TopicForm';
import ResultsDisplay from './components/features/Results/ResultsDisplay';

function App() {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  
  // Create abort controller for cancelling requests
  const abortControllerRef = useRef(null);

  useEffect(() => {
    return () => {
      // Mark component as unmounted
      isMountedRef.current = false;
      // Cancel in-flight requests when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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

      // Only update state if component still mounted
      if (!isMountedRef.current) return;
      
      // Validate response structure before setting
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response format from server');
      }

      // Brief loading visual for better UX (300ms)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (isMountedRef.current) {
        setResults(response.data);
      }
    } catch (err) {
      // Don't update state if component unmounted
      if (!isMountedRef.current) return;
      
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
      if (isMountedRef.current) {
        setIsLoading(false);
      }
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
    <div className="min-h-screen bg-gray-50 py-8 px-4" data-testid="app">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Topic Similarity Checker
          </h1>
          <p className="text-lg text-gray-600">
            Check research topic similarity against historical records
          </p>
        </header>

        {/* Topic Input Form */}
        <div className="mb-8">
          <TopicForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        {/* Error Display */}
        {error && !results && (
          <div className="max-w-2xl mx-auto mb-8" data-testid="error-display">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
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
          <div data-testid="results-container">
            <ResultsDisplay results={results} />

            {/* Reset Button */}
            <div className="text-center mt-8">
              <button
                onClick={handleReset}
                data-testid="reset-button"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Check Another Topic
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
