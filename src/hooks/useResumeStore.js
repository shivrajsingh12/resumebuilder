import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { createSampleResume } from '../data/sampleResume';
import { generateId } from '../utils/helpers';
import { normalizeTemplateId } from '../templates';

const SETTINGS_KEY = 'resumebuilder_settings';

export const useResumeStore = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [settings, setSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); }
    catch { return { darkMode: false }; }
  });

  // Undo/redo per resume
  const historyRef = useRef(new Map());
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      // Auth changes must clear stale local state before the next user can render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResumes([]);
      setLoaded(false);
      loadedRef.current = false;
      return undefined;
    }

    const cacheKey = `resumebuilder_resumes_${user.uid}`;
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      if (Array.isArray(cached)) setResumes(cached);
    } catch { /* Firestore remains the source of truth. */ }

    const resumesQuery = query(collection(db, 'users', user.uid, 'resumes'), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(resumesQuery, snapshot => {
      const next = snapshot.docs.map(item => { const data = item.data(); return { id: item.id, ...data, template: normalizeTemplateId(data.template) }; });
      setResumes(next);
      setLoaded(true);
      loadedRef.current = true;
      localStorage.setItem(cacheKey, JSON.stringify(next));
    }, () => {
      setLoaded(true);
      loadedRef.current = true;
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user || !loadedRef.current) return undefined;
    const cacheKey = `resumebuilder_resumes_${user.uid}`;
    localStorage.setItem(cacheKey, JSON.stringify(resumes));
    const timer = window.setTimeout(() => {
      resumes.forEach(resume => {
        const { id, ...data } = resume;
        setDoc(doc(db, 'users', user.uid, 'resumes', id), data, { merge: true }).catch(() => undefined);
      });
    }, 700);
    return () => window.clearTimeout(timer);
  }, [resumes, user]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const getResume = useCallback((id) =>
    resumes.find(r => r.id === id), [resumes]);

  const updateResume = useCallback((id, updater) => {
    setResumes(prev => {
      const next = prev.map(r => {
        if (r.id !== id) return r;
        const old = r;
        const updated = updater({ ...r, updatedAt: new Date().toISOString() });
        // push to history
        const h = historyRef.current.get(id) || { past: [], future: [] };
        h.past = [...h.past.slice(-29), old];
        h.future = [];
        historyRef.current.set(id, h);
        return updated;
      });
      return next;
    });
  }, []);

  const undo = useCallback((id) => {
    const h = historyRef.current.get(id);
    if (!h || h.past.length === 0) return;
    setResumes(prev => prev.map(r => {
      if (r.id !== id) return r;
      const prev_ = h.past[h.past.length - 1];
      h.future = [r, ...h.future];
      h.past = h.past.slice(0, -1);
      return prev_;
    }));
  }, []);

  const redo = useCallback((id) => {
    const h = historyRef.current.get(id);
    if (!h || h.future.length === 0) return;
    setResumes(prev => prev.map(r => {
      if (r.id !== id) return r;
      const next = h.future[0];
      h.past = [...h.past, r];
      h.future = h.future.slice(1);
      return next;
    }));
  }, []);

  const canUndo = (id) => (historyRef.current.get(id)?.past.length ?? 0) > 0;
  const canRedo = (id) => (historyRef.current.get(id)?.future.length ?? 0) > 0;

  const createResume = useCallback((name, templateId = 'modern', importedSections) => {
    const r = { ...createSampleResume(), id: generateId(), name: name || 'Untitled Resume' };
    r.template = normalizeTemplateId(templateId);
    if (importedSections) {
      r.sections = importedSections;
      Object.entries(importedSections).forEach(([key, value]) => {
        if (key !== 'personal' && key in r.sectionVisibility) {
          r.sectionVisibility[key] = Array.isArray(value) ? value.length > 0 : Boolean(value);
        }
      });
    } else {
      r.sections.personal.fullName = '';
      r.sections.personal.title = '';
      r.sections.summary = '';
      r.sections.experience = [];
      r.sections.education = [];
      r.sections.projects = [];
    }
    setResumes(prev => [...prev, r]);
    return r.id;
  }, []);

  const duplicateResume = useCallback((id) => {
    const r = resumes.find(x => x.id === id);
    if (!r) return;
    const copy = { ...JSON.parse(JSON.stringify(r)), id: generateId(), name: r.name + ' (Copy)', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setResumes(prev => [...prev, copy]);
    return copy.id;
  }, [resumes]);

  const deleteResume = useCallback((id) => {
    setResumes(prev => prev.filter(r => r.id !== id));
    historyRef.current.delete(id);
    if (user) deleteDoc(doc(db, 'users', user.uid, 'resumes', id)).catch(() => undefined);
  }, [user]);

  const renameResume = useCallback((id, name) => {
    setResumes(prev => prev.map(r => r.id === id ? { ...r, name, updatedAt: new Date().toISOString() } : r));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setSettings(s => ({ ...s, darkMode: !s.darkMode }));
  }, []);

  return {
    resumes, activeId, setActiveId, settings, loading: !user || !loaded,
    getResume, updateResume, createResume, duplicateResume, deleteResume, renameResume,
    undo, redo, canUndo, canRedo, toggleDarkMode,
  };
};
