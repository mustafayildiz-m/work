import { FormattedMessage } from "react-intl";
import {
  ChannelStats,
  QuickActions,
  ActivityFeed,
  StatsChart,
  PrayerTimesBanner,
  PendingTasks,
  LanguageDistributionChart,
} from './components';

export function Demo1LightSidebarContent() {
  return (
    <div className="dashboard-home w-full min-w-0 space-y-5 sm:space-y-6 lg:space-y-8">
      <PrayerTimesBanner />
      <div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
          <FormattedMessage id="UI.GENEL_ISTATISTIKLER" />
        </h3>
        <ChannelStats />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <PendingTasks />
        <LanguageDistributionChart />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="xl:col-span-2 min-w-0">
          <StatsChart />
        </div>
        <div className="xl:col-span-1 min-w-0">
          <QuickActions />
        </div>
      </div>
      <div className="min-w-0">
        <ActivityFeed />
      </div>
    </div>
  );
}
