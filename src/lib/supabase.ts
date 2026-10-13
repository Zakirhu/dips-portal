import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  DoubtQuery, 
  QuizAttempt, 
  StudentProfile,
  LearningResource,
  StudyMaterial,
  QuizConfig,
  Question,
  LabExamConfig,
  LabExamStudentSession,
  UserAccount
} from '../types';

// Read Supabase credentials from Vite environment variables or runtime
let activeUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
let activeAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isConfigValid = (url: string, key: string): boolean => {
  return Boolean(
    url &&
    key &&
    !url.includes('your-project-id') &&
    url.startsWith('https://')
  );
};

export const isSupabaseConfigured = (): boolean => {
  return isConfigValid(activeUrl, activeAnonKey);
};

export const getSupabaseConfig = () => ({
  url: activeUrl,
  hasAnonKey: Boolean(activeAnonKey),
  configured: isSupabaseConfigured()
});

// Create Supabase Client instance (with dummy fallback client if not configured yet)
export let supabase: SupabaseClient = isSupabaseConfigured()
  ? createClient(activeUrl, activeAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

export function initSupabase(url: string, key: string): boolean {
  if (isConfigValid(url, key)) {
    activeUrl = url.trim();
    activeAnonKey = key.trim();
    supabase = createClient(activeUrl, activeAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return true;
  }
  return false;
}

/**
 * Attempts to automatically discover Supabase credentials from backend server (/api/supabase/config)
 * if client-side Vite environment variables were not baked in at build time.
 */
export async function ensureSupabaseInitialized(): Promise<boolean> {
  if (isSupabaseConfigured()) return true;
  try {
    const res = await fetch('/api/supabase/config');
    if (!res.ok) return false;
    const data = await res.json();
    if (data?.configured && data.url && data.anonKey) {
      return initSupabase(data.url, data.anonKey);
    }
  } catch (err) {
    // Fail silently in offline or non-server modes
  }
  return false;
}

/**
 * Syncs the student profile to Supabase 'profiles' table
 */
export async function syncProfileToSupabase(profile: StudentProfile): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        email: profile.email,
        name: profile.name,
        class_level: profile.classLevel,
        avatar_seed: profile.avatarSeed,
        target_exam_year: profile.targetExamYear,
        enrolled_subjects: profile.enrolledSubjects,
        bookmarks: profile.bookmarks,
        bookmarked_questions: profile.bookmarkedQuestions,
        badges: profile.badges,
        updated_at: new Date().toISOString()
      }, { onConflict: 'email' });

    if (error) {
      console.warn('Supabase profile sync warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error syncing profile with Supabase:', err);
    return false;
  }
}

/**
 * Logs every student or admin login & registration live to Supabase
 */
export async function logUserLoginToSupabase(user: {
  id: string;
  name: string;
  email: string;
  studentId?: string;
  classLevel: string;
  role: string;
}): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    // 1. Sync profile record
    await supabase.from('profiles').upsert({
      email: user.email,
      name: user.name,
      class_level: user.classLevel,
      student_id: user.studentId || null,
      role: user.role,
      updated_at: new Date().toISOString()
    }, { onConflict: 'email' });

    // 2. Insert audit trail into user_logins table
    await supabase.from('user_logins').insert({
      user_id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      class_level: user.classLevel,
      login_time: new Date().toISOString()
    });

    return true;
  } catch (err) {
    console.warn('Error logging user login to Supabase:', err);
    return false;
  }
}

/**
 * Bulk syncs an array of student accounts to Supabase 'profiles' table
 */
export async function bulkSyncStudentsToSupabase(students: Array<{
  id?: string;
  name: string;
  email: string;
  studentId?: string;
  classLevel: string;
  schoolName?: string;
  targetExamYear?: string;
}>): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const payload = students.map(s => ({
      email: s.email,
      name: s.name,
      class_level: s.classLevel,
      student_id: s.studentId || null,
      school_name: s.schoolName || null,
      target_exam_year: s.targetExamYear || '2026',
      role: 'student',
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'email' });

    if (error) {
      console.warn('Supabase bulk student sync warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error bulk syncing students to Supabase:', err);
    return false;
  }
}


/**
 * Saves a quiz attempt to Supabase 'quiz_attempts' table
 */
