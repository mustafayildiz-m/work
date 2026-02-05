/**
 * Text-to-Speech Utility Functions
 * Provides high-quality voice selection for all languages
 */

/**
 * Get the best available voice for English (special handling)
 * @param {Array<SpeechSynthesisVoice>} voices - All available voices
 * @returns {SpeechSynthesisVoice|null}
 */
export const getBestEnglishVoice = (voices) => {
  const englishVoices = voices.filter(voice => 
    voice.lang.toLowerCase().startsWith('en')
  );
  
  if (englishVoices.length === 0) {
    return null;
  }
  
  // Priority list for English voices (from best to worst)
  const preferredNames = [
    'google uk english female',
    'google us english female',
    'google english',
    'samantha',  // macOS - excellent quality
    'karen',     // macOS - excellent quality
    'victoria',  // macOS - good quality
    'alex',      // macOS - good quality
    'daniel',    // macOS UK - good quality
    'microsoft zira',
    'microsoft david',
    'hazel',
    'fiona',
    'moira'
  ];
  
  // Try to find preferred voices in order
  for (const preferredName of preferredNames) {
    const voice = englishVoices.find(v => 
      v.name.toLowerCase().includes(preferredName)
    );
    if (voice) {
      return voice;
    }
  }
  
  // Look for any Google voice
  const googleVoice = englishVoices.find(v => 
    v.name.toLowerCase().includes('google')
  );
  if (googleVoice) {
    return googleVoice;
  }
  
  // Look for Premium/Natural voices
  const premiumVoice = englishVoices.find(v => {
    const name = v.name.toLowerCase();
    return name.includes('premium') || 
           name.includes('natural') || 
           name.includes('enhanced') ||
           name.includes('neural');
  });
  if (premiumVoice) {
    return premiumVoice;
  }
  
  // Prefer female voices (usually clearer)
  const femaleVoice = englishVoices.find(v => 
    v.name.toLowerCase().includes('female')
  );
  if (femaleVoice) {
    return femaleVoice;
  }
  
  // Last resort: first English voice
  return englishVoices[0];
};

/**
 * Get the best available voice for Chinese (special handling)
 * @param {Array<SpeechSynthesisVoice>} voices - All available voices
 * @returns {SpeechSynthesisVoice|null}
 */
export const getBestChineseVoice = (voices) => {
  const chineseVoices = voices.filter(voice => 
    voice.lang.toLowerCase().startsWith('zh')
  );
  
  if (chineseVoices.length === 0) {
    return null;
  }
  
  // Avoid low-quality Eloquence voices (Eddy, Flo, Grandma, etc.)
  const eloquenceKeywords = ['eddy', 'flo', 'grandma', 'grandpa', 'reed', 'rocko', 'sandy', 'shelley'];
  
  // Priority list for Chinese voices (from best to worst)
  const preferredNames = [
    'google 普通话',
    'google mandarin',
    'google chinese',
    'tingting',   // macOS - good quality
    'meijia',     // macOS - good quality
    'sinji',      // macOS Hong Kong
    'microsoft huihui',
    'microsoft yaoyao'
  ];
  
  // Try to find preferred voices in order (excluding eloquence)
  for (const preferredName of preferredNames) {
    const voice = chineseVoices.find(v => {
      const name = v.name.toLowerCase();
      const hasEloquence = eloquenceKeywords.some(kw => name.includes(kw));
      return name.includes(preferredName) && !hasEloquence;
    });
    if (voice) {
      return voice;
    }
  }
  
  // Look for any Google voice
  const googleVoice = chineseVoices.find(v => 
    v.name.toLowerCase().includes('google')
  );
  if (googleVoice) {
    return googleVoice;
  }
  
  // Look for Premium/Natural voices (excluding eloquence)
  const premiumVoice = chineseVoices.find(v => {
    const name = v.name.toLowerCase();
    const hasEloquence = eloquenceKeywords.some(kw => name.includes(kw));
    return !hasEloquence && (
      name.includes('premium') || 
      name.includes('natural') || 
      name.includes('enhanced') ||
      name.includes('neural')
    );
  });
  if (premiumVoice) {
    return premiumVoice;
  }
  
  // Find first non-eloquence voice
  const nonEloquenceVoice = chineseVoices.find(v => {
    const name = v.name.toLowerCase();
    return !eloquenceKeywords.some(kw => name.includes(kw));
  });
  if (nonEloquenceVoice) {
    return nonEloquenceVoice;
  }
  
  // Last resort: first Chinese voice
  return chineseVoices[0];
};

