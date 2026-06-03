import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  downloadCsvFile,
  exportBackupCsv,
  importBackupCsv,
  type ImportResult,
} from '../services/csvBackup';

interface ImportExportViewProps {
  onDataChanged: () => Promise<void>;
}

export default function ImportExportView({ onDataChanged }: ImportExportViewProps) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [replaceExisting, setReplaceExisting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const instructorId = user?.id;

  const handleExport = async () => {
    if (!instructorId) return;
    setExporting(true);
    setError(null);
    setMessage(null);
    try {
      const csv = await exportBackupCsv(instructorId);
      const date = new Date().toISOString().slice(0, 10);
      downloadCsvFile(`trava-backup-${date}.csv`, csv);
      setMessage('Backup downloaded successfully.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    if (!instructorId || !selectedFile) return;
    setImporting(true);
    setError(null);
    setMessage(null);
    try {
      const text = await selectedFile.text();
      const result: ImportResult = await importBackupCsv(
        instructorId,
        text,
        replaceExisting,
      );
      await onDataChanged();
      setMessage(formatImportMessage(result, replaceExisting));
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1
          className="text-2xl lg:text-3xl font-bold text-gray-900"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Import / Export
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Download a CSV backup of your students, lessons, payments, progress, and resources.
          Upload a backup file to restore or merge data.
        </p>
      </div>

      {(message || error) && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            error
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-green-50 border border-green-200 text-green-800'
          }`}
        >
          {error ?? message}
        </div>
      )}

      <section className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
        <h2
          className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Export backup
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Saves all your instructor data into one CSV file you can store safely or move to
          another account.
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting || !instructorId}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: '#1B3B2F', fontFamily: 'Manrope, sans-serif' }}
        >
          <DownloadIcon />
          {exporting ? 'Preparing file…' : 'Download CSV backup'}
        </button>
      </section>

      <section className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
        <h2
          className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Import backup
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Upload a Trava backup CSV. Choose whether imported rows replace your current data or
          are added alongside it.
        </p>

        <label className="flex items-start gap-3 cursor-pointer mb-4 p-3 rounded-xl bg-[#F5F0E6]/80 border border-black/5">
          <input
            type="checkbox"
            checked={replaceExisting}
            onChange={(e) => setReplaceExisting(e.target.checked)}
            className="mt-1 w-4 h-4 rounded accent-[#E8651C]"
          />
          <span>
            <span
              className="block text-sm font-semibold text-gray-900"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Current Data Replace?
            </span>
            <span className="block text-xs text-gray-500 mt-0.5">
              {replaceExisting
                ? 'On: your current students, lessons, payments, progress, and resources will be deleted, then replaced with the CSV.'
                : 'Off: CSV rows are added only. Existing records with the same ID are skipped.'}
            </span>
          </span>
        </label>

        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            setSelectedFile(e.target.files?.[0] ?? null);
            setMessage(null);
            setError(null);
          }}
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-xl px-4 py-2.5 text-sm font-medium border border-black/10 text-gray-700 hover:bg-gray-50"
          >
            {selectedFile ? selectedFile.name : 'Choose CSV file'}
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={importing || !selectedFile || !instructorId}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: '#E8651C', fontFamily: 'Manrope, sans-serif' }}
          >
            <UploadIcon />
            {importing ? 'Importing…' : 'Upload & import'}
          </button>
        </div>
      </section>
    </div>
  );
}

function formatImportMessage(result: ImportResult, replaced: boolean): string {
  const parts = [
    `${result.students} students`,
    `${result.lessons} lessons`,
    `${result.payments} payments`,
    `${result.progress} progress records`,
    `${result.resources} resources`,
  ];
  const mode = replaced ? 'Data replaced' : 'Data added';
  const skip =
    result.skipped > 0 ? ` (${result.skipped} duplicate rows skipped)` : '';
  return `${mode}: ${parts.join(', ')} imported.${skip}`;
}

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
