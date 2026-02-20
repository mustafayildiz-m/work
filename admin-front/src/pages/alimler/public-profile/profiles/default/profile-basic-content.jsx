import { FormattedMessage } from "react-intl";
import {
  About,
  CommunityBadges,
  Contributions,
  Contributors,
  MediaUploads,
  Projects,
  RecentUploads,
  Tags,
  UnlockPartnerships,
  WorkExperience,
} from './components';
import { MapView } from './components/map-view';
import { RelatedBooks } from './components/related-books';

export function ProfileDefaultContent({ scholar, loading }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
      {/* Sol Kolon - Profil Bilgileri */}
      <div className="col-span-1">
        <div className="grid gap-6 lg:gap-8">
          {/*<CommunityBadges title="Community Badges" />*/}
          <About scholar={scholar} loading={loading} />
          {/*<WorkExperience />*/}
          <Tags title="Kaynaklar" sources={scholar?.sources || []} />
          {/*<RecentUploads title="Recent Uploads" />*/}
        </div>
      </div>
      {/* Orta Kolon - Biyografi ve Konum */}
      <div className="col-span-2">
        <div className="flex flex-col gap-6 lg:gap-8">
          {/* Biyografi Bölümü */}
          {scholar?.biography && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <FormattedMessage id="UI.BIYOGRAFI" />
              </h2>
              <div 
                className="text-gray-700 dark:text-gray-300 leading-relaxed prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: scholar.biography }}
              />
            </div>
          )}

          {/* Konum Bölümü */}
          {scholar?.latitude && scholar?.longitude && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <FormattedMessage id="UI.KONUM" />
              </h2>
              <MapView
                latitude={scholar.latitude}
                longitude={scholar.longitude}
                locationName={scholar.locationName}
              />
            </div>
          )}
          {/*<div className="flex flex-col gap-5 lg:gap-7.5">*/}
          {/*  <UnlockPartnerships />*/}
          {/*  <MediaUploads />*/}
          {/*</div>*/}
          {/*<div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5">*/}
          {/*  <Contributors />*/}
          {/*  <Contributions title="Assistance" />*/}
          {/*</div>*/}
        </div>
      </div>
      {/* Alt Bölüm - Kitaplar */}
      <div className="col-span-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-md">
          <Projects books={scholar?.ownBooks || []} />
        </div>
      </div>
      {/*<div className="col-span-3">*/}
      {/*  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-md">*/}
      {/*    <RelatedBooks books={scholar?.relatedBooks || []} />*/}
      {/*  </div>*/}
      {/*</div>*/}
    </div>
  );
}
