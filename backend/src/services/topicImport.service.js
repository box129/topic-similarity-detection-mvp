const TITLE_ALIASES = ['title', 'topic', 'topic_title', 'Topic Title', 'Research Topic'];
const KEYWORDS_ALIASES = ['keywords', 'Keywords'];
const POPULATION_ALIASES = ['population', 'Population'];
const LOCATION_ALIASES = ['location', 'Location'];
const STUDY_FOCUS_ALIASES = ['study_focus', 'studyFocus', 'Study Focus'];
const LIFECYCLE_ALIASES = ['lifecycle_bucket', 'lifecycleBucket', 'bucket'];
const ALLOWED_LIFECYCLE_BUCKETS = new Set(['historical', 'current_session', 'under_review']);
const CONTEXT_FIELDS = ['population', 'location', 'study_focus'];

function normalizeString(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function getAliasedValue(row, aliases) {
  for (const alias of aliases) {
    if (Object.prototype.hasOwnProperty.call(row, alias)) {
      return normalizeString(row[alias]);
    }
  }

  return '';
}

function normalizeLifecycleBucket(value) {
  const normalized = normalizeString(value).toLowerCase().replace(/[\s-]+/g, '_');
  return ALLOWED_LIFECYCLE_BUCKETS.has(normalized) ? normalized : '';
}

function normalizeKeywords(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeString).filter(Boolean);
  }

  if (value === null || value === undefined) {
    return [];
  }

  const keywordText = normalizeString(value);
  if (!keywordText) {
    return [];
  }

  return keywordText.split(',').map(keyword => keyword.trim()).filter(Boolean);
}

function getRawAliasedValue(row, aliases) {
  for (const alias of aliases) {
    if (Object.prototype.hasOwnProperty.call(row, alias)) {
      return row[alias];
    }
  }

  return undefined;
}

function buildRecord(row) {
  const warnings = [];
  const lifecycleBucketFromField = normalizeLifecycleBucket(getAliasedValue(row, LIFECYCLE_ALIASES));
  const statusValue = Object.prototype.hasOwnProperty.call(row, 'status') ? row.status : undefined;
  const normalizedStatusValue = normalizeString(statusValue);
  const lifecycleBucketFromStatus = normalizeLifecycleBucket(normalizedStatusValue);

  if (normalizedStatusValue && !lifecycleBucketFromStatus) {
    warnings.push('status does not map to a lifecycle_bucket');
  }

  const record = {
    title: getAliasedValue(row, TITLE_ALIASES),
    keywords: normalizeKeywords(getRawAliasedValue(row, KEYWORDS_ALIASES)),
    population: getAliasedValue(row, POPULATION_ALIASES),
    location: getAliasedValue(row, LOCATION_ALIASES),
    study_focus: getAliasedValue(row, STUDY_FOCUS_ALIASES),
    lifecycle_bucket: lifecycleBucketFromField || lifecycleBucketFromStatus || 'historical',
    raw_record: row,
    warnings
  };

  CONTEXT_FIELDS.forEach(field => {
    if (!record[field]) {
      warnings.push(`missing ${field}`);
    }
  });

  return record;
}

function normalizeTopicImportRows(rows) {
  if (!Array.isArray(rows)) {
    throw new Error('rows must be an array');
  }

  const records = [];
  const seenTitles = new Set();
  const report = {
    total_rows: rows.length,
    accepted_rows: 0,
    skipped_rows: 0,
    missing_title_rows: 0,
    incomplete_context_rows: 0,
    duplicate_title_rows: 0
  };

  rows.forEach(row => {
    const sourceRow = row && typeof row === 'object' ? row : {};
    const record = buildRecord(sourceRow);

    if (!record.title) {
      report.skipped_rows += 1;
      report.missing_title_rows += 1;
      return;
    }

    const titleKey = record.title.toLowerCase();
    if (seenTitles.has(titleKey)) {
      report.skipped_rows += 1;
      report.duplicate_title_rows += 1;
      return;
    }

    seenTitles.add(titleKey);
    records.push(record);
    report.accepted_rows += 1;

    if (CONTEXT_FIELDS.some(field => !record[field])) {
      report.incomplete_context_rows += 1;
    }
  });

  return { records, report };
}

module.exports = {
  normalizeTopicImportRows
};
