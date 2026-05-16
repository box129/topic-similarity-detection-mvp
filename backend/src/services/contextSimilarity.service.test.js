const {
  normalizeContextValue,
  compareContextField,
  calculateContextSimilarity,
  calculateContextAdjustedScore
} = require('./contextSimilarity.service');

describe('Context Similarity Service', () => {
  test('should normalize context values for deterministic comparison', () => {
    expect(normalizeContextValue('  Osogbo, Osun State!  ')).toBe('osogbo osun state');
    expect(normalizeContextValue(null)).toBe('');
    expect(normalizeContextValue(undefined)).toBe('');
  });

  test('should score exact normalized field matches as match', () => {
    expect(compareContextField('Nursing Mothers', ' nursing mothers ')).toEqual({
      status: 'match',
      score: 1
    });
  });

  test('should score missing field values safely', () => {
    expect(compareContextField('', 'Nursing mothers')).toEqual({
      status: 'missing',
      score: 0.75
    });
  });

  test('should produce high context score when all fields match', () => {
    const result = calculateContextSimilarity(
      {
        population: 'Pregnant women',
        location: 'Ile-Ife',
        study_focus: 'Clinic attendance support'
      },
      {
        population: 'pregnant women',
        location: 'Ile Ife',
        study_focus: 'Clinic attendance support'
      }
    );

    expect(result.score).toBe(1);
    expect(result.match_count).toBe(3);
    expect(result.mismatch_count).toBe(0);
    expect(result.missing_count).toBe(0);
    expect(result.has_full_context_match).toBe(true);
  });

  test('should reduce context score when population differs', () => {
    const result = calculateContextSimilarity(
      {
        population: 'Market traders',
        location: 'Osogbo',
        study_focus: 'Screening awareness'
      },
      {
        population: 'Secondary school teachers',
        location: 'Osogbo',
        study_focus: 'Screening awareness'
      }
    );

    expect(result.score).toBe(0.667);
    expect(result.field_results.population.status).toBe('mismatch');
    expect(result.mismatch_count).toBe(1);
  });

  test('should reduce context score when location differs', () => {
    const result = calculateContextSimilarity(
      {
        population: 'Mothers',
        location: 'Osogbo',
        study_focus: 'Malaria prevention'
      },
      {
        population: 'Mothers',
        location: 'Ibadan',
        study_focus: 'Malaria prevention'
      }
    );

    expect(result.score).toBe(0.667);
    expect(result.field_results.location.status).toBe('mismatch');
    expect(result.mismatch_count).toBe(1);
  });

  test('should reduce context score when study focus differs', () => {
    const result = calculateContextSimilarity(
      {
        population: 'Mothers',
        location: 'Osogbo',
        study_focus: 'Malaria prevention'
      },
      {
        population: 'Mothers',
        location: 'Osogbo',
        study_focus: 'Family planning'
      }
    );

    expect(result.score).toBe(0.667);
    expect(result.field_results.study_focus.status).toBe('mismatch');
    expect(result.mismatch_count).toBe(1);
  });

  test('should handle missing context fields without crashing', () => {
    const result = calculateContextSimilarity(
      {
        population: '',
        location: 'Osogbo'
      },
      {
        population: 'Mothers',
        location: '',
        study_focus: 'Malaria prevention'
      }
    );

    expect(result.score).toBe(0.75);
    expect(result.match_count).toBe(0);
    expect(result.mismatch_count).toBe(0);
    expect(result.missing_count).toBe(3);
    expect(result.has_full_context_match).toBe(false);
  });

  test('should apply full context match bonus only when all context fields match', () => {
    const fullMatch = calculateContextSimilarity(
      {
        population: 'Mothers',
        location: 'Osogbo',
        study_focus: 'Malaria prevention'
      },
      {
        population: 'Mothers',
        location: 'Osogbo',
        study_focus: 'Malaria prevention'
      }
    );
    const partialMatch = calculateContextSimilarity(
      {
        population: 'Mothers',
        location: 'Osogbo',
        study_focus: 'Malaria prevention'
      },
      {
        population: 'Mothers',
        location: 'Ibadan',
        study_focus: 'Malaria prevention'
      }
    );

    expect(calculateContextAdjustedScore(0.5, fullMatch)).toBe(0.7);
    expect(calculateContextAdjustedScore(0.5, partialMatch)).toBe(0.222);
    expect(calculateContextAdjustedScore(1, fullMatch)).toBe(1);
  });

  test('should reduce high base score below similarity threshold when context clearly mismatches', () => {
    const contextMismatch = calculateContextSimilarity(
      {
        population: 'Mothers',
        location: 'Osogbo',
        study_focus: 'Malaria prevention'
      },
      {
        population: 'Teachers',
        location: 'Ibadan',
        study_focus: 'Family planning'
      }
    );

    expect(contextMismatch.score).toBe(0);
    expect(calculateContextAdjustedScore(0.9, contextMismatch)).toBe(0);
  });
});
