import { useState } from 'react';
import axios from 'axios';
import TopicForm from './components/features/TopicInput/TopicForm';
import ResultsDisplay from './components/features/Results/ResultsDisplay';

function App() {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handle topic similarity check submission
   * @param {Object} data - Form data with topic and keywords
   */
  const handleSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      // Call API to check topic similarity
      const response = await axios.post('/api/similarity/check', data);

      // Simulate network delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      setResults(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred while checking similarity';
      setError(errorMessage);
      throw new Error(errorMessage);
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
