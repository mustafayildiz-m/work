import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import QuestionsLandingClient from '../components/QuestionsLandingClient';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/context/useLanguageContext', () => {
  const t = (key) => {
    const map = {
      'qa.title': 'Questions & Answers',
      'qa.subtitle': 'Select your language to browse Islamic Q&A content',
      'qa.statsLanguages': 'Languages',
      'qa.statsActive': 'Active',
      'qa.statsQuestions': 'Questions',
    };
    return map[key] || key;
  };

  return {
    useLanguage: () => ({ locale: 'en', t }),
  };
});

// Mock fetch
global.fetch = jest.fn();

const mockSuggestedRes = {
  browserSuggested: {
    id: 1,
    nativeName: 'Türkçe',
    englishName: 'Turkish',
    iso639_3: 'tur',
    direction: 'ltr',
    questionCount: 50,
  },
  popular: [
    { id: 2, nativeName: 'العربية', englishName: 'Arabic', iso639_3: 'ara', direction: 'rtl', questionCount: 100 },
  ],
};

const mockStatsRes = {
  totalLanguages: 300,
  activeLanguages: 50,
  inProgressLanguages: 30,
  totalQuestions: 5000,
  topLanguages: [],
};

describe('QuestionsLandingClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockImplementation((url) => {
      if (url.includes('/languages/qa/suggested')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockSuggestedRes) });
      }
      if (url.includes('/languages/qa/stats')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockStatsRes) });
      }
      return Promise.resolve({ ok: false });
    });
  });

  it('should show loading spinner initially', () => {
    render(<QuestionsLandingClient />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should display landing page after loading', async () => {
    render(<QuestionsLandingClient />);

    await waitFor(() => {
      expect(screen.getByTestId('questions-landing')).toBeInTheDocument();
    });
  });

  it('should show the title', async () => {
    render(<QuestionsLandingClient />);

    await waitFor(() => {
      expect(screen.getByTestId('landing-title')).toHaveTextContent('Questions & Answers');
    });
  });

  it('should display statistics cards', async () => {
    render(<QuestionsLandingClient />);

    await waitFor(() => {
      expect(screen.getByTestId('stats-row')).toBeInTheDocument();
    });
    const statsRow = screen.getByTestId('stats-row');
    expect(statsRow.textContent).toContain('Languages');
    expect(statsRow.textContent).toContain('Active');
    expect(statsRow.textContent).toContain('Questions');
    expect(statsRow.textContent).toMatch(/5[,.]?000/);
  });

  it('should render the LanguagePicker', async () => {
    render(<QuestionsLandingClient />);

    await waitFor(() => {
      expect(screen.getByTestId('language-picker')).toBeInTheDocument();
    });
  });

  it('should handle API failure gracefully', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));

    render(<QuestionsLandingClient />);

    await waitFor(() => {
      expect(screen.getByTestId('questions-landing')).toBeInTheDocument();
    });
  });

  it('should not show stats when stats fetch fails', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/languages/qa/suggested')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockSuggestedRes) });
      }
      if (url.includes('/languages/qa/stats')) {
        return Promise.resolve({ ok: false });
      }
      return Promise.resolve({ ok: false });
    });

    render(<QuestionsLandingClient />);

    await waitFor(() => {
      expect(screen.getByTestId('questions-landing')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('stats-row')).not.toBeInTheDocument();
  });
});
