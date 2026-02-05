import { ChannelStats, QuickActions, ActivityFeed, StatsChart } from './components';

export function Demo1LightSidebarContent() {
  return (
    <div className="w-full space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Hoş Geldiniz! 👋</h2>
            <p className="text-blue-100 text-lg">
              Islamic Windows yönetim panelinize hoş geldiniz
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
            <p className="text-sm text-blue-100 mb-1">Bugünkü Tarih</p>
            <p className="text-xl font-semibold">
              {new Date().toLocaleDateString('tr-TR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Genel İstatistikler
        </h3>
        <ChannelStats />
      </div>

      {/* Charts and Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <StatsChart />
        </div>
        
        {/* Quick Actions - Takes 1 column */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>

      {/* Activity Feed */}
      <div>
        <ActivityFeed />
      </div>
    </div>
  );
}
