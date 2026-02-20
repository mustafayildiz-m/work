import { FormattedMessage, useIntl } from "react-intl";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, BookOpen, Users, FileText, Podcast, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ActivityFeed = () => {
  const intl = useIntl();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/statistics/recent-activities`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();

          // Icon mapping
          const iconMap = {
            BookOpen: BookOpen,
            Users: Users,
            FileText: FileText,
            Podcast: Podcast,
            TrendingUp: TrendingUp,
          };

          // Format activities with time ago and translate titles
          const titleMap = {
            'Yeni kitap eklendi': 'UI.YENI_KITAP_EKLENDI',
            'Yeni âlim eklendi': 'UI.YENI_ALIM_EKLENDI',
            'Yeni gönderi': 'UI.YENI_GONDERI',
          };

          const formattedActivities = data.map((activity, index) => {
            const timeAgo = getTimeAgo(new Date(activity.createdAt));
            return {
              id: index + 1,
              ...activity,
              title: titleMap[activity.title]
                ? intl.formatMessage({ id: titleMap[activity.title] })
                : activity.title,
              icon: iconMap[activity.icon] || FileText,
              time: timeAgo,
            };
          });

          setActivities(formattedActivities);
        } else {
          console.error('Failed to fetch activities');
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [intl.locale]); // Re-fetch or re-format when locale changes

  // Helper function to format time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return intl.formatMessage({ id: 'UI.AZ_ONCE' });
    if (diffMins < 60) return `${diffMins} ${intl.formatMessage({ id: 'UI.DAKIKA_ONCE' })}`;
    if (diffHours < 24) return `${diffHours} ${intl.formatMessage({ id: 'UI.SAAT_ONCE' })}`;
    if (diffDays < 7) return `${diffDays} ${intl.formatMessage({ id: 'UI.GUN_ONCE' })}`;

    return date.toLocaleDateString(intl.locale === 'tr' ? 'tr-TR' : 'en-US');
  };

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5" />
            <FormattedMessage id="UI.SON_AKTIVITELER" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5" />
          <FormattedMessage id="UI.SON_AKTIVITELER" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start gap-3 group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
              >
                <div className={`w-10 h-10 rounded-full ${activity.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {activity.time}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export { ActivityFeed };

