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
import { Profile } from "./pages/Profile";
import { Upload } from "./pages/Upload";
import type { User, ContentItem, CompletedEducationItem, QuizResult, PageId } from "./types";

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<PageId>("dashboard");
  const [selectedContent, setSelectedContent] = useState<ContentItem | CompletedEducationItem | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

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
    setPage("content");
  }

  function handleStartQuiz(_item: ContentItem) {
    setPage("quiz");
  }

  function handleQuizComplete(result: QuizResult) {
    setQuizResult(result);
    setPage("results");
  }

  function renderPage() {
    switch (page) {
      case "dashboard":
        return <Dashboard onSelectContent={handleSelectContent} />;
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
        return <MyEducation onSelectContent={handleSelectContent} />;
      case "profile":
        return <Profile user={user} onUpdate={setUser} />;
      case "upload":
        return <Upload />;
      default:
        return <Dashboard onSelectContent={handleSelectContent} />;
    }
  }

  return (
    <Layout currentPage={page} onNavigate={navigate} user={user} onLogout={() => setUser(null)}>
      {renderPage()}
    </Layout>
  );
}
