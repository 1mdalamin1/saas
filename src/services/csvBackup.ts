import { supabase } from '../lib/supabase';
import { DEFAULT_SKILLS } from '../data/mockData';
import { fetchInstructorData } from './instructorData';
import type { ProgressSkill } from '../types';

const CSV_VERSION = '1';
const CSV_HEADER = [
  'record_type',
  'id',
  'student_id',
  'name',
  'phone',
  'theory_passed',
  'status',
  'created_at',
  'start_time',
  'end_time',
  'lesson_status',
  'notes',
  'amount',
  'payment_status',
  'skills_json',
  'last_updated',
  'title',
  'youtube_url',
  'category',
  'description',
] as const;

type CsvRow = Record<(typeof CSV_HEADER)[number], string>;

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function rowToLine(row: Partial<CsvRow>): string {
  return CSV_HEADER.map((col) => escapeCsv(row[col] ?? '')).join(',');
}

function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (c === '"' && next === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || (c === '\r' && next === '\n')) {
      row.push(field);
      field = '';
      if (row.some((cell) => cell.trim() !== '')) rows.push(row);
      row = [];
      if (c === '\r') i++;
    } else if (c !== '\r') {
      field += c;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell.trim() !== '')) rows.push(row);
  }

  if (rows.length === 0) return [];

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const typeIdx = header.indexOf('record_type');
  if (typeIdx === -1) throw new Error('Invalid backup file: missing record_type column');

  return rows.slice(1).map((cells) => {
    const obj: CsvRow = {} as CsvRow;
    header.forEach((key, idx) => {
      if (CSV_HEADER.includes(key as (typeof CSV_HEADER)[number])) {
        obj[key as (typeof CSV_HEADER)[number]] = cells[idx] ?? '';
      }
    });
    return obj;
  });
}

export async function exportBackupCsv(instructorId: string): Promise<string> {
  const data = await fetchInstructorData(instructorId);
  const lines: string[] = [
    `# trava_backup_version=${CSV_VERSION}`,
    CSV_HEADER.join(','),
  ];

  for (const s of data.students) {
    lines.push(
      rowToLine({
        record_type: 'student',
        id: s.id,
        name: s.name,
        phone: s.phone,
        theory_passed: String(s.theory_passed),
        status: s.status,
        created_at: s.created_at,
      }),
    );
  }

  for (const l of data.lessons) {
    lines.push(
      rowToLine({
        record_type: 'lesson',
        id: l.id,
        student_id: l.student_id,
        start_time: l.start_time,
        end_time: l.end_time,
        lesson_status: l.status,
        notes: l.notes,
      }),
    );
  }

  for (const p of data.payments) {
    lines.push(
      rowToLine({
        record_type: 'payment',
        id: p.id,
        student_id: p.student_id,
        amount: String(p.amount),
        payment_status: p.status,
        created_at: p.created_at,
      }),
    );
  }

  for (const pr of data.progress) {
    lines.push(
      rowToLine({
        record_type: 'progress',
        student_id: pr.student_id,
        skills_json: JSON.stringify(pr.skills),
        last_updated: pr.last_updated,
      }),
    );
  }

  for (const r of data.resources) {
    lines.push(
      rowToLine({
        record_type: 'resource',
        id: r.id,
        title: r.title,
        youtube_url: r.youtube_url,
        category: r.category,
        description: r.description,
      }),
    );
  }

  return `\uFEFF${lines.join('\n')}`;
}

export function downloadCsvFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function clearInstructorData(instructorId: string) {
  const { error: resErr } = await supabase
    .from('resources')
    .delete()
    .eq('instructor_id', instructorId);
  if (resErr) throw new Error(resErr.message);

  const { error: stuErr } = await supabase
    .from('students')
    .delete()
    .eq('instructor_id', instructorId);
  if (stuErr) throw new Error(stuErr.message);
}

function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function newId(): string {
  return crypto.randomUUID();
}

