const languageMap: Record<string, string> = {
  "chinese - hong kong": "zh",
  "chinese - traditional": "zh",
  chinese: "zh",
  czech: "cs",
  danish: "da",
  dutch: "nl",
  english: "en",
  "english - sdh": "en",
  finnish: "fi",
  french: "fr",
  german: "de",
  greek: "el",
  hungarian: "hu",
  italian: "it",
  japanese: "ja",
  korean: "ko",
  norwegian: "no",
  polish: "pl",
  portuguese: "pt",
  "portuguese - brazilian": "pt",
  romanian: "ro",
  russian: "ru",
  "spanish - european": "es",
  "spanish - latin american": "es",
  spanish: "es",
  swedish: "sv",
  turkish: "tr",
};

export function labelToLanguageCode(label: string): string | null {
  return languageMap[label.toLowerCase()] ?? null;
}
