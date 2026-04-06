import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { CheckIcon, XIcon, AwardIcon } from "../lib/icons";
import { cn } from "../lib/utils";
import type { ContentItem, QuizResult } from "../types";

interface ResultsProps {
  result: QuizResult | null;
  item: ContentItem | null;
  onBack: () => void;
  onGoLibrary: () => void;
}

export function Results({ result, item, onBack, onGoLibrary }: ResultsProps) {
  if (!result) return null;

  const pct = Math.round((result.score / result.total) * 100);

  return (
    <div className="max-w-md mx-auto space-y-6 pt-8">
      <Card>
        <CardContent className="pt-8 pb-8 flex flex-col items-center gap-5 text-center">
          <div
            className={cn(
              "h-20 w-20 rounded-full flex items-center justify-center",
              result.passed ? "bg-emerald-100" : "bg-red-100"
            )}
          >
            {result.passed ? (
              <CheckIcon size={36} className="text-emerald-600" />
            ) : (
              <XIcon size={36} className="text-red-500" />
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              {result.passed ? "Assessment Passed!" : "Not Quite There"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {item?.title}
            </p>
          </div>

          <div className="text-4xl font-bold text-foreground">{pct}%</div>
          <p className="text-sm text-muted-foreground">
            {result.score} of {result.total} questions correct
          </p>

          {result.passed && item?.cpdPoints && (
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-700 font-medium">
              <AwardIcon size={15} /> {item.cpdPoints} CPD points earned
            </div>
          )}

          {!result.passed && (
            <p className="text-sm text-muted-foreground">
              A score of 70% or higher is required to pass. Review the material and try again.
            </p>
          )}

          <div className="flex gap-3 w-full pt-2">
            {!result.passed && (
              <Button variant="outline" className="flex-1" onClick={onBack}>
                Retry
              </Button>
            )}
            <Button className="flex-1" onClick={onGoLibrary}>
              {result.passed ? "Back to Library" : "Back to Activity"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