function parseSkills(json: string): ProgressSkill[] {
  if (!json.trim()) {
    return DEFAULT_SKILLS.map((name) => ({ name, rating: 1 }));
  }
  try {
    const parsed = JSON.parse(json) as ProgressSkill[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    /* use default */
  }
  return DEFAULT_SKILLS.map((name) => ({ name, rating: 1 }));
}

export interface ImportResult {
  students: number;
  lessons: number;
  payments: number;
  progress: number;
  resources: number;
  skipped: number;
}

export async function importBackupCsv(
  instructorId: string,
  fileText: string,
  replaceExisting: boolean,
  existingIds?: {
    students: Set<string>;
    lessons: Set<string>;
    payments: Set<string>;
    resources: Set<string>;
  },
): Promise<ImportResult> {
  const cleaned = fileText.replace(/^\uFEFF/, '').replace(/^#.*\n/m, '');
  const rows = parseCsv(cleaned);
  if (rows.length === 0) throw new Error('The CSV file has no data rows.');

  if (replaceExisting) {
    await clearInstructorData(instructorId);
  }

  const existing = existingIds ?? {
    students: new Set<string>(),
    lessons: new Set<string>(),
    payments: new Set<string>(),
    resources: new Set<string>(),
  };

  if (!replaceExisting && !existingIds) {
    const current = await fetchInstructorData(instructorId);
    existing.students = new Set(current.students.map((s) => s.id));
    existing.lessons = new Set(current.lessons.map((l) => l.id));
    existing.payments = new Set(current.payments.map((p) => p.id));
    existing.resources = new Set(current.resources.map((r) => r.id));
  }

  const studentRows = rows.filter((r) => r.record_type === 'student');
  const lessonRows = rows.filter((r) => r.record_type === 'lesson');
  const paymentRows = rows.filter((r) => r.record_type === 'payment');
  const progressRows = rows.filter((r) => r.record_type === 'progress');
  const resourceRows = rows.filter((r) => r.record_type === 'resource');

  const idMap = new Map<string, string>();
  let skipped = 0;
  const result: ImportResult = {
    students: 0,
    lessons: 0,
    payments: 0,
    progress: 0,
    resources: 0,
    skipped: 0,
  };

  for (const row of studentRows) {
    const csvId = row.id?.trim();
    if (!replaceExisting && csvId && existing.students.has(csvId)) {
      idMap.set(csvId, csvId);
      skipped++;
      continue;
    }

    const newStudentId = !replaceExisting && csvId && isValidUuid(csvId) ? csvId : newId();
    if (csvId) idMap.set(csvId, newStudentId);

    const { error } = await supabase.from('students').insert({
      id: newStudentId,
      instructor_id: instructorId,
      name: row.name?.trim() || 'Unnamed',
      phone: row.phone?.trim() || '',
      theory_passed: row.theory_passed === 'true',
      status: row.status || 'Active',
      created_at: row.created_at || new Date().toISOString(),
    });
    if (error) throw new Error(`Student import failed: ${error.message}`);
    result.students++;
  }

  for (const row of lessonRows) {
    const csvId = row.id?.trim();
    if (!replaceExisting && csvId && existing.lessons.has(csvId)) {
      skipped++;
      continue;
    }

    const oldStudentId = row.student_id?.trim();
    const studentId = oldStudentId ? idMap.get(oldStudentId) ?? oldStudentId : '';
    if (!studentId) {
      skipped++;
      continue;
    }

    let lessonId = newId();
    if (csvId && isValidUuid(csvId)) {
      if (replaceExisting || !existing.lessons.has(csvId)) lessonId = csvId;
      else {
        skipped++;
        continue;
      }
    }

    const { error } = await supabase.from('lessons').insert({
      id: lessonId,
      instructor_id: instructorId,
      student_id: studentId,
      start_time: row.start_time,
      end_time: row.end_time,
      status: row.lesson_status || 'Booked',
      notes: row.notes || '',
    });
    if (error) throw new Error(`Lesson import failed: ${error.message}`);
    result.lessons++;
  }

  for (const row of paymentRows) {
    const csvId = row.id?.trim();
    if (!replaceExisting && csvId && existing.payments.has(csvId)) {
      skipped++;
      continue;
    }

    const oldStudentId = row.student_id?.trim();
    const studentId = oldStudentId ? idMap.get(oldStudentId) ?? oldStudentId : '';
    if (!studentId) {
      skipped++;
      continue;
    }

    let paymentId = newId();
    if (csvId && isValidUuid(csvId)) {
      if (replaceExisting || !existing.payments.has(csvId)) paymentId = csvId;
      else {
        skipped++;
        continue;
      }
    }

    const { error } = await supabase.from('payments').insert({
      id: paymentId,
      instructor_id: instructorId,
      student_id: studentId,
      amount: Number(row.amount) || 0,
      status: row.payment_status || 'Due',
      created_at: row.created_at || new Date().toISOString(),
    });
    if (error) throw new Error(`Payment import failed: ${error.message}`);
    result.payments++;
  }

  for (const row of progressRows) {
    const oldStudentId = row.student_id?.trim();
    const studentId = oldStudentId ? idMap.get(oldStudentId) ?? oldStudentId : '';
    if (!studentId) {
      skipped++;
      continue;
    }

    const { error } = await supabase.from('student_progress').upsert({
      student_id: studentId,
      instructor_id: instructorId,
      skills: parseSkills(row.skills_json),
      last_updated: row.last_updated || new Date().toISOString(),
    });
    if (error) throw new Error(`Progress import failed: ${error.message}`);
    result.progress++;
  }

  for (const row of resourceRows) {
    const csvId = row.id?.trim();
    if (!replaceExisting && csvId && existing.resources.has(csvId)) {
      skipped++;
      continue;
    }

    let resourceId = newId();
    if (csvId && isValidUuid(csvId)) {
      if (replaceExisting || !existing.resources.has(csvId)) resourceId = csvId;
      else {
        skipped++;
        continue;
      }
    }

    const { error } = await supabase.from('resources').insert({
      id: resourceId,
      instructor_id: instructorId,
      title: row.title?.trim() || 'Untitled',
      youtube_url: row.youtube_url?.trim() || '',
      category: row.category?.trim() || 'Basics',
      description: row.description?.trim() || '',
    });
    if (error) throw new Error(`Resource import failed: ${error.message}`);
    result.resources++;
  }

  result.skipped = skipped;
  return result;
}
