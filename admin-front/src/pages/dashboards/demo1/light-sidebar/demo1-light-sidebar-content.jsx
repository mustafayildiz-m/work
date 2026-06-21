import { FormattedMessage } from "react-intl";
import { ChannelStats, QuickActions, ActivityFeed, StatsChart, PrayerTimesBanner } from './components';

export function Demo1LightSidebarContent() {
  return (
    <div className="w-full space-y-8">
      <PrayerTimesBanner />
      {/* Stats Cards */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          <FormattedMessage id="UI.GENEL_ISTATISTIKLER" />
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
