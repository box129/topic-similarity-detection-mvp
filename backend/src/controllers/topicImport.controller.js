const fs = require('fs/promises');
const path = require('path');
const { normalizeTopicImportFile } = require('../services/topicImportFile.service');
const { persistNormalizedTopicImport } = require('../services/topicImportPersistence.service');

const XLSX_EXTENSION = '.xlsx';

function buildImportErrorResponse(message, errorCode, field) {
  return {
    status: 'error',
    message,
    details: {
      error_code: errorCode,
      field
    }
  };
}

function validateUploadedFile(file) {
  if (!file) {
    return buildImportErrorResponse('Import file is required.', 'MISSING_FILE', 'file');
  }

  const extension = path.extname(file.originalname || '').toLowerCase();
  if (extension !== XLSX_EXTENSION) {
    return buildImportErrorResponse('Only .xlsx import files are supported.', 'UNSUPPORTED_FILE_TYPE', 'file');
  }

  return null;
}

function buildImportOptions(req) {
  return {
    sheetName: req.body?.sheetName || undefined
  };
}

function buildPersistenceOptions(req) {
  return {
    sourceType: req.body?.sourceType || 'xlsx',
    sourceFilename: req.body?.sourceFilename || req.file?.originalname || null,
    importBatchId: req.body?.importBatchId || `import-${Date.now()}`
  };
}

async function cleanupUploadedFile(file) {
  if (!file?.path) {
    return;
  }

  try {
    await fs.unlink(file.path);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

function sendWorksheetNotFoundResponse(res) {
  return res.status(400).json(
    buildImportErrorResponse('Worksheet not found.', 'WORKSHEET_NOT_FOUND', 'sheetName')
  );
}

async function previewTopicImport(req, res, next) {
  try {
    const fileError = validateUploadedFile(req.file);
    if (fileError) {
      return res.status(400).json(fileError);
    }

    const result = await normalizeTopicImportFile(req.file.path, buildImportOptions(req));

    return res.status(200).json({
      status: 'success',
      data: {
        mode: 'preview',
        metadata: result.metadata,
        records: result.records,
        import_report: result.report
      }
    });
  } catch (error) {
    if (error.message === 'worksheet not found') {
      return sendWorksheetNotFoundResponse(res);
    }

    return next(error);
  } finally {
    try {
      await cleanupUploadedFile(req.file);
    } catch (error) {
      next(error);
    }
  }
}

async function commitTopicImport(req, res, next) {
  try {
    const fileError = validateUploadedFile(req.file);
    if (fileError) {
      return res.status(400).json(fileError);
    }

    const importResult = await normalizeTopicImportFile(req.file.path, buildImportOptions(req));
    const persistenceReport = await persistNormalizedTopicImport(
      importResult.records,
      buildPersistenceOptions(req)
    );

    return res.status(200).json({
      status: 'success',
      data: {
        mode: 'commit',
        metadata: importResult.metadata,
        import_report: importResult.report,
        persistence_report: persistenceReport
      }
    });
  } catch (error) {
    if (error.message === 'worksheet not found') {
      return sendWorksheetNotFoundResponse(res);
    }

    return next(error);
  } finally {
    try {
      await cleanupUploadedFile(req.file);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = {
  previewTopicImport,
  commitTopicImport,
  cleanupUploadedFile,
  buildImportErrorResponse
};
