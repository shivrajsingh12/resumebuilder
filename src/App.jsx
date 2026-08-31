import { Routes, Route, Navigate } from "react-router-dom";

import { useResumeStore } from "./hooks/useResumeStore";
import { useToast } from "./hooks/useToast";

import ToastContainer from "./components/ui/Toast";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import ATSAnalyzer from "./pages/ATSAnalyzer";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Header from "./components/Header";
import Templates from "./pages/Templates";
import CareerCenter from "./pages/CareerCenter";
import Profile from "./pages/Profile";
import PrintResume from "./pages/PrintResume";

export default function App() {
  const store = useResumeStore();
  const { toasts, addToast, removeToast } = useToast();

  // -----------------------------
  // CREATE RESUME
  // -----------------------------
  const handleCreate = (name, template, importedSections) => {
    const id = store.createResume(name, template?.id, importedSections);

    addToast("New resume created", "success");

    return id;
  };

  // -----------------------------
  // DUPLICATE RESUME
  // -----------------------------
  const handleDuplicate = (id) => {
    const newId = store.duplicateResume(id);

    addToast("Resume duplicated", "success");

    return newId;
  };

  // -----------------------------
  // DELETE RESUME
  // -----------------------------
  const handleDelete = (id) => {
    store.deleteResume(id);

    addToast("Resume deleted", "warning");
  };

  // -----------------------------
  // RENAME RESUME
  // -----------------------------
  const handleRename = (id, name) => {
    store.renameResume(id, name);

    addToast("Resume renamed", "success");
  };

  return (
    <>
    <Header />
      <Routes>

        {/* =====================================
            PUBLIC PAGES
        ====================================== */}

        <Route
          path="/"
          element={
            <LandingPage
              onGetStarted={handleCreate}
            />
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route path="/templates" element={<Templates onCreate={handleCreate} onToast={addToast} />} />
        <Route path="/career-center" element={<CareerCenter />} />
        <Route path="/career" element={<CareerCenter />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />


        {/* =====================================
            PROTECTED DASHBOARD
        ====================================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard
                resumes={store.resumes}
                onCreate={handleCreate}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                onRename={handleRename}
                darkMode={store.settings.darkMode}
                onToggleDark={store.toggleDarkMode}
              />
            </ProtectedRoute>
          }
        />


        {/* =====================================
            PROTECTED EDITOR
        ====================================== */}

        <Route
          path="/editor/:id"
          element={
            <ProtectedRoute>
              <Editor
                getResume={store.getResume}
                updateResume={store.updateResume}
                undo={store.undo}
                redo={store.redo}
                canUndo={store.canUndo}
                canRedo={store.canRedo}
                darkMode={store.settings.darkMode}
                onToggleDark={store.toggleDarkMode}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resume/:id/print"
          element={<ProtectedRoute><PrintResume getResume={store.getResume} /></ProtectedRoute>}
        />


        {/* =====================================
            PROTECTED ATS ANALYZER
        ====================================== */}

        <Route
          path="/ats"
          element={
            <ProtectedRoute>
              <ATSAnalyzer
                resumes={store.resumes}
                darkMode={store.settings.darkMode}
                onToggleDark={store.toggleDarkMode}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobcheck"
          element={<Navigate to="/ats" replace />}
        />


        {/* =====================================
            FALLBACK
        ====================================== */}

        <Route
          path="*"
          element={
            <LandingPage
              onGetStarted={handleCreate}
            />
          }
        />

      </Routes>

      {/* Toast notifications */}
      <ToastContainer
        toasts={toasts}
        remove={removeToast}
      />
    </>
  );
}
