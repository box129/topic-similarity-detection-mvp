const { normalizeTopicImportRows } = require('./topicImport.service');

describe('Topic Import Normalization Service', () => {
  test('should normalize a valid complete row', () => {
    const row = {
      title: 'Maternal Health Awareness in Rural Communities',
      keywords: 'maternal health, awareness',
      population: 'Pregnant women',
      location: 'Oyo State',
      study_focus: 'Health awareness',
      lifecycle_bucket: 'current_session'
    };

    const result = normalizeTopicImportRows([row]);

    expect(result.records).toEqual([
      {
        title: 'Maternal Health Awareness in Rural Communities',
        keywords: ['maternal health', 'awareness'],
        population: 'Pregnant women',
        location: 'Oyo State',
        study_focus: 'Health awareness',
        lifecycle_bucket: 'current_session',
        raw_record: row,
        warnings: []
      }
    ]);
    expect(result.report).toEqual({
      total_rows: 1,
      accepted_rows: 1,
      skipped_rows: 0,
      missing_title_rows: 0,
      incomplete_context_rows: 0,
      duplicate_title_rows: 0
    });
  });

  test('should accept row with missing optional context and add warnings', () => {
    const result = normalizeTopicImportRows([
      { title: 'Nutrition Knowledge Among Students', keywords: 'nutrition' }
    ]);

    expect(result.records).toHaveLength(1);
    expect(result.records[0].warnings).toEqual([
      'missing population',
      'missing location',
      'missing study_focus'
    ]);
    expect(result.report.incomplete_context_rows).toBe(1);
    expect(result.report.accepted_rows).toBe(1);
  });

  test('should skip row with missing title', () => {
    const result = normalizeTopicImportRows([
      { keywords: 'health', population: 'Students' }
    ]);

    expect(result.records).toEqual([]);
    expect(result.report.skipped_rows).toBe(1);
    expect(result.report.missing_title_rows).toBe(1);
  });

  test('should support flexible title aliases', () => {
    const result = normalizeTopicImportRows([
      { topic: 'Topic Alias' },
      { topic_title: 'Topic Title Alias' },
      { 'Topic Title': 'Spaced Topic Title Alias' },
      { 'Research Topic': 'Research Topic Alias' }
    ]);

    expect(result.records.map(record => record.title)).toEqual([
      'Topic Alias',
      'Topic Title Alias',
      'Spaced Topic Title Alias',
      'Research Topic Alias'
    ]);
  });

  test('should normalize comma-separated keyword strings', () => {
    const result = normalizeTopicImportRows([
      { title: 'Keyword String Topic', keywords: 'health, students, , awareness ' }
    ]);

    expect(result.records[0].keywords).toEqual(['health', 'students', 'awareness']);
  });

  test('should normalize keyword arrays', () => {
    const result = normalizeTopicImportRows([
      { title: 'Keyword Array Topic', keywords: [' health ', '', 'students', null] }
    ]);

    expect(result.records[0].keywords).toEqual(['health', 'students']);
  });

  test('should detect duplicate titles and count duplicate rows as skipped', () => {
    const result = normalizeTopicImportRows([
      { title: 'Repeated Topic' },
      { title: ' repeated topic ' }
    ]);

    expect(result.records).toHaveLength(1);
    expect(result.report.skipped_rows).toBe(1);
    expect(result.report.duplicate_title_rows).toBe(1);
  });

  test('should preserve unknown columns in raw_record', () => {
    const row = {
      title: 'Unknown Column Topic',
      DepartmentNotes: 'Imported from old spreadsheet'
    };

    const result = normalizeTopicImportRows([row]);

    expect(result.records[0].raw_record).toBe(row);
    expect(result.records[0].raw_record.DepartmentNotes).toBe('Imported from old spreadsheet');
  });

  test('should default lifecycle bucket to historical', () => {
    const result = normalizeTopicImportRows([
      { title: 'Default Lifecycle Topic' }
    ]);

    expect(result.records[0].lifecycle_bucket).toBe('historical');
  });

  test('should support lifecycle bucket override', () => {
    const result = normalizeTopicImportRows([
      { title: 'Under Review Topic', bucket: 'under_review' }
    ]);

    expect(result.records[0].lifecycle_bucket).toBe('under_review');
  });

  test('should map status only when it clearly matches an allowed lifecycle bucket', () => {
    const result = normalizeTopicImportRows([
      { title: 'Current Status Topic', status: 'Current Session' }
    ]);

    expect(result.records[0].lifecycle_bucket).toBe('current_session');
    expect(result.records[0].warnings).not.toContain('status does not map to a lifecycle_bucket');
  });

  test('should preserve unclear status with warning without forcing lifecycle bucket', () => {
    const row = { title: 'Approved Status Topic', status: 'approved' };

    const result = normalizeTopicImportRows([row]);

    expect(result.records[0].lifecycle_bucket).toBe('historical');
    expect(result.records[0].raw_record).toBe(row);
    expect(result.records[0].warnings).toContain('status does not map to a lifecycle_bucket');
  });

  test('should ignore missing or blank status without adding lifecycle warning', () => {
    const result = normalizeTopicImportRows([
      { title: 'Missing Status Topic' },
      { title: 'Blank Status Topic', status: '' },
      { title: 'Whitespace Status Topic', status: '   ' },
      { title: 'Null Status Topic', status: null },
      { title: 'Undefined Status Topic', status: undefined }
    ]);

    result.records.forEach(record => {
      expect(record.lifecycle_bucket).toBe('historical');
      expect(record.warnings).not.toContain('status does not map to a lifecycle_bucket');
    });
  });

  test('should throw when rows is not an array', () => {
    expect(() => normalizeTopicImportRows({ title: 'Not Array' })).toThrow('rows must be an array');
  });
});
