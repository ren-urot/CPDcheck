import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { ChevronLeftIcon } from "../lib/icons";
import { quizQuestions } from "../data/quiz";
import { cn } from "../lib/utils";
import type { ContentItem, QuizResult, QuizAnswer } from "../types";

interface QuizProps {
  item: ContentItem | null;
  onBack: () => void;
  onComplete: (result: QuizResult) => void;
}

export function Quiz({ item, onBack, onComplete }: QuizProps) {
  const questions = quizQuestions[item?.id ?? ""] ?? [];
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  if (!item || questions.length === 0) {
    return (
      <div className="w-full space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 -ml-2">
          <ChevronLeftIcon size={16} /> Back
        </Button>
        <p className="text-muted-foreground">No questions available for this activity.</p>
      </div>
    );
  }

  const question = questions[current];
  const progress = Math.round(((current) / questions.length) * 100);
  const isLast = current === questions.length - 1;

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    setShowExplanation(true);
  }

  function handleNext() {
    const newAnswers: QuizAnswer[] = [...answers, { questionId: question.id, selected: selected!, correct: question.correct }];
    setAnswers(newAnswers);

    if (isLast) {
      const score = newAnswers.filter((a) => a.selected === a.correct).length;
      onComplete({ answers: newAnswers, score, total: questions.length, passed: score / questions.length >= 0.7 });
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 -ml-2">
        <ChevronLeftIcon size={16} /> Back to Activity
      </Button>

      <div>
        <h1 className="text-xl font-bold">{item.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">Assessment · Question {current + 1} of {questions.length}</p>
      </div>

      <Progress value={progress} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base leading-snug">{question.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {question.options.map((opt, idx) => {
            const isSelected = selected === idx;
            const isCorrect = idx === question.correct;
            const showResult = selected !== null;

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={selected !== null}
                className={cn(
                  "w-full text-left rounded-lg border px-4 py-3 text-sm transition-colors",
                  !showResult && "hover:bg-accent hover:border-brand-blue",
                  showResult && isCorrect && "bg-emerald-50 border-emerald-400 text-emerald-800",
                  showResult && isSelected && !isCorrect && "bg-red-50 border-red-400 text-red-800",
                  showResult && !isSelected && !isCorrect && "opacity-50",
                  !showResult ? "border-border" : ""
                )}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>
                {opt}
              </button>
            );
          })}

          {showExplanation && question.explanation && (
            <div className="mt-3 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
              <strong>Explanation:</strong> {question.explanation}
            </div>
          )}

          {selected !== null && (
            <Button className="w-full mt-2" onClick={handleNext}>
              {isLast ? "Finish Assessment" : "Next Question"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
