const {
  normalizeScore,
  classifyRisk,
  labelFromRisk,
  buildPrediction,
  buildConfusionMatrix,
  calculateMetrics
} = require('./evaluationMetrics.service');

describe('Evaluation Metrics Service', () => {
  describe('normalizeScore', () => {
    test('should keep 0-1 scores on the normalized scale', () => {
      expect(normalizeScore(0)).toBe(0);
      expect(normalizeScore(0.42)).toBe(0.42);
      expect(normalizeScore(1)).toBe(1);
    });

    test('should convert 0-100 percentage scores to 0-1', () => {
      expect(normalizeScore(42)).toBe(0.42);
      expect(normalizeScore(100)).toBe(1);
    });

    test('should return null for missing or invalid scores', () => {
      expect(normalizeScore(null)).toBeNull();
      expect(normalizeScore(undefined)).toBeNull();
      expect(normalizeScore('not a score')).toBeNull();
    });
  });

  describe('classifyRisk', () => {
    test('should classify normalized threshold boundaries', () => {
      expect(classifyRisk(0.39)).toBe('LOW');
      expect(classifyRisk(0.40)).toBe('MEDIUM');
      expect(classifyRisk(0.69)).toBe('MEDIUM');
      expect(classifyRisk(0.70)).toBe('HIGH');
    });

    test('should classify percentage-style scores after normalization', () => {
      expect(classifyRisk(39)).toBe('LOW');
      expect(classifyRisk(40)).toBe('MEDIUM');
      expect(classifyRisk(70)).toBe('HIGH');
    });
  });

  test('should map risk to binary labels', () => {
    expect(labelFromRisk('LOW')).toBe('not_similar');
    expect(labelFromRisk('MEDIUM')).toBe('similar');
    expect(labelFromRisk('HIGH')).toBe('similar');
    expect(labelFromRisk(null)).toBeNull();
  });

  test('should build normalized prediction objects', () => {
    expect(buildPrediction(75)).toEqual({
      score: 0.75,
      risk: 'HIGH',
      label: 'similar'
    });
  });

  test('should build confusion matrix counts', () => {
    const caseResults = [
      { expected_label: 'similar', predictions: { jaccard: { label: 'similar' } } },
      { expected_label: 'not_similar', predictions: { jaccard: { label: 'not_similar' } } },
      { expected_label: 'not_similar', predictions: { jaccard: { label: 'similar' } } },
      { expected_label: 'similar', predictions: { jaccard: { label: 'not_similar' } } }
    ];

    expect(buildConfusionMatrix(caseResults, 'jaccard')).toEqual({
      tp: 1,
      tn: 1,
      fp: 1,
      fn: 1
    });
  });

  test('should calculate accuracy, precision, recall, and f1', () => {
    expect(calculateMetrics({ tp: 2, tn: 3, fp: 1, fn: 1 })).toEqual({
      tp: 2,
      tn: 3,
      fp: 1,
      fn: 1,
      accuracy: 0.714,
      precision: 0.667,
      recall: 0.667,
      f1: 0.667
    });
  });

  test('should safely calculate metrics with zero denominators', () => {
    expect(calculateMetrics({ tp: 0, tn: 0, fp: 0, fn: 0 })).toEqual({
      tp: 0,
      tn: 0,
      fp: 0,
      fn: 0,
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1: 0
    });
  });
});
