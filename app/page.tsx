"use client";

import { useRef, useState, useEffect } from "react";
import { ArrowDownTrayIcon, GlobeAltIcon, DocumentArrowUpIcon } from "@heroicons/react/24/outline";

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
  { name: "Shona", code: "sn" },
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
  const [languageCode, setLanguageCode] = useState("en");
  const [customLangCode, setCustomLangCode] = useState("");
  const [progress, setProgress] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedData, setTranslatedData] = useState<object | null>(null);
  const [selectedLangName, setSelectedLangName] = useState("Chinese (Simplified)");
  const [manualJson, setManualJson] = useState("");
  const [uploadedJson, setUploadedJson] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const match = languageOptions.find((lang) => lang.code === customLangCode.trim());
    if (match) {
      setLanguageCode(match.code);
      setSelectedLangName(match.name);
    }
  }, [customLangCode]);

  useEffect(() => {
    const match = languageOptions.find((lang) => lang.code === languageCode);
    if (match) {
      setCustomLangCode(match.code);
      setSelectedLangName(match.name);
    }
  }, [languageCode]);
  async function translateNestedJson(
    obj: any,
    targetLang: string,
    updateProgress: (count: number) => void,
    total: number,
    countRef: { count: number }
  ): Promise<any> {
    if (typeof obj === 'string') {
      try {
        const res = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(obj)}`
        );
        const data = await res.json();
        countRef.count += 1;
        updateProgress(countRef.count);
        return data[0][0][0];
      } catch {
        countRef.count += 1;
        updateProgress(countRef.count);
        return obj;
      }
    } else if (Array.isArray(obj)) {
      const results = await Promise.all(
        obj.map((item) => translateNestedJson(item, targetLang, updateProgress, total, countRef))
      );
      return results;
    } else if (typeof obj === 'object' && obj !== null) {
      const entries = await Promise.all(
        Object.entries(obj).map(async ([key, value]) => {
          const translatedValue = await translateNestedJson(value, targetLang, updateProgress, total, countRef);
          return [key, translatedValue];
        })
      );
      return Object.fromEntries(entries);
    }
    return obj;
  }
  const countTotalStrings = (obj: Record<string, any>): number => {
    return Object.values(obj).reduce((acc: number, value) => {
      if (typeof value === "string") return acc + 1;
      if (typeof value === "object" && value !== null) return acc + countTotalStrings(value);
      return acc;
    }, 0);
  };

  const handleManualTranslate = async () => {
    const source = manualJson.trim() || uploadedJson.trim();

    if (!source) {
      alert('Please upload or paste valid JSON first.');
      return;
    }

    let parsedJson: any;
    try {
      parsedJson = JSON.parse(source);
    } catch {
      alert('The JSON provided is invalid. Please fix it and try again.');
      return;
    }

    const selectedLang = customLangCode.trim() || languageCode;
    const total = countTotalStrings(parsedJson);
    const countRef = { count: 0 };

    const updateProgress = (count: number) => {
      setProgress(`Translation: ${Math.round((count / total) * 100)}% (${count}/${total})`);
    };

    setIsTranslating(true);
    setProgress(`Translating ${total} string values to ${selectedLang}...`);

    try {
      const result = await translateNestedJson(parsedJson, selectedLang, updateProgress, total, countRef);
      setTranslatedData(result);
      setProgress(`✅ Translated ${total} strings successfully.`);
    } catch (err) {
      console.error('Translation error:', err);
      setProgress('❌ Translation failed');
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
    setTranslatedData(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-4 py-10 flex items-center justify-center font-sans">
      <div className="bg-slate-800/90 p-8 rounded-3xl shadow-[0_0_25px_rgba(0,0,0,0.4)] w-full max-w-3xl border border-slate-700 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <GlobeAltIcon className="w-9 h-9 text-indigo-400" />
          <h1 className="text-4xl font-black text-indigo-300">JSON Translator</h1>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm mb-1 font-medium">Select Language</label>
            <select
              value={languageCode}
              onChange={(e) => {
                setLanguageCode(e.target.value);
                setIsTranslating(false);
                setTranslatedData(null);
              }}
              className="w-full rounded-lg bg-slate-700 text-white border border-slate-600 p-2 focus:ring-2 focus:ring-indigo-500"
            >
              {languageOptions.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium">Or enter custom language code</label>
            <input
              type="text"
              placeholder="e.g., haw, ps, lo"
              value={customLangCode}
              onChange={(e) => {
                setCustomLangCode(e.target.value);
                setIsTranslating(false);
                setTranslatedData(null);
              }}
              className="w-full rounded-lg bg-slate-700 text-white border border-slate-600 p-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <p className="text-center text-sm text-slate-300 mt-4">
          🔤 Selected Language:{" "}
          <span className="font-semibold text-indigo-300">
            {selectedLangName} ({customLangCode})
          </span>
        </p>
        <div className="mt-8">
          <label className="block mb-2 font-medium">Upload JSON File</label>
          <div className="flex items-center gap-3 bg-slate-700 p-3 rounded-lg border border-slate-600 cursor-pointer hover:border-indigo-500 transition">
            <DocumentArrowUpIcon className="w-6 h-6 text-indigo-300" />
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                  try {
                    const text = event.target?.result as string;
                    JSON.parse(text); // validate JSON
                    setUploadedJson(text);
                    setManualJson(""); // Clear manual input
                  } catch {
                    alert("Invalid JSON file.");
                  }
                };
                reader.readAsText(file);
              }}
              className="text-white w-full bg-transparent outline-none"
            />
          </div>
        </div>
        <div className="sm:grid-cols-2 grid gap-3">
          <div className="mt-6">
            <label className="block mb-2 font-medium">Or Paste JSON Here</label>
            <textarea
              value={manualJson}
              onChange={(e) => {
                setManualJson(e.target.value);
                setUploadedJson(""); // Clear uploaded file content
                if (fileInputRef.current) fileInputRef.current.value = ""; // Optional: visually reset file input
              }}
              placeholder="Enter JSON Data..."
              rows={10}
              className="w-full bg-slate-700 text-white border border-slate-600 p-3 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>




          <div className="mt-6">
            <label className="block mb-2 font-medium">Translated JSON Output</label>
            <textarea
              value={translatedData ? JSON.stringify(translatedData, null, 2) : "No data"}
              readOnly
              rows={10}
              className="w-full bg-slate-700 text-white border border-slate-600 p-3 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500"
            />

            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(translatedData, null, 2));
              }}
              className="mt-2 bg-indigo-500 hover:bg-indigo-400 px-4 py-1 rounded text-sm text-white font-medium"
            >
              📋 Copy to Clipboard
            </button>
          </div>
        </div>


        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={handleManualTranslate}
            disabled={isTranslating}
            className="w-full bg-indigo-600 hover:bg-indigo-500 transition px-4 py-2 rounded-lg text-white font-semibold disabled:opacity-50 shadow"
          >
            {isTranslating ? "Translating..." : "Translate"}
          </button>
          <button
            onClick={handleDownload}
            disabled={!translatedData}
            className="w-full bg-emerald-600 hover:bg-emerald-500 transition px-4 py-2 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow"
          >
            <ArrowDownTrayIcon className="w-5 h-5" /> Download JSON
          </button>
        </div>

        {progress && (
          <div className="mt-6 text-sm text-center text-slate-300 animate-pulse">
            {progress}
          </div>
        )}
      </div>
    </main>
  );
}
