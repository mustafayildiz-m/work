import QuestionsListClient from './components/QuestionsListClient';

export async function generateMetadata({ params }) {
  const { langCode } = params;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  try {
    const res = await fetch(`${API_URL}/languages/qa/search?q=${langCode}&limit=1`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const [lang] = await res.json();
      if (lang) {
        return {
          title: `${lang.nativeName} - Questions & Answers | Islamic Windows`,
          description: `Islamic Q&A in ${lang.englishName} (${lang.nativeName}). ${lang.questionCount} questions available.`,
          alternates: {
            languages: { [langCode]: `/feed/questions/${langCode}` },
          },
        };
      }
    }
  } catch {
    // fallback metadata
  }

  return {
    title: `Questions & Answers | Islamic Windows`,
    description: 'Islamic Questions & Answers',
  };
}

export default function QuestionsLangPage({ params }) {
  return <QuestionsListClient langCode={params.langCode} />;
}
