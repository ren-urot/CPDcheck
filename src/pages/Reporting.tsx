import { useMemo } from "react";
import { contentItems } from "../data/content";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";
import { AwardIcon, ClockIcon, CheckIcon } from "../lib/icons";
import { formatDuration, formatDate } from "../lib/utils";
import { contentTypeIcons } from "../lib/icons";

const CPD_ANNUAL_TARGET = 40;

export function Reporting() {
  const completed = useMemo(
    () =>
      contentItems
        .filter((c) => c.completed)
        .sort((a, b) => new Date(b.completedDate!).getTime() - new Date(a.completedDate!).getTime()),
    []
  );

  const totalMinutes = completed.reduce((s, c) => s + c.duration, 0);
  const totalPoints = completed.reduce((s, c) => s + c.cpdPoints, 0);
  const progressPct = Math.min(100, Math.round((totalMinutes / 60 / CPD_ANNUAL_TARGET) * 100));

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    completed.forEach((c) => {
      c.categories.forEach((cat) => {
        map[cat.name] = (map[cat.name] ?? 0) + cat.pts;
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [completed]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">CPD Report</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your continuing professional development summary.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              <ClockIcon size={14} className="text-brand-blue" /> Hours
            </div>
            <p className="text-3xl font-bold">{formatDuration(totalMinutes)}</p>
            <Progress value={progressPct} className="mt-3" />
            <p className="text-xs text-muted-foreground mt-1.5">
              {progressPct}% of {CPD_ANNUAL_TARGET}h annual target
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              <AwardIcon size={14} className="text-brand-blue" /> CPD Points
            </div>
            <p className="text-3xl font-bold">{totalPoints.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground mt-1.5">Points earned this year</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              <CheckIcon size={14} className="text-brand-blue" /> Activities
            </div>
            <p className="text-3xl font-bold">{completed.length}</p>
            <p className="text-xs text-muted-foreground mt-1.5">Activities completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* By category */}
        <Card>
          <CardHeader>
            <CardTitle>By Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {byCategory.length === 0 && (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            )}
            {byCategory.map(([cat, pts]) => (
              <div key={cat}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{cat}</span>
                  <span className="font-medium">{pts.toFixed(1)} pts</span>
                </div>
                <Progress value={totalPoints > 0 ? (pts / totalPoints) * 100 : 0} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Activity log */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            {completed.length === 0 && (
              <p className="text-sm text-muted-foreground">No completed activities yet.</p>
            )}
            <div className="space-y-0">
              {completed.map((item, i) => {
                const TypeIcon = contentTypeIcons[item.type];
                return (
                  <div key={item.id}>
                    <div className="flex items-start gap-3 py-3">
                      {TypeIcon && (
                        <div className="mt-0.5 p-1.5 rounded-md bg-brand-lightest-gray text-brand-dark-gray shrink-0">
                          <TypeIcon size={14} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.provider} · {formatDate(item.completedDate!)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold">{item.cpdPoints} pts</p>
                        <p className="text-xs text-muted-foreground">{formatDuration(item.duration)}</p>
                      </div>
                    </div>
                    {i < completed.length - 1 && <Separator />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
