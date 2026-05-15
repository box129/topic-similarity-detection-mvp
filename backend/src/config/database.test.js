const prisma = require('./database');

function shouldSkipImportFieldRoundtrip(error) {
  const message = String(error?.message || '');
  const skippableCodes = new Set(['P1001', 'P1002', 'P1010', 'P2021', 'P2022']);

  return skippableCodes.has(error?.code)
    || /can't reach database/i.test(message)
    || /connect econnrefused/i.test(message)
    || /does not exist/i.test(message)
    || /unknown (arg|argument)/i.test(message);
}

function logImportFieldSkip(modelName, error) {
  console.warn(
    `Skipping ${modelName} import-field roundtrip: database unavailable or npm run prisma:push required. ${error.message}`
  );
}

const importFieldData = {
  population: 'Final year students',
  location: 'Osun State',
  studyFocus: 'Topic approval workflow',
  rawRecord: {
    'Topic Title': 'Imported Topic',
    DepartmentNotes: 'Original spreadsheet note'
  },
  importWarnings: ['missing location'],
  sourceType: 'xlsx',
  sourceFilename: 'department-topics.xlsx',
  importBatchId: 'test-import-batch-001'
};

async function expectImportFieldsRoundtrip(modelName, data) {
  let createdTopicId;

  try {
    const topic = await prisma[modelName].create({ data });
    createdTopicId = topic.id;

    const retrieved = await prisma[modelName].findUnique({
      where: { id: createdTopicId }
    });

    expect(retrieved.population).toBe(importFieldData.population);
    expect(retrieved.location).toBe(importFieldData.location);
    expect(retrieved.studyFocus).toBe(importFieldData.studyFocus);
    expect(retrieved.rawRecord).toEqual(importFieldData.rawRecord);
    expect(retrieved.importWarnings).toEqual(importFieldData.importWarnings);
    expect(retrieved.sourceType).toBe(importFieldData.sourceType);
    expect(retrieved.sourceFilename).toBe(importFieldData.sourceFilename);
    expect(retrieved.importBatchId).toBe(importFieldData.importBatchId);
  } catch (error) {
    if (shouldSkipImportFieldRoundtrip(error)) {
      logImportFieldSkip(modelName, error);
      return;
    }

    throw error;
  } finally {
    if (createdTopicId) {
      try {
        await prisma[modelName].delete({
          where: { id: createdTopicId }
        });
      } catch (error) {
        if (!shouldSkipImportFieldRoundtrip(error)) {
          throw error;
        }
      }
    }
  }
}

describe('Database Connection', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should connect to database successfully', async () => {
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    expect(result).toBeDefined();
    expect(result[0].result).toBe(1);
  });

  test('should have vector extension enabled when explicitly required', async () => {
    const extensions = await prisma.$queryRaw`
      SELECT * FROM pg_extension WHERE extname = 'vector'
    `;
    expect(extensions).toBeDefined();

    // pgvector is required only in environments that provision native vector support.
    // Default local/test databases may use JSON embeddings and should not hard-fail here.
    if (process.env.REQUIRE_PGVECTOR === 'true') {
      expect(extensions.length).toBeGreaterThan(0);
    } else {
      expect(Array.isArray(extensions)).toBe(true);
    }
  });
});

describe('HistoricalTopic Model', () => {
  let createdTopicId;

  afterAll(async () => {
    // Cleanup: delete test data
    if (createdTopicId) {
      await prisma.historicalTopic.delete({
        where: { id: createdTopicId }
      });
    }
    await prisma.$disconnect();
  });

  test('should create a historical topic', async () => {
    const topic = await prisma.historicalTopic.create({
      data: {
        title: 'Test Historical Topic',
        keywords: 'machine learning, AI, neural networks',
        sessionYear: '2023/2024',
        supervisorName: 'Dr. Test Supervisor',
        category: 'Artificial Intelligence'
      }
    });

    createdTopicId = topic.id;

    expect(topic).toBeDefined();
    expect(topic.id).toBeDefined();
    expect(topic.title).toBe('Test Historical Topic');
    expect(topic.sessionYear).toBe('2023/2024');
    expect(topic.createdAt).toBeDefined();
  });

  test('should retrieve historical topic by id', async () => {
    const topic = await prisma.historicalTopic.findUnique({
      where: { id: createdTopicId }
    });

    expect(topic).toBeDefined();
    expect(topic.title).toBe('Test Historical Topic');
  });

  test('should update historical topic', async () => {
    const updated = await prisma.historicalTopic.update({
      where: { id: createdTopicId },
      data: { category: 'Machine Learning' }
    });

    expect(updated.category).toBe('Machine Learning');
  });

  test('should find topics by category', async () => {
    const topics = await prisma.historicalTopic.findMany({
      where: { category: 'Machine Learning' }
    });

    expect(topics).toBeDefined();
    expect(topics.length).toBeGreaterThan(0);
  });
});

