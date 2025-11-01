"use client";

import React from "react";
import { useLanguage, languages } from "@/lib/language/LanguageContext";
import { Globe } from "lucide-react";

const GlobalLanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative">
      <div className="flex items-center space-x-2 bg-slate-700 rounded-lg px-3 py-2 border border-slate-600">
        <Globe className="h-4 w-4 text-slate-400" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as any)}
          className="bg-transparent text-white text-sm focus:outline-none cursor-pointer">
          {languages.map((lang) => (
            <option
              key={lang.code}
              value={lang.code}
              className="bg-slate-700 text-white">
              {lang.nativeName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default GlobalLanguageSelector;
