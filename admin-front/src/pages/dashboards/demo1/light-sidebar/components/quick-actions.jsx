import { motion } from 'framer-motion';
import { Plus, BookOpen, Users, FileText, Podcast, Calendar, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Yeni Kitap',
      icon: BookOpen,
      path: '/kitaplar/ekle',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900',
    },
    {
      title: 'Yeni Âlim',
      icon: Users,
      path: '/alimler/ekle',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
      hoverColor: 'hover:bg-emerald-100 dark:hover:bg-emerald-900',
    },
    {
      title: 'Yeni Makale',
      icon: FileText,
      path: '/makaleler/ekle',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      hoverColor: 'hover:bg-purple-100 dark:hover:bg-purple-900',
    },
    {
      title: 'Yeni Podcast',
      icon: Podcast,
      path: '/podcast/ekle',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-950',
      hoverColor: 'hover:bg-pink-100 dark:hover:bg-pink-900',
    },
    {
      title: 'Yeni Hikaye',
      icon: Calendar,
      path: '/alim-hikayeleri/ekle',
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950',
      hoverColor: 'hover:bg-amber-100 dark:hover:bg-amber-900',
    },
    {
      title: 'Yeni Stok',
      icon: Package,
      path: '/stoklar/ekle',
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950',
      hoverColor: 'hover:bg-cyan-100 dark:hover:bg-cyan-900',
    },
  ];

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Plus className="w-5 h-5" />
          Hızlı İşlemler
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(action.path)}
                className={`${action.bgColor} ${action.hoverColor} rounded-xl p-4 transition-all duration-300 cursor-pointer group`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-2 mx-auto group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                  {action.title}
                </p>
              </motion.button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export { QuickActions };

