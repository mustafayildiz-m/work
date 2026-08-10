import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import QuestionsListClient from '../components/QuestionsListClient';

jest.mock('@/context/useLanguageContext', () => {
  const t = (key, params = {}) => {
    const map = {
      'qa.searchPlaceholder': 'Search questions...',
      'qa.noResults': 'No questions found',
      'qa.errorLoading': 'Failed to load questions',
      'qa.qaCount': '{count} Q&A',
      'qa.languageNotFound': 'Language not found',
      'qa.failedToLoadLanguage': 'Failed to load language',
      'qa.backToLanguages': 'Back to Languages',
    };
    let result = map[key] || key;
    Object.keys(params).forEach((param) => {
      result = result.replace(`{${param}}`, params[param]);
    });
    return result;
  };

  return {
    useLanguage: () => ({ t }),
  };
});

global.fetch = jest.fn();

const mockLangTurkish = {
  id: 1,
  name: 'Türkçe',
  nativeName: 'Türkçe',
  englishName: 'Turkish',
  iso639_3: 'tur',
  direction: 'ltr',
  questionCount: 50,
};

const mockLangArabic = {
  id: 2,
  nativeName: 'العربية',
  englishName: 'Arabic',
  iso639_3: 'ara',
  direction: 'rtl',
  questionCount: 100,
};

const mockQaItems = {
  items: [
    {
      id: 1,
      translations: [{ languageId: 1, question: 'What is Islam?', answer: 'Islam is a monotheistic religion...' }],
      category: { translations: [{ languageId: 1, name: 'Basics' }] },
    },
    {
      id: 2,
      translations: [{ languageId: 1, question: 'What is Salah?', answer: 'Salah is the Islamic prayer...' }],
      category: { translations: [{ languageId: 1, name: 'Worship' }] },
    },
  ],
  total: 25,
};

describe('QuestionsListClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setupFetchMock = (lang, qaData = mockQaItems) => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/languages/qa/search')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([lang]) });
      }
      if (url.includes('/qa/items/search')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(qaData) });
      }
      return Promise.resolve({ ok: false });
    });
  };

  it('should render the page with LTR direction for Turkish', async () => {
    setupFetchMock(mockLangTurkish);
    render(<QuestionsListClient langCode="tur" />);

    await waitFor(() => {
      const page = screen.getByTestId('questions-list-page');
      expect(page).toHaveAttribute('dir', 'ltr');
      expect(page).toHaveAttribute('lang', 'tur');
    });
  });

  it('should render the page with RTL direction for Arabic', async () => {
    setupFetchMock(mockLangArabic);
    render(<QuestionsListClient langCode="ara" />);

    await waitFor(() => {
      const page = screen.getByTestId('questions-list-page');
      expect(page).toHaveAttribute('dir', 'rtl');
      expect(page).toHaveAttribute('lang', 'ara');
    });
  });

  it('should display language native name as title', async () => {
    setupFetchMock(mockLangTurkish);
    render(<QuestionsListClient langCode="tur" />);

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Türkçe');
    });
  });

  it('should display English name', async () => {
    setupFetchMock(mockLangTurkish);
    render(<QuestionsListClient langCode="tur" />);

    await waitFor(() => {
      expect(screen.getByTestId('english-name')).toHaveTextContent('Turkish');
    });
  });

  it('should show question count badge', async () => {
    setupFetchMock(mockLangTurkish);
    render(<QuestionsListClient langCode="tur" />);

    await waitFor(() => {
      expect(screen.getByTestId('question-count')).toHaveTextContent('25 Q&A');
    });
  });

  it('should render questions list', async () => {
    setupFetchMock(mockLangTurkish);
    render(<QuestionsListClient langCode="tur" />);

    await waitFor(() => {
      expect(screen.getByTestId('questions-list')).toBeInTheDocument();
      expect(screen.getByTestId('question-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('question-item-2')).toBeInTheDocument();
    });
  });

  it('should show pagination for multiple pages', async () => {
    setupFetchMock(mockLangTurkish);
    render(<QuestionsListClient langCode="tur" />);

    await waitFor(() => {
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });
  });

  it('should show empty state when no questions', async () => {
    setupFetchMock(mockLangTurkish, { items: [], total: 0 });
    render(<QuestionsListClient langCode="tur" />);

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });
  });

  it('should show error state when language not found', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/languages/qa/search')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      return Promise.resolve({ ok: false });
    });

    render(<QuestionsListClient langCode="xyz" />);

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });
  });

  it('should have a back button to language picker', async () => {
    setupFetchMock(mockLangTurkish);
    render(<QuestionsListClient langCode="tur" />);

    await waitFor(() => {
      const backBtn = screen.getByTestId('back-btn');
      expect(backBtn).toHaveAttribute('href', '/feed/questions');
    });
  });

  it('should have search input', async () => {
    setupFetchMock(mockLangTurkish);
    render(<QuestionsListClient langCode="tur" />);

    await waitFor(() => {
      expect(screen.getByTestId('question-search-input')).toBeInTheDocument();
    });
  });

  it('should handle search input change', async () => {
    setupFetchMock(mockLangTurkish);
    render(<QuestionsListClient langCode="tur" />);

    await waitFor(() => {
      expect(screen.getByTestId('question-search-input')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('question-search-input'), {
      target: { value: 'salah' },
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('q=salah'));
    });
  });

  it('should set RTL direction on search input for Arabic', async () => {
    setupFetchMock(mockLangArabic);
    render(<QuestionsListClient langCode="ara" />);

    await waitFor(() => {
      const input = screen.getByTestId('question-search-input');
      expect(input).toHaveAttribute('dir', 'rtl');
    });
  });
});
