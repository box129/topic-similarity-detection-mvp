# Topic Import Smoke Test

This guide verifies the backend topic import preview and commit endpoints with a small departmental-style `.xlsx` file.

The commit endpoint writes real rows to the configured database. Use a unique `importBatchId` for each smoke run and clean up manually if needed.

## What This Covers

- `.xlsx` file parsing
- worksheet row conversion
- import normalization and reporting
- lifecycle bucket persistence for accepted records
- incomplete row handling
- duplicate-title handling

This does not cover frontend import UI, embedding generation, authorization, or similarity scoring integration.

## Generate The Fixture

From `backend/`:

```powershell
npm run import:fixture
```

The script creates:

```text
tmp/import-fixtures/sample-topic-import.xlsx
```

It also prints the generated file path and expected preview/commit counts.

## Sample Rows

The generated workbook includes:

- a valid historical topic with full context
- a valid current-session topic
- a valid under-review topic
- an accepted topic missing optional context fields
- a row with a missing title
- a duplicate-title row
- a row with unclear `status` that should not force `lifecycle_bucket`

## Start The Backend

From `backend/`:

```powershell
npm run dev
```

The commands below assume the backend is running at `http://localhost:3000`.

## Preview Import

Preview parses and normalizes the file without database persistence.

```powershell
curl.exe -X POST http://localhost:3000/api/import/topics/preview `
  -F "file=@tmp/import-fixtures/sample-topic-import.xlsx"
```

Expected import report:

```json
{
  "total_rows": 7,
  "accepted_rows": 5,
  "skipped_rows": 2,
  "missing_title_rows": 1,
  "incomplete_context_rows": 1,
  "duplicate_title_rows": 1
}
```

## Commit Import

Commit parses, normalizes, and persists accepted rows. This writes real database records.

Use a unique batch id:

```powershell
$batchId = "smoke-import-$(Get-Date -Format yyyyMMddHHmmss)"

curl.exe -X POST http://localhost:3000/api/import/topics/commit `
  -F "file=@tmp/import-fixtures/sample-topic-import.xlsx" `
  -F "sourceType=xlsx" `
  -F "sourceFilename=sample-topic-import.xlsx" `
  -F "importBatchId=$batchId"
```

Expected persistence report when the database is available and schema is current:

```json
{
  "attempted_records": 5,
  "inserted_records": 5,
  "failed_records": 0,
  "skipped_records": 0,
  "inserted_by_bucket": {
    "historical": 3,
    "current_session": 1,
    "under_review": 1
  }
}
```

## Cleanup And Review

Review imported rows by searching for the unique `importBatchId` in Prisma Studio or directly in the database.

Cleanup is intentionally manual for now. If needed, delete rows with the chosen `import_batch_id` from:

- `historical_topics`
- `current_session_topics`
- `under_review_topics`