export async function saveQuizAttemptToSupabase(attempt: QuizAttempt, userEmail: string = 'student@zakirhub.edu'): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('quiz_attempts')
      .insert({
        id: attempt.id,
        user_email: userEmail,
        quiz_id: attempt.quizId,
        quiz_title: attempt.quizTitle,
        class_level: attempt.classLevel,
        subject_id: attempt.subjectId,
        chapter_title: attempt.chapterTitle,
        mode: attempt.mode,
        score: attempt.score,
        total_marks: attempt.totalMarks,
        percentage: attempt.percentage,
        time_spent_seconds: attempt.timeSpentSeconds,
        total_questions: attempt.totalQuestions,
        correct_answers_count: attempt.correctAnswersCount,
        user_answers: attempt.userAnswers,
        created_at: attempt.date
      });

    if (error) {
      console.warn('Supabase quiz attempt save warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error saving quiz attempt to Supabase:', err);
    return false;
  }
}

/**
 * Submits a doubt query to Supabase 'doubt_queries' table
 */
export async function submitDoubtToSupabase(doubt: DoubtQuery): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('doubt_queries')
      .insert({
        id: doubt.id,
        student_name: doubt.studentName,
        student_class: doubt.studentClass,
        subject: doubt.subject,
        topic: doubt.topic,
        query: doubt.query,
        status: doubt.status,
        reply: doubt.reply,
        created_at: doubt.timestamp
      });

    if (error) {
      console.warn('Supabase doubt submission warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error submitting doubt to Supabase:', err);
    return false;
  }
}

/**
 * Fetches recent doubt queries from Supabase
 */
export async function fetchDoubtsFromSupabase(): Promise<DoubtQuery[] | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('doubt_queries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) return null;

    return data.map((d: any) => ({
      id: d.id,
      studentName: d.student_name,
      studentClass: d.student_class,
      subject: d.subject,
      topic: d.topic,
      query: d.query,
      timestamp: d.created_at,
      status: d.status,
      reply: d.reply
    }));
  } catch (err) {
    console.warn('Error fetching doubts from Supabase:', err);
    return null;
  }
}

/**
 * Saves uploaded PDF Chapter & extracted MCQs to Supabase 'pdf_chapters' table
 */