/**
 * Get the best available voice for a given language
 * Priority: Google voices > Premium/Enhanced > Local > Remote
 * 
 * @param {string} langCode - Language code (e.g., 'en-US', 'tr-TR')
 * @returns {SpeechSynthesisVoice|null} - Best available voice or null
 */
export const getBestVoice = (langCode) => {
  const voices = window.speechSynthesis.getVoices();
  
  if (!langCode || voices.length === 0) {
    return null;
  }
  
  // Normalize language code
  const normalizedLang = langCode.toLowerCase();
  const baseLanguage = normalizedLang.split('-')[0];
  
  // Special handling for English
  if (baseLanguage === 'en') {
    return getBestEnglishVoice(voices);
  }
  
  // Special handling for Chinese
  if (baseLanguage === 'zh') {
    return getBestChineseVoice(voices);
  }
  
  // Special handling for Japanese
  if (baseLanguage === 'ja') {
    return getBestJapaneseVoice(voices);
  }
  
  // Find all voices matching the language
  const matchingVoices = voices.filter(voice => {
    const voiceLang = voice.lang.toLowerCase();
    return voiceLang.includes(baseLanguage);
  });
  
  if (matchingVoices.length === 0) {
    return null;
  }
  
  // Priority 1: Google voices (highest quality)
  const googleVoice = matchingVoices.find(voice => 
    voice.name.toLowerCase().includes('google')
  );
  if (googleVoice) {
    return googleVoice;
  }
  
  // Priority 2: Premium/Enhanced/Natural voices
  const premiumVoice = matchingVoices.find(voice => {
    const name = voice.name.toLowerCase();
    return name.includes('premium') ||
           name.includes('enhanced') ||
           name.includes('natural') ||
           name.includes('neural');
  });
  if (premiumVoice) {
    return premiumVoice;
  }
  
  // Priority 3: Local voices (faster, offline capable)
  const localVoice = matchingVoices.find(voice => voice.localService);
  if (localVoice) {
    return localVoice;
  }
  
  // Priority 4: First matching voice (fallback)
  return matchingVoices[0];
};

/**
 * Convert language code to full locale code
 * 
 * @param {string} lang - Language code (e.g., 'en', 'tr', 'ar')
 * @returns {string} - Full locale code (e.g., 'en-US', 'tr-TR', 'ar-SA')
 */
export const getLanguageCode = (lang) => {
  if (!lang) return 'en-US';
  
  const languageMap = {
    'tr': 'tr-TR',
    'en': 'en-US',
    'ar': 'ar-SA',
    'de': 'de-DE',
    'fr': 'fr-FR',
    'es': 'es-ES',
    'it': 'it-IT',
    'ru': 'ru-RU',
    'zh': 'zh-CN',
    'ja': 'ja-JP',
    'ko': 'ko-KR',
    'pt': 'pt-BR',
    'nl': 'nl-NL',
    'pl': 'pl-PL',
    'sv': 'sv-SE',
    'no': 'no-NO',
    'da': 'da-DK',
    'fi': 'fi-FI',
    'hi': 'hi-IN',
    'bn': 'bn-IN',
    'ur': 'ur-PK',
    'fa': 'fa-IR',
    'he': 'he-IL',
    'el': 'el-GR',
    'cs': 'cs-CZ',
    'hu': 'hu-HU',
    'ro': 'ro-RO',
    'bg': 'bg-BG',
    'uk': 'uk-UA',
    'vi': 'vi-VN',
    'th': 'th-TH',
    'id': 'id-ID',
    'ms': 'ms-MY',
    'tl': 'tl-PH',
  };
  
  return languageMap[lang.toLowerCase()] || `${lang}-${lang.toUpperCase()}`;
};

/**
 * Wait for voices to be loaded (async)
 * Some browsers load voices asynchronously
 * 
 * @param {number} timeout - Maximum wait time in milliseconds (default: 2000)
 * @returns {Promise<void>}
 */
export const waitForVoices = (timeout = 2000) => {
  return new Promise((resolve) => {
    if (window.speechSynthesis.getVoices().length > 0) {
      resolve();
      return;
    }
    
    const timeoutId = setTimeout(() => {
      console.warn('Voice loading timeout - proceeding with available voices');
      resolve();
    }, timeout);
    
    window.speechSynthesis.onvoiceschanged = () => {
      clearTimeout(timeoutId);
      console.log('✅ Voices loaded:', window.speechSynthesis.getVoices().length);
      resolve();
    };
  });
};

