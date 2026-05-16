const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const outputDir = path.join(__dirname, '..', 'tmp', 'import-fixtures');
const outputPath = path.join(outputDir, 'sample-topic-import.xlsx');

const headers = [
  'Topic Title',
  'keywords',
  'population',
  'location',
  'study_focus',
  'lifecycle_bucket',
  'status',
  'session_year',
  'supervisor_name',
  'category',
  'student_id',
  'approved_date',
  'reviewing_lecturer',
  'review_started_at',
];

const rows = [
  {
    'Topic Title': 'Knowledge of malaria prevention among mothers in Osogbo',
    keywords: 'malaria, prevention, mothers',
    population: 'Mothers of children under five',
    location: 'Osogbo, Osun State',
    study_focus: 'Malaria prevention knowledge',
    lifecycle_bucket: 'historical',
    status: '',
    session_year: '2022/2023',
    supervisor_name: 'Dr. Adeyemi',
    category: 'Public Health',
    student_id: '',
    approved_date: '',
    reviewing_lecturer: '',
    review_started_at: '',
  },
  {
    'Topic Title': 'Use of mobile reminders for antenatal clinic attendance in Ile-Ife',
    keywords: 'mobile reminders, antenatal care, attendance',
    population: 'Pregnant women',
    location: 'Ile-Ife',
    study_focus: 'Clinic attendance support',
    lifecycle_bucket: 'current_session',
    status: '',
    session_year: '2025/2026',
    supervisor_name: 'Dr. Balogun',
    category: 'Maternal Health',
    student_id: 'STU-SMOKE-001',
    approved_date: '2026-05-01',
    reviewing_lecturer: '',
    review_started_at: '',
  },
  {
    'Topic Title': 'Factors affecting exclusive breastfeeding among nursing mothers in Ede',
    keywords: 'exclusive breastfeeding, nursing mothers, factors',
    population: 'Nursing mothers',
    location: 'Ede, Osun State',
    study_focus: 'Exclusive breastfeeding barriers',
    lifecycle_bucket: 'under_review',
    status: '',
    session_year: '2025/2026',
    supervisor_name: 'Dr. Ibrahim',
    category: 'Maternal and Child Health',
    student_id: '',
    approved_date: '',
    reviewing_lecturer: 'Dr. Ibrahim',
    review_started_at: '2026-05-16T09:00:00.000Z',
  },
  {
    'Topic Title': 'Awareness of hypertension screening among market traders',
    keywords: 'hypertension, screening, market traders',
    population: '',
    location: '',
    study_focus: '',
    lifecycle_bucket: 'historical',
    status: '',
    session_year: '2023/2024',
    supervisor_name: 'Dr. Okafor',
    category: 'Community Health',
    student_id: '',
    approved_date: '',
    reviewing_lecturer: '',
    review_started_at: '',
  },
  {
    'Topic Title': '',
    keywords: 'nutrition, students',
    population: 'Undergraduate students',
    location: 'Osun State',
    study_focus: 'Nutrition awareness',
    lifecycle_bucket: 'historical',
    status: '',
    session_year: '2024/2025',
    supervisor_name: 'Dr. Musa',
    category: 'Nutrition',
    student_id: '',
    approved_date: '',
    reviewing_lecturer: '',
    review_started_at: '',
  },
  {
    'Topic Title': ' knowledge of malaria prevention among mothers in osogbo ',
    keywords: 'malaria, mothers',
    population: 'Mothers of children under five',
    location: 'Osogbo, Osun State',
    study_focus: 'Prevention knowledge',
    lifecycle_bucket: 'historical',
    status: '',
    session_year: '2022/2023',
    supervisor_name: 'Dr. Adeyemi',
    category: 'Public Health',
    student_id: '',
    approved_date: '',
    reviewing_lecturer: '',
    review_started_at: '',
  },
  {
    'Topic Title': 'Perception of telemedicine services among rural patients',
    keywords: 'telemedicine, rural patients, perception',
    population: 'Rural patients',
    location: 'Osun State',
    study_focus: 'Telemedicine service perception',
    lifecycle_bucket: '',
    status: 'approved',
    session_year: '2025/2026',
    supervisor_name: 'Dr. Nwachukwu',
    category: 'Health Informatics',
    student_id: '',
    approved_date: '',
    reviewing_lecturer: '',
    review_started_at: '',
  },
];

const expectedPreviewReport = {
  total_rows: 7,
  accepted_rows: 5,
  skipped_rows: 2,
  missing_title_rows: 1,
  incomplete_context_rows: 1,
  duplicate_title_rows: 1,
};

const expectedCommitReport = {
  attempted_records: 5,
  inserted_records: 5,
  failed_records: 0,
  skipped_records: 0,
  inserted_by_bucket: {
    historical: 3,
    current_session: 1,
    under_review: 1,
  },
};

async function generateFixture() {
  fs.mkdirSync(outputDir, { recursive: true });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Topic Similarity MVP';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Topic Import Smoke');
  worksheet.addRow(headers);

  rows.forEach((row) => {
    worksheet.addRow(headers.map((header) => row[header]));
  });

  worksheet.columns.forEach((column) => {
    column.width = 24;
  });

  await workbook.xlsx.writeFile(outputPath);

  console.log(`Generated sample import fixture: ${outputPath}`);
  console.log('Expected preview import report:');
  console.log(JSON.stringify(expectedPreviewReport, null, 2));
  console.log('Expected commit persistence report when the database is available and current:');
  console.log(JSON.stringify(expectedCommitReport, null, 2));
  console.log('Warning: the commit endpoint writes real rows to the configured database. Use a unique importBatchId and clean up manually if needed.');
}

generateFixture().catch((error) => {
  console.error('Failed to generate sample import fixture.');
  console.error(error);
  process.exitCode = 1;
});
