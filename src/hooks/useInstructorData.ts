import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import * as api from '../services/instructorData';
import type {
  Lesson,
  Payment,
  ProgressSkill,
  Resource,
  Student,
  StudentProgress,
} from '../types';

export function useInstructorData() {
  const { user } = useAuth();
  const instructorId = user?.id ?? null;

  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!instructorId) return;
    const data = await api.fetchInstructorData(instructorId);
    setStudents(data.students);
    setLessons(data.lessons);
    setPayments(data.payments);
    setProgress(data.progress);
    setResources(data.resources);
  }, [instructorId]);

  useEffect(() => {
    if (!instructorId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { count, error: countErr } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('instructor_id', instructorId);

        if (countErr) throw new Error(countErr.message);
        if (count === 0) await api.seedDemoDataIfEmpty();

        if (!cancelled) await reload();
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [instructorId, reload]);

  const run = useCallback(
    async (action: () => Promise<void>) => {
      await action();
      await reload();
    },
    [reload],
  );

  const addStudent = useCallback(
    async (s: Omit<Student, 'id' | 'instructor_id' | 'created_at'>) => {
      if (!instructorId) return;
      await run(() => api.addStudent(instructorId, s).then(() => undefined));
    },
    [instructorId, run],
  );

  const updateStudent = useCallback(
    async (id: string, updates: Partial<Student>) => {
      await run(() => api.updateStudent(id, updates).then(() => undefined));
    },
    [run],
  );

  const deleteStudent = useCallback(
    async (id: string) => {
      await run(() => api.deleteStudent(id).then(() => undefined));
    },
    [run],
  );

  const addLesson = useCallback(
    async (lesson: Omit<Lesson, 'id'>) => {
      if (!instructorId) return;
      await run(() => api.addLesson(instructorId, lesson).then(() => undefined));
    },
    [instructorId, run],
  );

  const updateLesson = useCallback(
    async (id: string, updates: Partial<Lesson>) => {
      await run(() => api.updateLesson(id, updates).then(() => undefined));
    },
    [run],
  );

  const addPayment = useCallback(
    async (p: Omit<Payment, 'id' | 'created_at'>) => {
      if (!instructorId) return;
      await run(() => api.addPayment(instructorId, p).then(() => undefined));
    },
    [instructorId, run],
  );

  const markPaid = useCallback(
    async (id: string) => {
      await run(() => api.markPaymentPaid(id).then(() => undefined));
    },
    [run],
  );

  const updateProgress = useCallback(
    async (studentId: string, skills: ProgressSkill[]) => {
      if (!instructorId) return;
      await run(() =>
        api.updateProgress(instructorId, studentId, skills).then(() => undefined),
      );
    },
    [instructorId, run],
  );

  const addResource = useCallback(
    async (r: Omit<Resource, 'id'>) => {
      if (!instructorId) return;
      await run(() => api.addResource(instructorId, r).then(() => undefined));
    },
    [instructorId, run],
  );

  const deleteResource = useCallback(
    async (id: string) => {
      await run(() => api.deleteResource(id).then(() => undefined));
    },
    [run],
  );

  return {
    students,
    lessons,
    payments,
    progress,
    resources,
    loading,
    error,
    reload,
    addStudent,
    updateStudent,
    deleteStudent,
    addLesson,
    updateLesson,
    addPayment,
    markPaid,
    updateProgress,
    addResource,
    deleteResource,
  };
}
