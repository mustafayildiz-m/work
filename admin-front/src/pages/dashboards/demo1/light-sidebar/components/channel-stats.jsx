import { Fragment, useEffect, useState } from 'react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ChannelStats = () => {
  const [stats, setStats] = useState({
    scholars: 0,
    books: 0,
    posts: 0,
    languages: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/statistics/counts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        // Hata durumunda stats 0 olarak kalacak
      }
    };
    fetchStats();
  }, []);

  const items = [
    { 
      logo: 'alim.svg', 
      info: stats.scholars, 
      desc: 'Kayıtlı İslam Âlimleri',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900',
      trend: 'up',
      trendValue: '+12%',
      trendText: 'Son ay'
    },
    { 
      logo: 'kitap.svg', 
      info: stats.books, 
      desc: 'Kayıtlı Kitaplar',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      iconBg: 'bg-blue-100 dark:bg-blue-900',
      trend: 'up',
      trendValue: '+8%',
      trendText: 'Son ay'
    },
    { 
      logo: 'post.svg', 
      info: stats.posts, 
      desc: 'Toplam Gönderiler',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      iconBg: 'bg-purple-100 dark:bg-purple-900',
      trend: 'up',
      trendValue: '+24%',
      trendText: 'Son ay'
    },
    { 
      logo: 'language.svg', 
      info: stats.languages, 
      desc: 'Çeviri Dilleri',
      progress: true,
      total: 200,
      percentage: (stats.languages / 200) * 100,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950',
      iconBg: 'bg-amber-100 dark:bg-amber-900',
      trend: 'up',
      trendValue: '+5%',
      trendText: 'Son ay'
    },
  ];

  const renderTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-green-600 bg-green-50 dark:bg-green-950';
    if (trend === 'down') return 'text-red-600 bg-red-50 dark:bg-red-950';
    return 'text-gray-600 bg-gray-50 dark:bg-gray-950';
  };

  const renderItem = (item, index) => {
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        <Card className={`overflow-hidden hover:shadow-2xl transition-all duration-300 h-full border-0 ${item.bgColor}`}>
          <CardContent className="p-6 h-full flex flex-col">
            {/* Header with icon and trend */}
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 rounded-2xl ${item.iconBg} flex items-center justify-center shadow-sm`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                  <img
                    src={toAbsoluteUrl(`/media/brand-logos/${item.logo}`)}
                    className="w-7"
                    alt="icon"
                  />
                </div>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getTrendColor(item.trend)}`}>
                {renderTrendIcon(item.trend)}
                <span>{item.trendValue}</span>
              </div>
            </div>

            {/* Stats number */}
            <div className="flex-1">
              <motion.div 
                className="text-4xl font-bold text-gray-900 dark:text-white mb-2"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                {item.info.toLocaleString('tr-TR')}
              </motion.div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {item.desc}
              </p>
            </div>

            {/* Progress bar for languages */}
            {item.progress && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                  <span className="font-medium">{item.info} / {item.total}</span>
                  <span className="font-medium">{Math.round(item.percentage)}%</span>
                </div>
                <Progress 
                  value={item.percentage} 
                  className="h-2"
                />
              </div>
            )}

            {/* Trend text */}
            {!item.progress && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  📈 {item.trendText}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item, index) => renderItem(item, index))}
    </div>
  );
};

export { ChannelStats };
