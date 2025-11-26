import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useUserType } from "@/hooks/auth/useUserType";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface FeedbackFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackForm({ open, onOpenChange }: FeedbackFormProps) {
  const [os, setOs] = useState("");
  const [rating, setRating] = useState("");
  const [comments, setComments] = useState("");
  const [version] = useState("1.0.0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  const { userType } = useUserType();

  // Check if all required fields are filled
  const isFormValid = os && rating && comments;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Using Formspark for form submission
    fetch("https://submit-form.com/hloLGOTNT", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: userType,
        os,
        rating,
        comments,
        version,
      }),
    });

    toast.success(t("feedbackForm.thanks"));
    onOpenChange(false);
    setOs("");
    setRating("");
    setComments("");
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("feedbackForm.title")}</DialogTitle>
          <DialogDescription>{t("feedbackForm.description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <label className="text-xs font-medium text-muted-foreground">
              {t("feedbackForm.osLabel")}
            </label>
            <Select value={os} onValueChange={(v) => setOs(v)}>
              <SelectTrigger
                className={cn(
                  "h-10 rounded-md border px-3 py-1 bg-transparent text-base w-full text-left",
                )}
              >
                <SelectValue placeholder={t("feedbackForm.osPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linux">
                  {t("feedbackForm.os.linux")}
                </SelectItem>
                <SelectItem value="windows">
                  {t("feedbackForm.os.windows")}
                </SelectItem>
                <SelectItem value="macos">
                  {t("feedbackForm.os.macos")}
                </SelectItem>
                <SelectItem value="android">
                  {t("feedbackForm.os.android")}
                </SelectItem>
                <SelectItem value="iphone">
                  {t("feedbackForm.os.iphone")}
                </SelectItem>
                <SelectItem value="other">
                  {t("feedbackForm.os.other")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <label className="text-xs font-medium text-muted-foreground">
              {t("feedbackForm.ratingLabel")}
            </label>
            <Select value={rating} onValueChange={(v) => setRating(v)}>
              <SelectTrigger
                className={cn(
                  "h-10 rounded-md border px-3 py-1 bg-transparent text-base w-full text-left",
                )}
              >
                <SelectValue
                  placeholder={t("feedbackForm.ratingPlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">
                  {t("feedbackForm.ratings.excellent")}
                </SelectItem>
                <SelectItem value="good">
                  {t("feedbackForm.ratings.good")}
                </SelectItem>
                <SelectItem value="bad">
                  {t("feedbackForm.ratings.bad")}
                </SelectItem>
                <SelectItem value="very bad">
                  {t("feedbackForm.ratings.veryBad")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <label className="text-xs font-medium text-muted-foreground">
              {t("feedbackForm.commentsLabel")}
            </label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={t("feedbackForm.commentsPlaceholder")}
              className={cn(
                "min-h-[120px] resize-y rounded-md border px-3 py-2 bg-transparent text-sm",
              )}
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              type="button"
              className="flex-1"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting
                ? t("feedbackForm.sending")
                : t("feedbackForm.send")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default FeedbackForm;
