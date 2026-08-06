import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Languages } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const CHART_HEIGHT = 240;

const CHART_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f97316',
  '#8b5cf6',
  '#f59e0b',
  '#06b6d4',
  '#ec4899',
  '#6366f1',
  '#14b8a6',
  '#ef4444',
];

const LanguageDistributionChart = () => {
  const intl = useIntl();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setChartReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/statistics/language-distribution`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const payload = await response.json();
          setItems(payload.items || []);
        }
      } catch {
        // keep empty
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = useMemo(
    () =>
      items.map((item, index) => ({
        ...item,
        fill: CHART_COLORS[index % CHART_COLORS.length],
        label: `${item.name} (${item.percentage}%)`,
      })),
    [items],
  );

  const renderTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const item = payload[0].payload;
    return (
      <div className="rounded-lg border bg-white/95 dark:bg-gray-900/95 px-3 py-2 text-sm shadow-lg">
        <p className="font-semibold mb-1">{item.name}</p>
        <p>
          {intl.formatMessage({ id: 'UI.KAYITLI_KITAPLAR' })}:{' '}
          <strong>{item.books}</strong>
        </p>
        <p className="text-muted-foreground mt-1">
          {intl.formatMessage({ id: 'UI.TOPLAM' })}: {item.total} ({item.percentage}%)
        </p>
      </div>
    );
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 h-full min-w-0">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Languages className="w-5 h-5 shrink-0" />
          <FormattedMessage id="UI.LANGUAGE_DISTRIBUTION_TITLE" />
        </CardTitle>
        <p className="text-xs sm:text-sm text-muted-foreground">
          <FormattedMessage id="UI.LANGUAGE_DISTRIBUTION_DESC" />
        </p>
        {!loading && chartData.length > 0 && (
          <p className="text-[11px] sm:text-xs text-muted-foreground/90 mt-1">
            <FormattedMessage id="UI.LANGUAGE_DISTRIBUTION_LEGEND" />
          </p>
        )}
      </CardHeader>
      <CardContent className="min-w-0">
        {loading ? (
          <div className="h-72 flex items-center justify-center text-muted-foreground animate-pulse">
            <FormattedMessage id="UI.YUKLENIYOR" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-sm text-muted-foreground">
            <FormattedMessage id="UI.LANGUAGE_DISTRIBUTION_EMPTY" />
          </div>
        ) : (
          <>
            <div
              className="language-distribution-chart-wrap w-full"
              style={{ width: '100%', height: CHART_HEIGHT, minHeight: CHART_HEIGHT }}
            >
              {chartReady ? (
              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <PieChart margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
                  <Pie
                    data={chartData}
                    dataKey="total"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={86}
                    paddingAngle={2}
                    stroke="transparent"
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.languageId} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={renderTooltip} />
                </PieChart>
              </ResponsiveContainer>
              ) : null}
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 sm:max-h-56 overflow-y-auto pr-1">
              {chartData.map((item) => (
                <div
                  key={item.languageId}
                  className="rounded-lg border px-3 py-2.5 space-y-2 min-w-0"
                >
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="font-medium text-sm truncate">{item.name}</span>
                    </div>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold tabular-nums">
                      <FormattedMessage
                        id="UI.LANGUAGE_DIST_SHARE"
                        values={{ percent: item.percentage }}
                      />
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] sm:text-xs font-medium text-blue-700 dark:text-blue-300 tabular-nums">
                      <FormattedMessage
                        id="UI.LANGUAGE_DIST_BOOK_COUNT"
                        values={{ count: item.books }}
                      />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export { LanguageDistributionChart };