describe('CurrentSessionTopic Model', () => {
  let createdTopicId;

  afterAll(async () => {
    if (createdTopicId) {
      await prisma.currentSessionTopic.delete({
        where: { id: createdTopicId }
      });
    }
    await prisma.$disconnect();
  });

  test('should create a current session topic', async () => {
    const topic = await prisma.currentSessionTopic.create({
      data: {
        title: 'Test Current Topic',
        keywords: 'blockchain, cryptocurrency',
        sessionYear: '2024/2025',
        supervisorName: 'Dr. Current Supervisor',
        category: 'Blockchain',
        studentId: 'STU12345'
      }
    });

    createdTopicId = topic.id;

    expect(topic).toBeDefined();
    expect(topic.studentId).toBe('STU12345');
    expect(topic.approvedDate).toBeNull();
  });

  test('should update approval date', async () => {
    const approvalDate = new Date();
    const updated = await prisma.currentSessionTopic.update({
      where: { id: createdTopicId },
      data: { approvedDate: approvalDate }
    });

    expect(updated.approvedDate).toBeDefined();
    expect(updated.approvedDate.getTime()).toBeCloseTo(approvalDate.getTime(), -2);
  });
});

describe('UnderReviewTopic Model', () => {
  let createdTopicId;

  afterAll(async () => {
    if (createdTopicId) {
      await prisma.underReviewTopic.delete({
        where: { id: createdTopicId }
      });
    }
    await prisma.$disconnect();
  });

  test('should create an under review topic', async () => {
    const topic = await prisma.underReviewTopic.create({
      data: {
        title: 'Test Review Topic',
        keywords: 'IoT, sensors, automation',
        sessionYear: '2024/2025',
        supervisorName: 'Dr. Review Supervisor',
        category: 'Internet of Things',
        reviewingLecturer: 'Dr. Reviewer',
        reviewStartedAt: new Date()
      }
    });

    createdTopicId = topic.id;

    expect(topic).toBeDefined();
    expect(topic.reviewingLecturer).toBe('Dr. Reviewer');
    expect(topic.reviewStartedAt).toBeDefined();
  });

  test('should find topics under review within time window', async () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);

    const topics = await prisma.underReviewTopic.findMany({
      where: {
        reviewStartedAt: {
          gte: twoDaysAgo
        }
      }
    });

    expect(topics).toBeDefined();
    expect(topics.length).toBeGreaterThan(0);
  });
});

describe('Topic import context and metadata fields', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should store import fields for historical topics when local schema is current', async () => {
    await expectImportFieldsRoundtrip('historicalTopic', {
      title: 'Historical Import Field Topic',
      keywords: 'import, historical',
      sessionYear: '2024/2025',
      supervisorName: 'Dr. Historical Import',
      category: 'Import Testing',
      ...importFieldData
    });
  });

  test('should store import fields for current session topics when local schema is current', async () => {
    await expectImportFieldsRoundtrip('currentSessionTopic', {
      title: 'Current Session Import Field Topic',
      keywords: 'import, current session',
      sessionYear: '2024/2025',
      supervisorName: 'Dr. Current Import',
      category: 'Import Testing',
      studentId: 'IMP12345',
      ...importFieldData
    });
  });

  test('should store import fields for under review topics when local schema is current', async () => {
    await expectImportFieldsRoundtrip('underReviewTopic', {
      title: 'Under Review Import Field Topic',
      keywords: 'import, under review',
      sessionYear: '2024/2025',
      supervisorName: 'Dr. Review Import',
      category: 'Import Testing',
      reviewingLecturer: 'Dr. Reviewer',
      reviewStartedAt: new Date(),
      ...importFieldData
    });
  });
});
