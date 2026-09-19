"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { callsignsFromSeries, parseCallsignList } from "@/lib/callsignInput";

type Mode = "one" | "series" | "list";

interface ComposerProps {
  onPlan: (callsigns: string[]) => void;
  onCancel: () => void;
  isPlanning: boolean;
  progress: { done: number; total: number };
}

/** Three ways in, because units name devices three ways
 *
 * One at a time for a replacement phone, a numbered series for a batch, and a pasted list for
 * everyone whose names are words rather than numbers -- KORPPI, KIRVES -- or who already has the
 * list in a spreadsheet.
 */
export function Composer({
  onPlan,
  onCancel,
  isPlanning,
  progress,
}: ComposerProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>("one");
  const [one, setOne] = useState("");
  const [prefix, setPrefix] = useState("");
  const [from, setFrom] = useState("1");
  const [count, setCount] = useState("10");
  const [list, setList] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const wanted =
    mode === "one"
      ? one.trim()
        ? [one.trim()]
        : []
      : mode === "series"
        ? callsignsFromSeries(prefix, Number(count) || 0, Number(from) || 1)
        : parseCallsignList(list);

  const readFile = (file: File) => {
    void file.text().then((text) => {
      setList((current) => (current.trim() ? `${current}\n${text}` : text));
    });
  };

  return (
    <form
      data-testid="mdm-composer"
      className="rounded-2xl border border-border bg-card p-5 space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (wanted.length) {
          onPlan(wanted);
        }
      }}
    >
      <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)}>
        <TabsList data-testid="mdm-composer-modes">
          <TabsTrigger data-testid="mdm-mode-one" value="one">
            {t("mdm.modeOne")}
          </TabsTrigger>
          <TabsTrigger data-testid="mdm-mode-series" value="series">
            {t("mdm.modeSeries")}
          </TabsTrigger>
          <TabsTrigger data-testid="mdm-mode-list" value="list">
            {t("mdm.modeList")}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === "one" && (
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            {t("mdm.callsign")}
          </span>
          <Input
            data-testid="mdm-one-input"
            autoFocus
            value={one}
            onChange={(event) => setOne(event.target.value)}
            placeholder={t("mdm.callsignPlaceholder")}
            disabled={isPlanning}
          />
        </label>
      )}

      {mode === "series" && (
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex-1 min-w-40 space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              {t("mdm.prefix")}
            </span>
            <Input
              data-testid="mdm-prefix-input"
              autoFocus
              value={prefix}
              onChange={(event) => setPrefix(event.target.value)}
              placeholder={t("mdm.prefixPlaceholder")}
              disabled={isPlanning}
            />
          </label>
          <label className="w-24 space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              {t("mdm.from")}
            </span>
            <Input
              data-testid="mdm-from-input"
              type="number"
              min={1}
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              disabled={isPlanning}
            />
          </label>
          <label className="w-24 space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              {t("mdm.count")}
            </span>
            <Input
              data-testid="mdm-count-input"
              type="number"
              min={1}
              max={500}
              value={count}
              onChange={(event) => setCount(event.target.value)}
              disabled={isPlanning}
            />
          </label>
        </div>
      )}

      {mode === "list" && (
        <div className="space-y-2">
          <Textarea
            data-testid="mdm-list-input"
            autoFocus
            rows={6}
            className="font-mono text-sm"
            value={list}
            onChange={(event) => setList(event.target.value)}
            placeholder={t("mdm.listPlaceholder")}
            disabled={isPlanning}
          />
          <div className="flex items-center gap-2">
            <Button
              data-testid="mdm-list-file-button"
              type="button"
              variant="outline"
              size="sm"
              disabled={isPlanning}
              onClick={() => fileInput.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              {t("mdm.chooseFile")}
            </Button>
            <span className="text-xs text-muted-foreground">
              {t("mdm.listHint")}
            </span>
          </div>
          <input
            data-testid="mdm-list-file-input"
            ref={fileInput}
            type="file"
            accept=".csv,.txt,text/csv,text/plain"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                readFile(file);
              }
              event.target.value = "";
            }}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          data-testid="mdm-plan-preview"
          className="text-xs text-muted-foreground"
        >
          {wanted.length === 1
            ? t("mdm.previewOne", { callsign: wanted[0] })
            : wanted.length > 1
              ? t("mdm.preview", {
                  count: wanted.length,
                  first: wanted[0],
                  last: wanted[wanted.length - 1],
                })
              : t("mdm.previewNone")}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isPlanning}
          >
            {t("mdm.cancel")}
          </Button>
          <Button
            data-testid="mdm-plan-button"
            type="submit"
            disabled={isPlanning || !wanted.length}
          >
            {isPlanning
              ? t("mdm.bulkProgress", {
                  done: progress.done,
                  total: progress.total,
                })
              : t("mdm.plan")}
          </Button>
        </div>
      </div>
    </form>
  );
}
