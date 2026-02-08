import { useState } from 'react';
import TopicForm from './components/features/TopicInput/TopicForm';
import axios from 'axios';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSubmit = async (data) => {
    setIsLoading(true);
    setResults(null);

    try {
      const response = await axios.post('/api/similarity/check', data);
      setResults(response.data);
    } catch (error) {
      console.error('Error checking similarity:', error);
      throw new Error(
        error.response?.data?.error || 
        'Failed to check similarity. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Topic Similarity Checker
          </h1>
          <p className="text-lg text-gray-600">
            Check if your research topic is similar to existing topics
          </p>
        </div>

        {/* Topic Form */}
        <TopicForm onSubmit={handleSubmit} isLoading={isLoading} />

        {/* Results Display */}
        {results && (
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Similarity Check Results
              </h3>
              
              {/* Risk Level */}
              <div className={`
                p-4 rounded-lg mb-4
                ${results.overallRisk === 'HIGH' ? 'bg-red-100 border-l-4 border-red-500' : ''}
                ${results.overallRisk === 'MEDIUM' ? 'bg-yellow-100 border-l-4 border-yellow-500' : ''}
                ${results.overallRisk === 'LOW' ? 'bg-green-100 border-l-4 border-green-500' : ''}
              `}>
                <p className="font-semibold text-gray-800">
                  Risk Level: <span className={`
                    ${results.overallRisk === 'HIGH' ? 'text-red-700' : ''}
                    ${results.overallRisk === 'MEDIUM' ? 'text-yellow-700' : ''}
                    ${results.overallRisk === 'LOW' ? 'text-green-700' : ''}
                  `}>{results.overallRisk}</span>
                </p>
              </div>

              {/* Algorithm Status */}
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Algorithms used: 
                  {results.algorithmStatus.jaccard && ' Jaccard'}
                  {results.algorithmStatus.tfidf && ', TF-IDF'}
                  {results.algorithmStatus.sbert && ', SBERT'}
                </p>
                <p className="text-sm text-gray-600">
                  Processing time: {results.processingTime}ms
                </p>
              </div>

              {/* Similar Topics */}
              {results.results.tier1_historical.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Similar Historical Topics:
                  </h4>
                  <ul className="space-y-2">
                    {results.results.tier1_historical.map((topic, index) => (
                      <li key={index} className="p-3 bg-gray-50 rounded">
                        <p className="font-medium">{topic.title}</p>
                        <p className="text-sm text-gray-600">
                          Similarity: {(topic.similarity.combined * 100).toFixed(1)}%
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
