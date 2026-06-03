import { supabase } from '../lib/supabase';
import { DEFAULT_SKILLS } from '../data/mockData';
import type {
  Lesson,
  Payment,
  ProgressSkill,
  Resource,
  Student,
  StudentProgress,
} from '../types';

function num(v: unknown): number {
  return typeof v === 'number' ? v : Number(v);
}

export async function seedDemoDataIfEmpty(): Promise<void> {
  const { error } = await supabase.rpc('seed_demo_data');
  if (error) console.error('seed_demo_data:', error.message);
}

export async function fetchInstructorData(instructorId: string) {
  const [studentsRes, lessonsRes, paymentsRes, progressRes, resourcesRes] =
    await Promise.all([
      supabase
        .from('students')
        .select('*')
        .eq('instructor_id', instructorId)
        .order('created_at', { ascending: true }),
      supabase
        .from('lessons')
        .select('*')
        .eq('instructor_id', instructorId)
        .order('start_time', { ascending: true }),
      supabase
        .from('payments')
        .select('*')
        .eq('instructor_id', instructorId)
        .order('created_at', { ascending: false }),
      supabase
        .from('student_progress')
        .select('*')
        .eq('instructor_id', instructorId),
      supabase
        .from('resources')
        .select('*')
        .eq('instructor_id', instructorId)
        .order('title', { ascending: true }),
    ]);

  const firstError =
    studentsRes.error ??
    lessonsRes.error ??
    paymentsRes.error ??
    progressRes.error ??
    resourcesRes.error;
  if (firstError) throw new Error(firstError.message);

  const students = (studentsRes.data ?? []) as Student[];
  const lessons = (lessonsRes.data ?? []) as Lesson[];
  const payments = (paymentsRes.data ?? []).map((p) => ({
    ...p,
    amount: num(p.amount),
  })) as Payment[];
  const progress = (progressRes.data ?? []).map((p) => ({
    student_id: p.student_id,
    skills: (p.skills ?? []) as ProgressSkill[],
    last_updated: p.last_updated,
  })) as StudentProgress[];
  const resources = (resourcesRes.data ?? []) as Resource[];

  return { students, lessons, payments, progress, resources };
}

export async function addStudent(
  instructorId: string,
  s: Omit<Student, 'id' | 'instructor_id' | 'created_at'>,
) {
  const { data, error } = await supabase
    .from('students')
    .insert({
      instructor_id: instructorId,
      name: s.name,
      phone: s.phone,
      theory_passed: s.theory_passed,
      status: s.status,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  const skills = DEFAULT_SKILLS.map((name) => ({ name, rating: 1 }));
  const { error: progError } = await supabase.from('student_progress').insert({
    student_id: data.id,
    instructor_id: instructorId,
    skills,
    last_updated: new Date().toISOString(),
  });
  if (progError) throw new Error(progError.message);

  return data as Student;
}

export async function updateStudent(id: string, updates: Partial<Student>) {
  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Student;
}

export async function deleteStudent(id: string) {
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function addLesson(
  instructorId: string,
  lesson: Omit<Lesson, 'id'>,
) {
  const { data, error } = await supabase
    .from('lessons')
    .insert({ ...lesson, instructor_id: instructorId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Lesson;
}

export async function updateLesson(id: string, updates: Partial<Lesson>) {
  const { data, error } = await supabase
    .from('lessons')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Lesson;
}

export async function addPayment(
  instructorId: string,
  p: Omit<Payment, 'id' | 'created_at'>,
) {
  const { data, error } = await supabase
    .from('payments')
    .insert({ ...p, instructor_id: instructorId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { ...data, amount: num(data.amount) } as Payment;
}

export async function markPaymentPaid(id: string) {
  const { data, error } = await supabase
    .from('payments')
    .update({ status: 'Paid' })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { ...data, amount: num(data.amount) } as Payment;
}

export async function updateProgress(
  instructorId: string,
  studentId: string,
  skills: ProgressSkill[],
) {
  const { data, error } = await supabase
    .from('student_progress')
    .upsert({
      student_id: studentId,
      instructor_id: instructorId,
      skills,
      last_updated: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return {
    student_id: data.student_id,
    skills: data.skills as ProgressSkill[],
    last_updated: data.last_updated,
  } as StudentProgress;
}

export async function addResource(
  instructorId: string,
  r: Omit<Resource, 'id'>,
) {
  const { data, error } = await supabase
    .from('resources')
    .insert({ ...r, instructor_id: instructorId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Resource;
}

export async function deleteResource(id: string) {
  const { error } = await supabase.from('resources').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
