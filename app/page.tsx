"use client";

import { useRef, useState } from "react";

const languageOptions = [
  { name: "Amharic", code: "am" },
  { name: "Arabic", code: "ar" },
  { name: "Chinese (Simplified)", code: "zh-CN" },
  { name: "Chinese (Traditional)", code: "zh-TW" },
  { name: "Czech", code: "cs" },
  { name: "Danish", code: "da" },
  { name: "Dutch", code: "nl" },
  { name: "English", code: "en" },
  { name: "Finnish", code: "fi" },
  { name: "French", code: "fr" },
  { name: "German", code: "de" },
  { name: "Greek", code: "el" },
  { name: "Hausa", code: "ha" },
  { name: "Hindi", code: "hi" },
  { name: "Hungarian", code: "hu" },
  { name: "Igbo", code: "ig" },
  { name: "Indonesian", code: "id" },
  { name: "Italian", code: "it" },
  { name: "Japanese", code: "ja" },
  { name: "Korean", code: "ko" },
  { name: "Nepali", code: "ne" },
  { name: "Norwegian", code: "no" },
  { name: "Polish", code: "pl" },
  { name: "Portuguese", code: "pt" },
  { name: "Romanian", code: "ro" },
  { name: "Russian", code: "ru" },
  { name: "Sinhala", code: "si" },
  { name: "Slovak", code: "sk" },
  { name: "Somali", code: "so" },
  { name: "Spanish", code: "es" },
  { name: "Swahili", code: "sw" },
  { name: "Swedish", code: "sv" },
  { name: "Thai", code: "th" },
  { name: "Turkish", code: "tr" },
  { name: "Ukrainian", code: "uk" },
  { name: "Urdu", code: "ur" },
  { name: "Vietnamese", code: "vi" },
  { name: "Yoruba", code: "yo" },
  { name: "Zulu", code: "zu" }
];

export default function HomePage() {
  const [languageCode, setLanguageCode] = useState("zh-CN");
  const [customLangCode, setCustomLangCode] = useState("");
  const [progress, setProgress] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedData, setTranslatedData] = useState<object | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return alert("Please upload a JSON file.");

    const text = await file.text();
    const json = JSON.parse(text);
    const keys = Object.keys(json);
    const result: Record<string, string> = {};

    const selectedLang = customLangCode.trim() !== "" ? customLangCode.trim() : languageCode;

    setIsTranslating(true);
    setProgress(`Translating ${keys.length} keys to ${selectedLang}...`);

    try {
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = json[key];
        if (typeof value === "string") {
          try {
            const res = await fetch(
              `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${selectedLang}&dt=t&q=${encodeURIComponent(value)}`
            );
            const data = await res.json();
            result[key] = data[0][0][0];
          } catch (err) {
            console.warn(`Translation failed for key: ${key}`);
            result[key] = value;
          }
        } else {
          result[key] = value;
        }
        setProgress(`Translation: ${Math.round(((i + 1) / keys.length) * 100)}% (${i + 1}/${keys.length})`);
      }

      setTranslatedData(result);
      setProgress(`✅ Translated ${Object.keys(result).length} keys successfully.`);
    } catch (err) {
      console.error("Translation error:", err);
      setProgress("❌ Translation failed");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleDownload = () => {
    if (!translatedData) return;

    const selectedLang = customLangCode.trim() !== "" ? customLangCode.trim() : languageCode;

    const blob = new Blob([JSON.stringify(translatedData, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `translated_${selectedLang}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🌐 Translate JSON Keys</h1>

      <label className="block mb-2 font-semibold">Select Language:</label>
      <select
        value={languageCode}
        onChange={(e) => setLanguageCode(e.target.value)}
        className="border p-2 w-full mb-4"
      >
        {languageOptions.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name} ({lang.code})
          </option>
        ))}
      </select>

      <label className="block mb-2 font-semibold">Or enter custom language code:</label>
      <input
        type="text"
        placeholder="e.g., haw, ps, lo"
        className="border p-2 w-full mb-4"
        value={customLangCode}
        onChange={(e) => setCustomLangCode(e.target.value)}
      />

      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        className="mb-4"
      />

      <div className="flex gap-4">
        <button
          onClick={handleFileUpload}
          disabled={isTranslating}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isTranslating ? "Translating..." : "Translate"}
        </button>
        <button
          onClick={handleDownload}
          disabled={!translatedData}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Download
        </button>
      </div>

      {progress && <p className="mt-4">{progress}</p>}
    </main>
  );
}
  