const fs = require('fs');
const path = require('path');
const { calculateJaccard } = require('../src/services/jaccard.service');
const { calculateTfIdfSimilarity } = require('../src/services/tfidf.service');
const sbertService = require('../src/services/sbert.service');
const {
  normalizeScore,
  buildPrediction,
  buildConfusionMatrix,
  calculateMetrics
} = require('../src/services/evaluationMetrics.service');

const datasetPath = path.join(__dirname, '..', 'evaluation', 'datasets', 'pilot-topic-pairs.json');
const EVALUATION_WEIGHTS = {
  jaccard: 0.2,
  tfidf: 0.3,
  sbert: 0.5
};

function loadDataset() {
  return JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
}

function calculateTfIdfPairScore(submittedTitle, existingTitle, caseId) {
  const results = calculateTfIdfSimilarity(submittedTitle, [
    {
      id: caseId,
      title: existingTitle
    }
  ]);

  return results[0]?.score ?? null;
}

async function calculateSbertPairScore(submittedTitle, existingTitle, caseId) {
  const results = await sbertService.calculateSbertSimilarities(submittedTitle, [
    {
      id: caseId,
      title: existingTitle
    }
  ]);

  return results[0]?.score ?? null;
}

function buildSummary(caseResults, scorerKeys) {
  return scorerKeys.reduce((summary, scorerKey) => {
    summary[scorerKey] = calculateMetrics(buildConfusionMatrix(caseResults, scorerKey));
    return summary;
  }, {});
}

async function runEvaluation() {
  const dataset = loadDataset();
  const sbertAvailable = await sbertService.checkHealth();
  const scorerKeys = ['jaccard', 'tfidf', 'lexical_max'];
  const caseResults = [];
  const notes = [
    'Scores are normalized to 0.00-1.00 before risk classification.',
    'weighted_combined is evaluation-only and does not change production API behavior.',
    'Current scoring uses topic titles only; context fields are recorded for future evaluation.'
  ];

  if (sbertAvailable) {
    scorerKeys.push('sbert', 'weighted_combined');
  } else {
    notes.push('SBERT is unavailable; SBERT and weighted_combined metrics were skipped.');
  }

  for (const evaluationCase of dataset.cases) {
    const submittedTitle = evaluationCase.submitted.title;
    const existingTitle = evaluationCase.existing.title;
    const jaccardScore = normalizeScore(calculateJaccard(submittedTitle, existingTitle).score);
    const tfidfScore = normalizeScore(calculateTfIdfPairScore(submittedTitle, existingTitle, evaluationCase.id));
    const lexicalMaxScore = normalizeScore(Math.max(jaccardScore || 0, tfidfScore || 0));
    let sbertScore = null;
    let weightedCombinedScore = null;

    if (sbertAvailable) {
      sbertScore = normalizeScore(await calculateSbertPairScore(submittedTitle, existingTitle, evaluationCase.id));
      if (sbertScore !== null) {
        weightedCombinedScore = normalizeScore(
          (EVALUATION_WEIGHTS.jaccard * (jaccardScore || 0)) +
          (EVALUATION_WEIGHTS.tfidf * (tfidfScore || 0)) +
          (EVALUATION_WEIGHTS.sbert * sbertScore)
        );
      }
    }

    const scores = {
      jaccard: jaccardScore,
      tfidf: tfidfScore,
      lexical_max: lexicalMaxScore
    };

    const predictions = {
      jaccard: buildPrediction(jaccardScore),
      tfidf: buildPrediction(tfidfScore),
      lexical_max: buildPrediction(lexicalMaxScore)
    };

    if (sbertAvailable) {
      scores.sbert = sbertScore;
      scores.weighted_combined = weightedCombinedScore;
      predictions.sbert = buildPrediction(sbertScore);
      predictions.weighted_combined = buildPrediction(weightedCombinedScore);
    }

    caseResults.push({
      id: evaluationCase.id,
      category: evaluationCase.category,
      expected_label: evaluationCase.expected_label,
      expected_risk: evaluationCase.expected_risk,
      scores,
      predictions
    });
  }

  const report = {
    dataset_version: dataset.version,
    total_cases: dataset.cases.length,
    sbert_available: sbertAvailable,
    context_fields_recorded_but_not_scored: true,
    summary: buildSummary(caseResults, scorerKeys),
    cases: caseResults,
    notes
  };

  console.log(JSON.stringify(report, null, 2));
}

runEvaluation().catch(error => {
  console.error('Topic evaluation failed.');
  console.error(error);
  process.exitCode = 1;
});