/**
 * Create optimized utterance with best voice
 * 
 * @param {string} text - Text to speak
 * @param {string} langCode - Language code
 * @param {number} rate - Speech rate (0.5 - 2.0, default: 1.0)
 * @param {number} pitch - Voice pitch (0.0 - 2.0, default: 1.0)
 * @param {number} volume - Volume (0.0 - 1.0, default: 1.0)
 * @returns {SpeechSynthesisUtterance}
 */
export const createOptimizedUtterance = (text, langCode, rate = 1.0, pitch = 1.0, volume = 1.0) => {
  const utterance = new SpeechSynthesisUtterance(text);
  
  utterance.lang = langCode;
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;
  
  // Set best available voice
  const bestVoice = getBestVoice(langCode);
  if (bestVoice) {
    utterance.voice = bestVoice;
  }
  
  return utterance;
};

/**
 * Get list of available voices for a language
 * 
 * @param {string} langCode - Language code
 * @returns {Array<SpeechSynthesisVoice>} - Array of available voices
 */
export const getAvailableVoices = (langCode) => {
  const voices = window.speechSynthesis.getVoices();
  const baseLanguage = langCode.toLowerCase().split('-')[0];
  
  return voices.filter(voice => 
    voice.lang.toLowerCase().includes(baseLanguage)
  );
};

/**
 * Log all available voices (for debugging)
 */
export const logAvailableVoices = () => {
  const voices = window.speechSynthesis.getVoices();
  console.group('🎤 Available Speech Synthesis Voices');
  voices.forEach(voice => {
    console.log(`${voice.name} (${voice.lang}) ${voice.localService ? '📍 Local' : '☁️ Remote'}`);
  });
  console.groupEnd();
};

/**
 * Log only English voices (for debugging English issues)
 */
export const logEnglishVoices = () => {
  const voices = window.speechSynthesis.getVoices();
  const englishVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
  
  console.group('🇬🇧 Available English Voices (' + englishVoices.length + ')');
  englishVoices.forEach((voice, index) => {
    const quality = voice.name.toLowerCase().includes('google') ? '⭐⭐⭐⭐⭐' :
                   voice.name.toLowerCase().includes('samantha') || voice.name.toLowerCase().includes('karen') ? '⭐⭐⭐⭐⭐' :
                   voice.name.toLowerCase().includes('premium') || voice.name.toLowerCase().includes('natural') ? '⭐⭐⭐⭐' :
                   voice.localService ? '⭐⭐⭐' : '⭐⭐';
    console.log(`${index + 1}. ${voice.name} (${voice.lang}) ${quality} ${voice.localService ? '📍' : '☁️'}`);
  });
  console.groupEnd();
  
  // Show which one would be selected
  const selected = getBestEnglishVoice(voices);
  if (selected) {
    console.log('✅ SELECTED:', selected.name);
  }
};

/**
 * Log only Chinese voices (for debugging Chinese issues)
 */
export const logChineseVoices = () => {
  const voices = window.speechSynthesis.getVoices();
  const chineseVoices = voices.filter(v => v.lang.toLowerCase().startsWith('zh'));
  
  const eloquenceKeywords = ['eddy', 'flo', 'grandma', 'grandpa', 'reed', 'rocko', 'sandy', 'shelley'];
  
  console.group('🇨🇳 Available Chinese Voices (' + chineseVoices.length + ')');
  chineseVoices.forEach((voice, index) => {
    const isEloquence = eloquenceKeywords.some(kw => voice.name.toLowerCase().includes(kw));
    const quality = voice.name.toLowerCase().includes('google') ? '⭐⭐⭐⭐⭐' :
                   voice.name.toLowerCase().includes('tingting') || voice.name.toLowerCase().includes('meijia') ? '⭐⭐⭐⭐' :
                   voice.name.toLowerCase().includes('premium') || voice.name.toLowerCase().includes('natural') ? '⭐⭐⭐⭐' :
                   isEloquence ? '⭐' :
                   voice.localService ? '⭐⭐⭐' : '⭐⭐';
    const warning = isEloquence ? '❌ Low-quality Eloquence' : '';
    console.log(`${index + 1}. ${voice.name} (${voice.lang}) ${quality} ${voice.localService ? '📍' : '☁️'} ${warning}`);
  });
  console.groupEnd();
  
  // Show which one would be selected
  const selected = getBestChineseVoice(voices);
  if (selected) {
    console.log('✅ SELECTED:', selected.name);
  }
};

