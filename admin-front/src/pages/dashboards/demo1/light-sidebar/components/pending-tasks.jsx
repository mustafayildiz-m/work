import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  ImageOff,
  ScrollText,
  UserCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const TASK_META = {
  pending_posts: {
    labelId: 'UI.PENDING_TASK_PENDING_POSTS',
    icon: ClipboardCheck,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/50',
  },
  articles_no_pdf: {
    labelId: 'UI.PENDING_TASK_ARTICLES_NO_PDF',
    icon: ScrollText,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/50',
  },
  articles_no_cover: {
    labelId: 'UI.PENDING_TASK_ARTICLES_NO_COVER',
    icon: ImageOff,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/50',
  },
  books_no_pdf: {
    labelId: 'UI.PENDING_TASK_BOOKS_NO_PDF',
    icon: BookOpen,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/50',
  },
  scholars_no_photo: {
    labelId: 'UI.PENDING_TASK_SCHOLARS_NO_PHOTO',
    icon: UserCircle,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
  },
};

const PendingTasks = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [data, setData] = useState({ tasks: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/statistics/pending-tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          setData(await response.json());
        }
      } catch {
        // keep empty state
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
    window.addEventListener('pendingPostsUpdated', fetchTasks);
    return () => window.removeEventListener('pendingPostsUpdated', fetchTasks);
  }, []);

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 h-full min-w-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg min-w-0">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <span className="truncate">
              <FormattedMessage id="UI.PENDING_TASKS_TITLE" />
            </span>
          </CardTitle>
          {!loading && data.total > 0 && (
            <Badge variant="destructive" className="font-semibold">
              {data.total}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground animate-pulse">
            <FormattedMessage id="UI.YUKLENIYOR" />
          </div>
        ) : data.tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              <FormattedMessage id="UI.PENDING_TASKS_EMPTY" />
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {data.tasks.map((task) => {
              const meta = TASK_META[task.id];
              if (!meta) return null;
              const Icon = meta.icon;
              return (
                <li key={task.id}>
                  <button
                    type="button"
                    onClick={() => navigate(task.path)}
                    className={`w-full flex items-center gap-2 sm:gap-3 rounded-xl px-3 sm:px-4 py-3 text-left transition-all hover:scale-[1.01] min-w-0 ${meta.bg} border border-transparent hover:border-border`}
                  >
                    <div className={`shrink-0 ${meta.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="flex-1 min-w-0 text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
                      {intl.formatMessage({ id: meta.labelId })}
                    </span>
                    <Badge variant="secondary" className="font-bold tabular-nums">
                      {task.count}
                    </Badge>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export { PendingTasks };
