import { useState } from "react";
import { Layout } from "./components/layout/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Library } from "./pages/Library";
import { Content } from "./pages/Content";
import { Quiz } from "./pages/Quiz";
import { Results } from "./pages/Results";
import { Reporting } from "./pages/Reporting";
import { MyEducation } from "./pages/MyEducation";
import { CompletedContentDetail } from "./pages/CompletedContentDetail";
import { Profile } from "./pages/Profile";
import { Upload } from "./pages/Upload";
import { completedEducation as initialEducation } from "./data/categories";
import type { User, ContentItem, CompletedEducationItem, QuizResult, PageId } from "./types";

const DEV_USER: User = { name: "Dev User", email: "dev@cpdcheck.com", role: "Financial Adviser", licenseNumber: "DEV-001" };
const isDevMode = new URLSearchParams(window.location.search).get("dev") === "true";

export function App() {
  const [user, setUser] = useState<User | null>(isDevMode ? DEV_USER : null);
  const [page, setPage] = useState<PageId>(isDevMode ? "completedDetail" : "dashboard");
  const [selectedContent, setSelectedContent] = useState<ContentItem | CompletedEducationItem | null>(isDevMode ? initialEducation[0] : null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [educationItems, setEducationItems] = useState<CompletedEducationItem[]>(initialEducation);

  if (!user) {
    return <Login onLogin={(u) => setUser(u)} />;
  }

  function navigate(to: PageId) {
    setPage(to);
    setSelectedContent(null);
    setQuizResult(null);
  }

  function handleSelectContent(item: ContentItem | CompletedEducationItem) {
    setSelectedContent(item);
    setQuizResult(null);
    // Completed education items go to the detail view; library items go to content player
    if ("isImported" in item) {
      setPage("completedDetail");
    } else {
      setPage("content");
    }
  }

  function handleStartQuiz(_item: ContentItem) {
    setPage("quiz");
  }

  function handleQuizComplete(result: QuizResult) {
    setQuizResult(result);
    setPage("results");
  }

  function handleUploadSubmit(items: CompletedEducationItem[]) {
    setEducationItems((prev) => [...items, ...prev]);
    navigate("myEducation");
  }

  function renderPage() {
    switch (page) {
      case "dashboard":
        return <Dashboard items={educationItems} onSelectContent={handleSelectContent} onAddItems={(newItems) => setEducationItems(prev => [...newItems, ...prev])} />;
      case "library":
        return <Library onSelectContent={handleSelectContent} />;
      case "content":
        return (
          <Content
            item={selectedContent as ContentItem}
            onBack={() => navigate("library")}
            onStartQuiz={handleStartQuiz}
            onMarkComplete={() => navigate("library")}
          />
        );
      case "quiz":
        return <Quiz item={selectedContent as ContentItem} onBack={() => setPage("content")} onComplete={handleQuizComplete} />;
      case "results":
        return <Results result={quizResult} item={selectedContent as ContentItem} onBack={() => setPage("quiz")} onGoLibrary={() => navigate("library")} />;
      case "reporting":
        return <Reporting />;
      case "myEducation":
        return <MyEducation items={educationItems} onSelectContent={handleSelectContent} />;
      case "completedDetail":
        return (
          <CompletedContentDetail
            item={selectedContent as CompletedEducationItem}
            onBack={() => navigate("dashboard")}
          />
        );
      case "profile":
        return <Profile user={user} onUpdate={setUser} />;
      case "upload":
        return <Upload onSubmit={handleUploadSubmit} />;
      default:
        return <Dashboard items={educationItems} onSelectContent={handleSelectContent} onAddItems={(newItems) => setEducationItems(prev => [...newItems, ...prev])} />;
    }
  }

  return (
    <Layout currentPage={page} onNavigate={navigate} user={user} onLogout={() => setUser(null)}>
      {renderPage()}
    </Layout>
  );
}