/**
 * Get the best available voice for Japanese (special handling)
 * @param {Array<SpeechSynthesisVoice>} voices - All available voices
 * @returns {SpeechSynthesisVoice|null}
 */
export const getBestJapaneseVoice = (voices) => {
  const japaneseVoices = voices.filter(voice => 
    voice.lang.toLowerCase().startsWith('ja')
  );
  
  if (japaneseVoices.length === 0) {
    return null;
  }
  
  // Avoid low-quality Eloquence voices
  const eloquenceKeywords = ['eddy', 'flo', 'grandma', 'grandpa', 'reed', 'rocko', 'sandy', 'shelley', 'junior'];
  
  // Priority list for Japanese voices (from best to worst)
  const preferredNames = [
    'google 日本語',
    'google japanese',
    'kyoko',      // macOS - excellent quality
    'otoya',      // macOS - male voice, good quality
    'microsoft haruka',
    'microsoft ayumi'
  ];
  
  // Try to find preferred voices in order (excluding eloquence)
  for (const preferredName of preferredNames) {
    const voice = japaneseVoices.find(v => {
      const name = v.name.toLowerCase();
      const hasEloquence = eloquenceKeywords.some(kw => name.includes(kw));
      return name.includes(preferredName) && !hasEloquence;
    });
    if (voice) {
      return voice;
    }
  }
  
  // Look for any Google voice
  const googleVoice = japaneseVoices.find(v => 
    v.name.toLowerCase().includes('google')
  );
  if (googleVoice) {
    return googleVoice;
  }
  
  // Look for Premium/Natural voices (excluding eloquence)
  const premiumVoice = japaneseVoices.find(v => {
    const name = v.name.toLowerCase();
    const hasEloquence = eloquenceKeywords.some(kw => name.includes(kw));
    return !hasEloquence && (
      name.includes('premium') || 
      name.includes('natural') || 
      name.includes('enhanced') ||
      name.includes('neural')
    );
  });
  if (premiumVoice) {
    return premiumVoice;
  }
  
  // Find first non-eloquence voice
  const nonEloquenceVoice = japaneseVoices.find(v => {
    const name = v.name.toLowerCase();
    return !eloquenceKeywords.some(kw => name.includes(kw));
  });
  if (nonEloquenceVoice) {
    return nonEloquenceVoice;
  }
  
  // Last resort: first Japanese voice
  return japaneseVoices[0];
};

/**
 * Log only Japanese voices (for debugging Japanese issues)
 */
export const logJapaneseVoices = () => {
  const voices = window.speechSynthesis.getVoices();
  const japaneseVoices = voices.filter(v => v.lang.toLowerCase().startsWith('ja'));
  
  const eloquenceKeywords = ['eddy', 'flo', 'grandma', 'grandpa', 'reed', 'rocko', 'sandy', 'shelley', 'junior'];
  
  console.group('🇯🇵 Available Japanese Voices (' + japaneseVoices.length + ')');
  japaneseVoices.forEach((voice, index) => {
    const isEloquence = eloquenceKeywords.some(kw => voice.name.toLowerCase().includes(kw));
    const quality = voice.name.toLowerCase().includes('google') ? '⭐⭐⭐⭐⭐' :
                   voice.name.toLowerCase().includes('kyoko') || voice.name.toLowerCase().includes('otoya') ? '⭐⭐⭐⭐⭐' :
                   voice.name.toLowerCase().includes('premium') || voice.name.toLowerCase().includes('natural') ? '⭐⭐⭐⭐' :
                   isEloquence ? '⭐' :
                   voice.localService ? '⭐⭐⭐' : '⭐⭐';
    const warning = isEloquence ? '❌ Low-quality Eloquence' : '';
    console.log(`${index + 1}. ${voice.name} (${voice.lang}) ${quality} ${voice.localService ? '📍' : '☁️'} ${warning}`);
  });
  console.groupEnd();
  
  // Show which one would be selected
  const selected = getBestJapaneseVoice(voices);
  if (selected) {
    console.log('✅ SELECTED:', selected.name);
  }
};
