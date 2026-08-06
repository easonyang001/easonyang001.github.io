import { useState } from "react";
import { Segmented, SegmentedButton } from "../Segmented.tsx";
import {
  serializeWeeklyBrief,
  type WeeklyBriefDocument,
  type WeeklyBriefLanguage,
  type WeeklyBriefSectionKey,
} from "../../lib/news/weeklyBrief.ts";

const LANGUAGES: Array<{ key: WeeklyBriefLanguage; label: string }> = [
  { key: "zh-TW", label: "中文" },
  { key: "en", label: "English" },
  { key: "fr", label: "Français" },
];

const SECTIONS: Array<{ key: WeeklyBriefSectionKey; label: string }> = [
  { key: "weeklyNews", label: "Weekly News" },
  { key: "selectedPapers", label: "Selected Papers" },
  { key: "literatureDeepDive", label: "Literature Deep Dive" },
];

interface Props {
  brief: WeeklyBriefDocument;
  disabled: boolean;
  onChange: (serialized: string, primaryTitle: string) => void;
}

export default function WeeklyBriefEditor({ brief, disabled, onChange }: Props) {
  const [language, setLanguage] = useState<WeeklyBriefLanguage>("zh-TW");
  const translation = brief.translations[language];

  const updateField = (field: "title" | "summary", value: string) => {
    const next = structuredClone(brief);
    next.translations[language][field] = value;
    onChange(serializeWeeklyBrief(next), next.translations["zh-TW"].title);
  };

  const updateSection = (section: WeeklyBriefSectionKey, value: string) => {
    const next = structuredClone(brief);
    next.translations[language].sections[section] = value;
    onChange(serializeWeeklyBrief(next), next.translations["zh-TW"].title);
  };

  return (
    <div className="space-y-5">
      <Segmented>
        {LANGUAGES.map((item) => (
          <SegmentedButton key={item.key} active={language === item.key} onClick={() => setLanguage(item.key)}>
            {item.label}
          </SegmentedButton>
        ))}
      </Segmented>

      <label className="block text-small text-text-secondary">
        <span className="mb-1 block">Title</span>
        <input
          type="text"
          value={translation.title}
          disabled={disabled}
          onChange={(event) => updateField("title", event.target.value)}
          className="w-full rounded-md border border-border bg-surface px-4 py-2 text-small text-text-primary outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/50 disabled:opacity-60"
        />
      </label>

      <label className="block text-small text-text-secondary">
        <span className="mb-1 block">Summary</span>
        <textarea
          rows={3}
          value={translation.summary}
          disabled={disabled}
          onChange={(event) => updateField("summary", event.target.value)}
          className="w-full rounded-md border border-border bg-surface px-4 py-2 text-small text-text-primary outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/50 disabled:opacity-60"
        />
      </label>

      {SECTIONS.map((section) => (
        <label key={section.key} className="block text-small text-text-secondary">
          <span className="mb-1 block">{section.label}</span>
          <textarea
            rows={10}
            value={translation.sections[section.key]}
            disabled={disabled}
            onChange={(event) => updateSection(section.key, event.target.value)}
            className="w-full rounded-md border border-border bg-surface px-4 py-2 font-mono text-small text-text-primary outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/50 disabled:opacity-60"
          />
        </label>
      ))}
    </div>
  );
}