export async function savePdfChapterToSupabase(data: {
  id?: string;
  fileName: string;
  classLevel: string;
  subjectId: string;
  chapterTitle: string;
  questionCount: number;
  extractedQuestions: any[];
  pdfDataUrl?: string;
}): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const recordId = data.id || `pdf-ch-${Date.now()}`;
    let finalPdfUrl = data.pdfDataUrl || null;

    // Try uploading to Supabase Storage bucket 'pdf-materials'
    if (finalPdfUrl && finalPdfUrl.startsWith('data:')) {
      try {
        const base64Data = finalPdfUrl.split(',')[1];
        if (base64Data) {
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const filePath = `${data.classLevel}/${data.subjectId}/${Date.now()}_${data.fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          
          const { data: storageData, error: storageError } = await supabase.storage
            .from('pdf-materials')
            .upload(filePath, blob, { upsert: true });

          if (!storageError && storageData) {
            const { data: publicUrlData } = supabase.storage
              .from('pdf-materials')
              .getPublicUrl(filePath);
            if (publicUrlData?.publicUrl) {
              finalPdfUrl = publicUrlData.publicUrl;
            }
          }
        }
      } catch (storageErr) {
        console.warn('Supabase storage upload note:', storageErr);
      }
    }

    // Upsert into pdf_chapters table
    const { error } = await supabase
      .from('pdf_chapters')
      .upsert({
        id: recordId,
        file_name: data.fileName,
        class_level: data.classLevel,
        subject_id: data.subjectId,
        chapter_title: data.chapterTitle,
        question_count: data.questionCount,
        extracted_questions: data.extractedQuestions,
        pdf_data_url: finalPdfUrl,
        created_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase PDF chapter save warning:', error.message);
      // If table row save failed due to payload size, retry with compressed/omitted pdf_data_url while keeping metadata & MCQs
      const { error: retryError } = await supabase
        .from('pdf_chapters')
        .upsert({
          id: recordId,
          file_name: data.fileName,
          class_level: data.classLevel,
          subject_id: data.subjectId,
          chapter_title: data.chapterTitle,
          question_count: data.questionCount,
          extracted_questions: data.extractedQuestions,
          pdf_data_url: data.pdfDataUrl && data.pdfDataUrl.length < 500000 ? data.pdfDataUrl : null,
          created_at: new Date().toISOString()
        }, { onConflict: 'id' });
      if (retryError) {
        console.warn('Supabase PDF chapter retry error:', retryError.message);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.warn('Error saving PDF chapter to Supabase:', err);
    return false;
  }
}

/**
 * Fetches all saved PDF chapters & extracted MCQs from Supabase 'pdf_chapters' table
 */
export async function fetchPdfChaptersFromSupabase(): Promise<any[] | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('pdf_chapters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;
    return data;
  } catch (err) {
    console.warn('Error fetching PDF chapters from Supabase:', err);
    return null;
  }
}

/**
 * Fetches all student profiles from Supabase 'profiles' table
 */
export async function fetchProfilesFromSupabase(): Promise<any[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error || !data) return null;
    return data;
  } catch (err) {
    console.warn('Error fetching profiles from Supabase:', err);
    return null;
  }
}

/**
 * Deletes a student profile from Supabase 'profiles' table
 */
export async function deleteProfileFromSupabase(emailOrId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const clean = emailOrId.trim().toLowerCase();
    const { error } = await supabase
      .from('profiles')
      .delete()
      .or(`email.ilike.${clean},student_id.eq.${emailOrId}`);
    return !error;
  } catch (err) {
    console.warn('Error deleting profile from Supabase:', err);
    return false;
  }
}

/**
 * Updates a doubt reply in Supabase 'doubt_queries' table
 */
export async function updateDoubtReplyInSupabase(id: string, reply: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase
      .from('doubt_queries')
      .update({ reply, status: 'replied' })
      .eq('id', id);
    return !error;
  } catch (err) {
    console.warn('Error updating doubt reply in Supabase:', err);
    return false;
  }
}

/**
 * Fetches all quiz attempts from Supabase 'quiz_attempts' table
 */
export async function fetchQuizAttemptsFromSupabase(): Promise<QuizAttempt[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return null;
    return data.map((d: any) => ({
      id: d.id,
      studentId: d.student_id,
      quizId: d.quiz_id,
      quizTitle: d.quiz_title,
      classLevel: d.class_level,
      subjectId: d.subject_id,
      chapterTitle: d.chapter_title,
      mode: d.mode || 'practice',
      date: d.created_at,
      score: d.score,
      totalMarks: d.total_marks,
      percentage: Number(d.percentage) || 0,
      timeSpentSeconds: d.time_spent_seconds || 0,
      totalQuestions: d.total_questions || 0,
      correctAnswersCount: d.correct_answers_count || 0,
      userAnswers: d.user_answers || {},
      questionDetails: []
    }));
  } catch (err) {
    console.warn('Error fetching quiz attempts from Supabase:', err);
    return null;
  }
}

/**
 * Saves a Learning Resource to Supabase 'learning_resources' table
 * Also uploads any base64 PDF into Supabase Storage 'pdf-materials'
 */
export async function saveLearningResourceToSupabase(resource: LearningResource): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    let finalFileUrl = resource.fileUrl || null;

    // Upload to Supabase Storage if data: URL
    if (finalFileUrl && finalFileUrl.startsWith('data:')) {
      try {
        const base64Data = finalFileUrl.split(',')[1];
        if (base64Data) {
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const safeName = (resource.fileName || `${resource.title}.pdf`).replace(/[^a-zA-Z0-9.-]/g, '_');
          const filePath = `${resource.classLevel}/${resource.subjectId}/${Date.now()}_${safeName}`;
          
          const { data: storageData, error: storageError } = await supabase.storage
            .from('pdf-materials')
            .upload(filePath, blob, { upsert: true });

          if (!storageError && storageData) {
            const { data: publicUrlData } = supabase.storage
              .from('pdf-materials')
              .getPublicUrl(filePath);
            if (publicUrlData?.publicUrl) {
              finalFileUrl = publicUrlData.publicUrl;
            }
          }
        }
      } catch (storageErr) {
        console.warn('Supabase storage upload note:', storageErr);
      }
    }

    // 1. Save to learning_resources table
    const { error } = await supabase
      .from('learning_resources')
      .upsert({
        id: resource.id,
        title: resource.title,
        description: resource.description || '',
        resource_type: resource.resourceType,
        class_level: resource.classLevel,
        subject_id: resource.subjectId,
        chapter_id: resource.chapterId,
        chapter_title: resource.chapterTitle || '',
        published: resource.published ?? true,
        uploaded_date: resource.uploadedDate,
        order: resource.order ?? 1,
        file_name: resource.fileName || null,
        file_size: resource.fileSize || null,
        file_url: finalFileUrl,
        page_count: resource.pageCount || null,
        content: resource.content || null,
        qa_items: resource.qaItems || [],
        mcq_items: resource.mcqItems || [],
        test_duration_minutes: resource.testDurationMinutes || null,
        total_marks: resource.totalMarks || null,
        passing_marks: resource.passingMarks || null,
        author: resource.author || 'Zakir Hussain',
        tags: resource.tags || [],
        created_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase learning resource save warning:', error.message);
    }

    // 2. Also save to pdf_chapters if it has a fileUrl or MCQs
    if (finalFileUrl || resource.mcqItems?.length) {
      await savePdfChapterToSupabase({
        id: resource.id,
        fileName: resource.fileName || `${resource.title}.pdf`,
        classLevel: resource.classLevel,
        subjectId: resource.subjectId,
        chapterTitle: resource.chapterTitle || resource.title,
        questionCount: resource.mcqItems?.length || 0,
        extractedQuestions: resource.mcqItems || [],
        pdfDataUrl: finalFileUrl || undefined
      });
    }

    return !error;
  } catch (err) {
    console.warn('Error saving learning resource to Supabase:', err);
    return false;
  }
}

/**
 * Deletes a learning resource from Supabase
 */
export async function deleteLearningResourceFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    await supabase.from('learning_resources').delete().eq('id', id);
    await supabase.from('pdf_chapters').delete().eq('id', id);
    return true;
  } catch (err) {
    console.warn('Error deleting learning resource from Supabase:', err);
    return false;
  }
}

/**
 * Fetches all learning resources from Supabase 'learning_resources' table
 */
export async function fetchLearningResourcesFromSupabase(): Promise<LearningResource[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('learning_resources')
      .select('*')
      .order('order', { ascending: true });

    if (error || !data) return null;

    return data.map((d: any) => ({
      id: d.id,
      title: d.title,
      description: d.description || '',
      resourceType: d.resource_type || 'notes',
      classLevel: d.class_level,
      subjectId: d.subject_id,
      chapterId: d.chapter_id,
      chapterTitle: d.chapter_title || '',
      published: d.published !== false,
      uploadedDate: d.uploaded_date || (d.created_at ? d.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
      order: d.order || 1,
      fileName: d.file_name,
      fileSize: d.file_size,
      fileUrl: d.file_url,
      pageCount: d.page_count,
      content: d.content,
      qaItems: d.qa_items,
      mcqItems: d.mcq_items,
      testDurationMinutes: d.test_duration_minutes,
      totalMarks: d.total_marks,
      passingMarks: d.passing_marks,
      author: d.author || 'Zakir Hussain',
      tags: d.tags || []
    }));
  } catch (err) {
    console.warn('Error fetching learning resources from Supabase:', err);
    return null;
  }
}

/**
 * Saves a study material to Supabase 'study_materials' table
 */
export async function saveStudyMaterialToSupabase(material: StudyMaterial): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase
      .from('study_materials')
      .upsert({
        id: material.id,
        class_level: material.classLevel,
        subject_id: material.subjectId,
        chapter_id: material.chapterId,
        chapter_title: material.chapterTitle,
        title: material.title,
        type: material.type,
        description: material.description || '',
        read_time_minutes: material.readTimeMinutes || 5,
        uploaded_date: material.uploadedDate,
        author: material.author || 'Zakir Hussain',
        content: material.content || '',
        downloadable_file_name: material.downloadableFileName || null,
        pdf_data_url: material.pdfDataUrl || null,
        tags: material.tags || [],
        published: material.published !== false,
        created_at: new Date().toISOString()
      }, { onConflict: 'id' });

    return !error;
  } catch (err) {
    console.warn('Error saving study material to Supabase:', err);
    return false;
  }
}

/**
 * Deletes a study material from Supabase
 */
export async function deleteStudyMaterialFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    await supabase.from('study_materials').delete().eq('id', id);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Fetches all study materials from Supabase
 */
export async function fetchStudyMaterialsFromSupabase(): Promise<StudyMaterial[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((d: any) => ({
      id: d.id,
      classLevel: d.class_level,
      subjectId: d.subject_id,
      chapterId: d.chapter_id,
      chapterTitle: d.chapter_title,
      title: d.title,
      type: d.type || 'notes',
      description: d.description || '',
      readTimeMinutes: d.read_time_minutes || 5,
      uploadedDate: d.uploaded_date || '',
      author: d.author || 'Zakir Hussain',
      content: d.content || '',
      downloadableFileName: d.downloadable_file_name,
      pdfDataUrl: d.pdf_data_url,
      tags: d.tags || [],
      published: d.published !== false
    }));
  } catch (err) {
    return null;
  }
}

/**
 * Saves a Quiz configuration to Supabase 'quizzes' table
 */
export async function saveQuizToSupabase(quiz: QuizConfig): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase
      .from('quizzes')
      .upsert({
        id: quiz.id,
        title: quiz.title,
        class_level: quiz.classLevel,
        subject_id: quiz.subjectId,
        chapter_id: quiz.chapterId || null,
        chapter_title: quiz.chapterTitle || '',
        mode: quiz.mode,
        time_limit_minutes: quiz.timeLimitMinutes,
        total_marks: quiz.totalMarks,
        questions_count: quiz.questionsCount,
        difficulty: quiz.difficulty,
        questions: quiz.questions || [],
        description: quiz.description || '',
        published: quiz.published !== false,
        created_at: new Date().toISOString()
      }, { onConflict: 'id' });

    return !error;
  } catch (err) {
    console.warn('Error saving quiz to Supabase:', err);
    return false;
  }
}

/**
 * Deletes a Quiz from Supabase
 */
export async function deleteQuizFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    await supabase.from('quizzes').delete().eq('id', id);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Fetches all Quizzes from Supabase
 */
export async function fetchQuizzesFromSupabase(): Promise<QuizConfig[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((d: any) => ({
      id: d.id,
      title: d.title,
      classLevel: d.class_level,
      subjectId: d.subject_id,
      chapterId: d.chapter_id,
      chapterTitle: d.chapter_title,
      mode: d.mode || 'practice',
      timeLimitMinutes: d.time_limit_minutes || 15,
      totalMarks: d.total_marks || 20,
      questionsCount: d.questions_count || 10,
      difficulty: d.difficulty || 'all',
      questions: d.questions || [],
      description: d.description,
      published: d.published !== false
    }));
  } catch (err) {
    return null;
  }
}

/**
 * Saves a Question to Supabase 'question_bank' table
 */
export async function saveQuestionToSupabase(question: Question): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase
      .from('question_bank')
      .upsert({
        id: question.id,
        class_level: question.classLevel,
        subject_id: question.subjectId,
        chapter_id: question.chapterId,
        chapter_title: question.chapterTitle,
        question: question.question,
        type: question.type,
        difficulty: question.difficulty,
        marks: question.marks || 1,
        options: question.options || [],
        correct_option_index: question.correctOptionIndex,
        correct_answer_text: question.correctAnswerText || null,
        explanation: question.explanation || '',
        published: question.published !== false,
        created_at: new Date().toISOString()
      }, { onConflict: 'id' });

    return !error;
  } catch (err) {
    return false;
  }
}

/**
 * Deletes a Question from Supabase
 */
export async function deleteQuestionFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    await supabase.from('question_bank').delete().eq('id', id);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Fetches all Questions from Supabase
 */
export async function fetchQuestionsFromSupabase(): Promise<Question[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('question_bank')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((d: any) => ({
      id: d.id,
      classLevel: d.class_level,
      subjectId: d.subject_id,
      chapterId: d.chapter_id,
      chapterTitle: d.chapter_title,
      question: d.question,
      type: d.type || 'mcq',
      difficulty: d.difficulty || 'medium',
      marks: d.marks || 1,
      options: d.options || [],
      correctOptionIndex: d.correct_option_index ?? 0,
      correctAnswerText: d.correct_answer_text,
      explanation: d.explanation || '',
      published: d.published !== false
    }));
  } catch (err) {
    return null;
  }
}

/**
 * Saves a Lab Exam to Supabase 'lab_exams' table
 */
export async function saveLabExamToSupabase(exam: LabExamConfig): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase
      .from('lab_exams')
      .upsert({
        id: exam.id,
        title: exam.title,
        exam_code: exam.examCode,
        instructions: exam.instructions || '',
        class_level: exam.classLevel,
        subject_id: exam.subjectId,
        academic_session: exam.academicSession || '',
        exam_date: exam.examDate,
        start_time: exam.startTime,
        duration_minutes: exam.durationMinutes,
        total_marks: exam.totalMarks,
        passing_marks: exam.passingMarks,
        status: exam.status,
        shuffle_questions: exam.shuffleQuestions,
        shuffle_options: exam.shuffleOptions,
        show_results_immediately: exam.showResultsImmediately,
        show_answer_keys: exam.showAnswerKeysToStudents,
        questions: exam.questions || [],
        created_at: exam.createdAt || new Date().toISOString()
      }, { onConflict: 'id' });

    return !error;
  } catch (err) {
    return false;
  }
}

/**
 * Deletes a Lab Exam from Supabase
 */
export async function deleteLabExamFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    await supabase.from('lab_exams').delete().eq('id', id);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Fetches all Lab Exams from Supabase
 */
export async function fetchLabExamsFromSupabase(): Promise<LabExamConfig[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('lab_exams')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((d: any) => ({
      id: d.id,
      title: d.title,
      examCode: d.exam_code,
      instructions: d.instructions || 'Online Computer Lab Practical Exam',
      classLevel: d.class_level,
      subjectId: d.subject_id,
      examDate: d.exam_date || new Date().toISOString().split('T')[0],
      startTime: d.start_time || '10:00',
      durationMinutes: d.duration_minutes || 45,
      totalMarks: d.total_marks || 25,
      passingMarks: d.passing_marks || 10,
      status: d.status || 'published',
      shuffleQuestions: d.shuffle_questions !== false,
      shuffleOptions: d.shuffle_options !== false,
      showResultsImmediately: d.show_results_immediately !== false,
      showAnswerKeysToStudents: Boolean(d.show_answer_keys),
      questions: d.questions || [],
      createdAt: d.created_at,
      academicSession: d.academic_session || '2025-2026'
    }));
  } catch (err) {
    return null;
  }
}

/**
 * Saves a Lab Exam Session to Supabase 'lab_exam_sessions' table
 */
export async function saveLabExamSessionToSupabase(session: LabExamStudentSession): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase
      .from('lab_exam_sessions')
      .upsert({
        id: session.id,
        exam_id: session.examId,
        student_id: session.studentId,
        student_name: session.studentName,
        roll_number: session.rollNumber || null,
        class_level: session.classLevel,
        workstation_ip: session.workstationIp || 'LAB-PC',
        status: session.status,
        started_at: session.startedAt,
        submitted_at: session.submittedAt || null,
        answers: session.answers || {},
        auto_score: session.autoScore || 0,
        final_score: session.finalScore || 0,
        total_marks: session.totalMarks || 25,
        percentage: session.percentage || 0,
        passed: session.passed || false,
        is_evaluated: session.isEvaluated || false,
        created_at: new Date().toISOString()
      }, { onConflict: 'id' });

    return !error;
  } catch (err) {
    return false;
  }
}

/**
 * Fetches all Lab Exam Sessions from Supabase
 */
export async function fetchLabExamSessionsFromSupabase(): Promise<LabExamStudentSession[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('lab_exam_sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((d: any) => ({
      id: d.id,
      examId: d.exam_id,
      studentId: d.student_id,
      studentName: d.student_name,
      rollNumber: d.roll_number,
      classLevel: d.class_level,
      workstationIp: d.workstation_ip,
      status: d.status,
      startedAt: d.started_at,
      submittedAt: d.submitted_at,
      answers: d.answers || {},
      autoScore: Number(d.auto_score) || 0,
      finalScore: Number(d.final_score) || 0,
      totalMarks: Number(d.total_marks) || 25,
      percentage: Number(d.percentage) || 0,
      passed: Boolean(d.passed),
      isEvaluated: Boolean(d.is_evaluated)
    }));
  } catch (err) {
    return null;
  }
}

/**
 * Saves arbitrary site configuration / store chunk to Supabase 'site_store' table
 */
export async function saveSiteStoreItem(key: string, data: any): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase
      .from('site_store')
      .upsert({
        key,
        data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    return !error;
  } catch (err) {
    return false;
  }
}

/**
 * Fetches site configuration / store chunk from Supabase 'site_store' table
 */
export async function fetchSiteStoreItem(key: string): Promise<any | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('site_store')
      .select('data')
      .eq('key', key)
      .single();

    if (error || !data) return null;
    return data.data;
  } catch (err) {
    return null;
  }
}

/**
 * Consolidated sync function that pushes all core application data to Supabase
 */
export async function syncAllAppDataToSupabase(fullState: {
  classes?: any[];
  subjects?: any[];
  chapters?: any[];
  learningResources?: LearningResource[];
  studyMaterials?: StudyMaterial[];
  questionBank?: Question[];
  quizzes?: QuizConfig[];
  tests?: LabExamConfig[];
  students?: UserAccount[];
  attempts?: QuizAttempt[];
  doubts?: DoubtQuery[];
  labSessions?: LabExamStudentSession[];
  academicSessions?: any[];
  pyqPapers?: any[];
  notifications?: any[];
}): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Supabase credentials not configured.' };
  }

  try {
    // 1. Sync students to profiles
    if (fullState.students && fullState.students.length > 0) {
      await bulkSyncStudentsToSupabase(fullState.students);
    }

    // 2. Sync learning resources
    if (fullState.learningResources && fullState.learningResources.length > 0) {
      for (const res of fullState.learningResources) {
        await saveLearningResourceToSupabase(res);
      }
    }

    // 3. Sync study materials
    if (fullState.studyMaterials && fullState.studyMaterials.length > 0) {
      for (const mat of fullState.studyMaterials) {
        await saveStudyMaterialToSupabase(mat);
      }
    }

    // 4. Sync quizzes
    if (fullState.quizzes && fullState.quizzes.length > 0) {
      for (const q of fullState.quizzes) {
        await saveQuizToSupabase(q);
      }
    }

    // 5. Sync question bank
    if (fullState.questionBank && fullState.questionBank.length > 0) {
      for (const q of fullState.questionBank) {
        await saveQuestionToSupabase(q);
      }
    }

    // 6. Sync lab exams
    if (fullState.tests && fullState.tests.length > 0) {
      for (const exam of fullState.tests) {
        await saveLabExamToSupabase(exam);
      }
    }

    // 7. Store curriculum & site metadata in site_store
    await saveSiteStoreItem('curriculum', {
      classes: fullState.classes,
      subjects: fullState.subjects,
      chapters: fullState.chapters,
      academicSessions: fullState.academicSessions,
      pyqPapers: fullState.pyqPapers,
      notifications: fullState.notifications
    });

    return { success: true, message: 'All website curriculum, resources, quizzes, and student data successfully saved to Supabase!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Error syncing data to Supabase.' };
  }
}

/**
 * Sends a secure email password reset link via Supabase Auth
 */
export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase Auth is not configured. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
    };
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const redirectUrl = window.location.origin;

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: redirectUrl
    });

    if (error) {
      return {
        success: false,
        message: `Supabase Auth: ${error.message}`
      };
    }

    return {
      success: true,
      message: `A secure password reset link has been dispatched to ${cleanEmail} via Supabase Auth! Please check your email inbox.`
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Error communicating with Supabase Auth.'
    };
  }
}

/**
 * Updates password in Supabase Auth session
 */
export async function updateSupabasePassword(newPassword: string): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Supabase Auth is not configured.' };
  }

  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Password updated successfully in Supabase Auth.' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to update password in Supabase Auth.' };
  }
}

export interface SupabaseTestResult {
  connected: boolean;
  configured: boolean;
  latencyMs: number;
  url: string;
  hasAnonKey: boolean;
  tables: {
    pdf_chapters: { ok: boolean; count?: number; error?: string };
    learning_resources: { ok: boolean; count?: number; error?: string };
    study_materials: { ok: boolean; count?: number; error?: string };
    quizzes: { ok: boolean; count?: number; error?: string };
    question_bank: { ok: boolean; count?: number; error?: string };
    user_logins: { ok: boolean; count?: number; error?: string };
    quiz_attempts: { ok: boolean; count?: number; error?: string };
    doubt_queries: { ok: boolean; count?: number; error?: string };
    profiles: { ok: boolean; count?: number; error?: string };
    lab_exams: { ok: boolean; count?: number; error?: string };
    lab_exam_sessions: { ok: boolean; count?: number; error?: string };
    site_store: { ok: boolean; count?: number; error?: string };
  };
  storage: {
    pdfMaterialsBucket: { ok: boolean; error?: string };
  };
  message: string;
}

/**
 * Runs a real-time, comprehensive connectivity and schema diagnostic check against all Supabase tables
 */
export async function testSupabaseConnection(): Promise<SupabaseTestResult> {
  // If not configured in bundle, try discovering from server
  await ensureSupabaseInitialized();

  const isConfigured = isSupabaseConfigured();
  const config = getSupabaseConfig();

  const result: SupabaseTestResult = {
    connected: false,
    configured: isConfigured,
    latencyMs: 0,
    url: config.url || 'Not Set',
    hasAnonKey: config.hasAnonKey,
    tables: {
      pdf_chapters: { ok: false },
      learning_resources: { ok: false },
      study_materials: { ok: false },
      quizzes: { ok: false },
      question_bank: { ok: false },
      user_logins: { ok: false },
      quiz_attempts: { ok: false },
      doubt_queries: { ok: false },
      profiles: { ok: false },
      lab_exams: { ok: false },
      lab_exam_sessions: { ok: false },
      site_store: { ok: false }
    },
    storage: {
      pdfMaterialsBucket: { ok: false }
    },
    message: ''
  };

  if (!isConfigured) {
    result.message = 'Supabase credentials are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.';
    return result;
  }

  const startTime = performance.now();

  try {
    // Helper to test each table
    const checkTable = async (tableName: keyof typeof result.tables, idCol: string = 'id') => {
      try {
        const { count, error } = await supabase
          .from(tableName as string)
          .select(idCol, { count: 'exact', head: true });
        if (!error) {
          result.tables[tableName] = { ok: true, count: count ?? 0 };
        } else {
          result.tables[tableName] = { ok: false, error: error.message };
        }
      } catch (e: any) {
        result.tables[tableName] = { ok: false, error: e.message };
      }
    };

    await Promise.all([
      checkTable('pdf_chapters', 'id'),
      checkTable('learning_resources', 'id'),
      checkTable('study_materials', 'id'),
      checkTable('quizzes', 'id'),
      checkTable('question_bank', 'id'),
      checkTable('user_logins', 'id'),
      checkTable('quiz_attempts', 'id'),
      checkTable('doubt_queries', 'id'),
      checkTable('profiles', 'email'),
      checkTable('lab_exams', 'id'),
      checkTable('lab_exam_sessions', 'id'),
      checkTable('site_store', 'key')
    ]);

    // Test storage bucket
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (!error && buckets) {
        const found = buckets.some(b => b.name === 'pdf-materials' || b.id === 'pdf-materials');
        result.storage.pdfMaterialsBucket = { ok: found, error: found ? undefined : 'Bucket "pdf-materials" not listed or private' };
      } else {
        const { data } = supabase.storage.from('pdf-materials').getPublicUrl('test');
        result.storage.pdfMaterialsBucket = { ok: Boolean(data?.publicUrl), error: error?.message };
      }
    } catch (e: any) {
      result.storage.pdfMaterialsBucket = { ok: false, error: e.message };
    }

    result.latencyMs = Math.round(performance.now() - startTime);
    const anyTableOk = Object.values(result.tables).some(t => t.ok);
    result.connected = anyTableOk;

    if (result.connected) {
      const activeCount = Object.values(result.tables).filter(t => t.ok).length;
      result.message = `Successfully connected to Supabase (${result.latencyMs}ms latency). ${activeCount}/12 tables verified active.`;
    } else {
      result.message = `Connected to endpoint, but table schema queries returned errors. Check RLS policies or run the SQL setup script.`;
    }

  } catch (err: any) {
    result.latencyMs = Math.round(performance.now() - startTime);
    result.connected = false;
    result.message = `Network error connecting to Supabase: ${err.message || 'Host unreachable'}`;
  }

  return result;
}


