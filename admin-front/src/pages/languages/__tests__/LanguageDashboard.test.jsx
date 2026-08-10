import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import LanguageDashboard from '../LanguageDashboard';

const mockDashboardData = {
  items: [
    {
      id: 1,
      nativeName: 'Türkçe',
      englishName: 'Turkish',
      iso639_3: 'tur',
      direction: 'ltr',
      questionCount: 50,
      status: 'active',
    },
    {
      id: 2,
      nativeName: 'العربية',
      englishName: 'Arabic',
      iso639_3: 'ara',
      direction: 'rtl',
      questionCount: 100,
      status: 'in_progress',
    },
    {
      id: 3,
      nativeName: 'English',
      englishName: 'English',
      iso639_3: 'eng',
      direction: 'ltr',
      questionCount: 200,
      status: 'not_published',
    },
  ],
  total: 3,
  page: 1,
  limit: 20,
  stats: {
    active: 50,
    inProgress: 30,
    notPublished: 220,
    totalQuestions: 5000,
  },
};

describe('LanguageDashboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDashboardData),
    });
  });

  it('should render the dashboard container', async () => {
    render(<LanguageDashboard />);
    await waitFor(() => {
      expect(screen.getByTestId('language-dashboard')).toBeInTheDocument();
    });
  });

  it('should display stats banner', async () => {
    render(<LanguageDashboard />);
    await waitFor(() => {
      expect(screen.getByTestId('stats-banner')).toBeInTheDocument();
      expect(screen.getByTestId('stat-active')).toHaveTextContent('50');
      expect(screen.getByTestId('stat-in-progress')).toHaveTextContent('30');
      expect(screen.getByTestId('stat-not-published')).toHaveTextContent('220');
      expect(screen.getByTestId('stat-total-questions')).toHaveTextContent('5000');
    });
  });

  it('should render the language table', async () => {
    render(<LanguageDashboard />);
    await waitFor(() => {
      expect(screen.getByTestId('language-table')).toBeInTheDocument();
      expect(screen.getByTestId('row-1')).toBeInTheDocument();
      expect(screen.getByTestId('row-2')).toBeInTheDocument();
      expect(screen.getByTestId('row-3')).toBeInTheDocument();
    });
  });

  it('should display language native names with correct direction', async () => {
    render(<LanguageDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Türkçe')).toBeInTheDocument();
      expect(screen.getByText('العربية')).toBeInTheDocument();
    });
  });

  it('should render filter inputs', async () => {
    render(<LanguageDashboard />);
    await waitFor(() => {
      expect(screen.getByTestId('filters')).toBeInTheDocument();
      expect(screen.getByTestId('filter-search')).toBeInTheDocument();
      expect(screen.getByTestId('filter-status')).toBeInTheDocument();
    });
  });

  it('should show bulk actions when items are selected', async () => {
    render(<LanguageDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('checkbox-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('checkbox-1'));
    expect(screen.getByTestId('bulk-actions')).toBeInTheDocument();
    expect(screen.getByTestId('bulk-apply-btn')).toBeInTheDocument();
  });

  it('should select all items with select-all checkbox', async () => {
    render(<LanguageDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('select-all-checkbox')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('select-all-checkbox'));
    expect(screen.getByTestId('bulk-actions')).toBeInTheDocument();
    expect(screen.getByText('3 selected')).toBeInTheDocument();
  });

  it('should trigger bulk status update', async () => {
    render(<LanguageDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('checkbox-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('checkbox-1'));
    fireEvent.click(screen.getByTestId('checkbox-2'));

    const bulkSelect = screen.getByTestId('bulk-status-select');
    fireEvent.change(bulkSelect, { target: { value: 'active' } });
    fireEvent.click(screen.getByTestId('bulk-apply-btn'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/languages/qa/bulk-status'),
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining('"status":"active"'),
        }),
      );
    });
  });

  it('should trigger individual status change', async () => {
    render(<LanguageDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('status-select-1')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('status-select-1'), {
      target: { value: 'in_progress' },
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/languages/qa/1/status'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'in_progress' }),
        }),
      );
    });
  });

  it('should filter by search query', async () => {
    render(<LanguageDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('filter-search')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('filter-search'), {
      target: { value: 'turk' },
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('q=turk'),
        expect.anything(),
      );
    });
  });

  it('should filter by status', async () => {
    render(<LanguageDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('filter-status')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('filter-status'), {
      target: { value: 'active' },
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=active'),
        expect.anything(),
      );
    });
  });

  it('should show loading state initially', () => {
    render(<LanguageDashboard />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should include authorization header in requests', async () => {
    render(<LanguageDashboard />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        }),
      );
    });
  });
});
