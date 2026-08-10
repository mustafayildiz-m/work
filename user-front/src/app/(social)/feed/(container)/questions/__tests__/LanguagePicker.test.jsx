import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LanguagePicker from '../components/LanguagePicker';

jest.mock('@/context/useLanguageContext', () => {
  const t = (key) => {
    const map = {
      'qa.languageSearchPlaceholder': 'Search language... (e.g. العربية, Türkçe, English)',
      'qa.languageSearchAria': 'Search languages',
      'qa.searching': 'Searching...',
      'qa.noLanguagesFound': 'No languages found',
      'qa.browserDetected': 'Detected from your browser:',
      'qa.popularLanguages': 'Popular languages:',
      'qa.showAllLanguages': 'Show all languages',
      'qa.allLanguages': 'All languages:',
    };
    return map[key] || key;
  };

  return {
    useLanguage: () => ({ locale: 'en', t }),
  };
});

// Mock fetch globally
global.fetch = jest.fn();

const mockSuggested = {
  browserSuggested: {
    id: 1,
    name: 'Türkçe',
    nativeName: 'Türkçe',
    englishName: 'Turkish',
    iso639_3: 'tur',
    direction: 'ltr',
    questionCount: 50,
  },
  popular: [
    { id: 2, name: 'Arapça', nativeName: 'العربية', englishName: 'Arabic', iso639_3: 'ara', direction: 'rtl', questionCount: 100 },
    { id: 3, name: 'İngilizce', nativeName: 'English', englishName: 'English', iso639_3: 'eng', direction: 'ltr', questionCount: 200 },
  ],
};

const mockSearchResults = [
  { id: 4, name: 'Almanca', nativeName: 'Deutsch', englishName: 'German', iso639_3: 'deu', direction: 'ltr', questionCount: 30 },
];

const mockGrouped = [
  {
    id: 5,
    nativeName: '中文',
    englishName: 'Chinese',
    iso639_3: 'zho',
    direction: 'ltr',
    questionCount: 150,
    children: [
      { id: 6, nativeName: '普通话', englishName: 'Mandarin Chinese', iso639_3: 'cmn', direction: 'ltr', questionCount: 120 },
    ],
  },
];

describe('LanguagePicker', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    global.fetch.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render the search input', () => {
    render(<LanguagePicker suggested={mockSuggested} onSelect={mockOnSelect} />);
    expect(screen.getByTestId('language-search-input')).toBeInTheDocument();
  });

  it('should display the language picker card', () => {
    render(<LanguagePicker suggested={mockSuggested} onSelect={mockOnSelect} />);
    expect(screen.getByTestId('language-picker')).toBeInTheDocument();
  });

  it('should show browser-suggested language when no query', () => {
    render(<LanguagePicker suggested={mockSuggested} onSelect={mockOnSelect} />);
    expect(screen.getByTestId('browser-suggested')).toBeInTheDocument();
    expect(screen.getByText('Türkçe')).toBeInTheDocument();
  });

  it('should show popular languages when no query', () => {
    render(<LanguagePicker suggested={mockSuggested} onSelect={mockOnSelect} />);
    expect(screen.getByTestId('popular-languages')).toBeInTheDocument();
    expect(screen.getByText('العربية')).toBeInTheDocument();
    expect(screen.getByTestId('lang-item-eng')).toBeInTheDocument();
  });

  it('should show "Show all languages" button', () => {
    render(<LanguagePicker suggested={mockSuggested} onSelect={mockOnSelect} />);
    expect(screen.getByTestId('show-all-btn')).toBeInTheDocument();
  });

  it('should call onSelect when a language is clicked', () => {
    render(<LanguagePicker suggested={mockSuggested} onSelect={mockOnSelect} />);
    fireEvent.click(screen.getByTestId('lang-item-tur'));
    expect(mockOnSelect).toHaveBeenCalledWith(mockSuggested.browserSuggested);
  });

  it('should search languages after debounce', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSearchResults),
    });

    render(<LanguagePicker suggested={mockSuggested} onSelect={mockOnSelect} />);
    const input = screen.getByTestId('language-search-input');

    fireEvent.change(input, { target: { value: 'deutsch' } });

    act(() => {
      jest.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/languages/qa/search?q=deutsch'),
        expect.objectContaining({ headers: { 'Accept-Language': 'en' } }),
      );
    });
  });

  it('should not search for queries shorter than 2 chars', () => {
    render(<LanguagePicker suggested={mockSuggested} onSelect={mockOnSelect} />);
    const input = screen.getByTestId('language-search-input');

    fireEvent.change(input, { target: { value: 'x' } });

    act(() => {
      jest.advanceTimersByTime(350);
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should show "No languages found" when search returns empty', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<LanguagePicker suggested={mockSuggested} onSelect={mockOnSelect} />);
    const input = screen.getByTestId('language-search-input');

    fireEvent.change(input, { target: { value: 'xxxzzz' } });

    act(() => {
      jest.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(screen.getByTestId('no-results')).toBeInTheDocument();
    });
  });

  it('should load all languages on "Show all" click', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockGrouped),
    });

    render(<LanguagePicker suggested={mockSuggested} onSelect={mockOnSelect} />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('show-all-btn'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('all-languages')).toBeInTheDocument();
      expect(screen.getByText('中文')).toBeInTheDocument();
    });
  });

  it('should render RTL language items with dir=rtl', () => {
    render(<LanguagePicker suggested={mockSuggested} onSelect={mockOnSelect} />);
    const arabicItem = screen.getByTestId('lang-item-ara');
    expect(arabicItem).toHaveAttribute('dir', 'rtl');
  });

  it('should not show browser-suggested if not provided', () => {
    render(
      <LanguagePicker suggested={{ browserSuggested: null, popular: [] }} onSelect={mockOnSelect} />,
    );
    expect(screen.queryByTestId('browser-suggested')).not.toBeInTheDocument();
  });

  it('should handle fetch failure gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<LanguagePicker suggested={mockSuggested} onSelect={mockOnSelect} />);
    const input = screen.getByTestId('language-search-input');

    fireEvent.change(input, { target: { value: 'test' } });

    act(() => {
      jest.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('search-results')).toBeInTheDocument();
    });
  });
});
