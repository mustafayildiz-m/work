import { FormattedMessage, useIntl } from 'react-intl';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const STATS_CHART_HEIGHT = 320;

const CHART_SERIES = [
  {
    dataKey: 'alimler',
    color: '#10b981',
    labelId: 'UI.KAYITLI_ISLAM_ALIMLERI',
    gradientId: 'colorAlimler',
  },
  {
    dataKey: 'kitaplar',
    color: '#3b82f6',
    labelId: 'UI.KAYITLI_KITAPLAR',
    gradientId: 'colorKitaplar',
  },
  {
    dataKey: 'gonderiler',
    color: '#8b5cf6',
    labelId: 'UI.TOPLAM_GONDERILER',
    gradientId: 'colorGonderiler',
  },
  {
    dataKey: 'ulkeler',
    color: '#f59e0b',
    labelId: 'UI.KAYITLI_ULKELER',
    gradientId: 'colorUlkeler',
  },
  {
    dataKey: 'diller',
    color: '#f43f5e',
    labelId: 'UI.CEVIRI_DILLERI',
    gradientId: 'colorDiller',
  },
  {
    dataKey: 'kullanicilar',
    color: '#06b6d4',
    labelId: 'UI.KULLANICILAR',
    gradientId: 'colorKullanicilar',
  },
];

function formatAxisTick(value) {
  if (value >= 1000) {
    return `${Math.round(value / 100) / 10}k`;
  }
  return value;
}

const StatsChart = () => {
  const intl = useIntl();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setChartReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const seriesLabels = useMemo(
    () =>
      CHART_SERIES.map((series) => ({
        ...series,
        name: intl.formatMessage({ id: series.labelId }),
      })),
    [intl],
  );

  useEffect(() => {
    const fetchMonthlyStats = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/statistics/monthly`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setChartData(data);
        } else {
          console.error('Failed to fetch monthly stats');
        }
      } catch (error) {
        console.error('Error fetching monthly stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyStats();
  }, []);

  const chartHeader = (
    <>
      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
        <TrendingUp className="w-5 h-5 shrink-0" />
        <FormattedMessage id="UI.AYLIK_ISTATISTIKLER" />
      </CardTitle>
      <p className="text-xs sm:text-sm text-muted-foreground">
        <FormattedMessage id="UI.AYLIK_ISTATISTIKLER_ACIKLAMA" />
      </p>
    </>
  );

  if (loading) {
    return (
      <Card className="shadow-lg min-w-0">
        <CardHeader className="pb-2">{chartHeader}</CardHeader>
        <CardContent>
          <div className="h-64 sm:h-80 flex items-center justify-center">
            <div className="animate-pulse text-gray-400">
              <FormattedMessage id="UI.YUKLENIYOR" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 min-w-0">
      <CardHeader className="pb-2">{chartHeader}</CardHeader>
      <CardContent className="min-w-0">
        <div
          className="stats-chart-wrap w-full"
          style={{ width: '100%', height: STATS_CHART_HEIGHT, minHeight: STATS_CHART_HEIGHT }}
        >
          {chartReady ? (
          <ResponsiveContainer width="100%" height={STATS_CHART_HEIGHT}>
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                {CHART_SERIES.map((series) => (
                  <linearGradient
                    key={series.gradientId}
                    id={series.gradientId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={series.color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={series.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#6b7280"
                tick={{ fontSize: 11 }}
                width={36}
                allowDecimals={false}
                tickFormatter={formatAxisTick}
              />
              <Tooltip
                formatter={(value) =>
                  Number(value).toLocaleString(intl.locale === 'tr' ? 'tr-TR' : 'en-US')
                }
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                }}
              />
              {seriesLabels.map((series) => (
                <Area
                  key={series.dataKey}
                  type="monotone"
                  dataKey={series.dataKey}
                  stroke={series.color}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#${series.gradientId})`}
                  name={series.name}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
          ) : null}
        </div>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-2">
          {seriesLabels.map((series) => (
            <div
              key={series.dataKey}
              className="flex items-center gap-1.5 min-w-0 text-[11px] sm:text-xs text-muted-foreground"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: series.color }}
              />
              <span className="truncate">{series.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export { StatsChart };
