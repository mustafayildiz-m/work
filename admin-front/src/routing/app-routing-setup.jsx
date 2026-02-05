import { AuthRouting } from '@/auth/auth-routing';
import { RequireAuth } from '@/auth/require-auth';
import { ErrorRouting } from '@/errors/error-routing';
import { Demo1Layout } from '@/layouts/demo1/layout';
import { DefaultPage } from '@/pages/dashboards';
import BookList from '@/pages/public-profile/books/BookListCards';
import AddBook from '@/pages/public-profile/books/AddBook';
import EditBook from '@/pages/public-profile/books/EditBook';
import ScholarList from '@/pages/alimler/liste';
import AddScholarPage from '@/pages/alimler/ekle';
import EditScholarPage from '@/pages/alimler/duzenle';
import StoreList from '@/pages/depolar/liste';
import AddStorePage from '@/pages/depolar/ekle';
import EditStorePage from '@/pages/depolar/duzenle';
import StockList from '@/pages/stoklar/liste';
import AddStockPage from '@/pages/stoklar/ekle';
import EditStockPage from '@/pages/stoklar/duzenle';
import StockTransferList from '@/pages/stok-transfer/liste';
import AddStockTransferPage from '@/pages/stok-transfer/ekle';
import EditStockTransferPage from '@/pages/stok-transfer/duzenle';
import StockTransferDetail from '@/pages/stok-transfer/detay';
import ArticleList from '@/pages/makaleler/liste';
import AddArticle from '@/pages/makaleler/ekle';
import EditArticle from '@/pages/makaleler/duzenle/[id]';
import PodcastList from '@/pages/podcast/liste';
import AddPodcast from '@/pages/podcast/ekle';
import EditPodcast from '@/pages/podcast/duzenle/[id]';
import YoneticilerPage from '@/pages/kullanicilar/yoneticiler';
import EditorlerPage from '@/pages/kullanicilar/editorler';
import BireyselKullanicilarPage from '@/pages/kullanicilar/bireysel';
import PostOnaylamaPage from '@/pages/kullanicilar/post-onaylama';
import {
  CampaignsCardPage,
  CampaignsListPage,
  ProfileActivityPage,
  ProfileBloggerPage,
  ProfileCompanyPage,
  ProfileCreatorPage,
  ProfileCRMPage,
  ProfileDefaultPage,
  ProfileEmptyPage,
  ProfileFeedsPage,
  ProfileGamerPage,
  ProfileModalPage,
  ProfileNetworkPage,
  ProfileNFTPage,
  ProfilePlainPage,
  ProfileTeamsPage,
  ProfileWorksPage,
  ProjectColumn2Page,
  ProjectColumn3Page,
} from '@/pages/alimler/public-profile';
import KitapDilleriList from '@/pages/kitap-dilleri/liste';
import AlimHikayesiEkle from '@/pages/alim-hikayeleri/ekle';
import AlimHikayeleriListe from '@/pages/alim-hikayeleri/liste';
import AlimHikayesiDuzenle from '@/pages/alim-hikayeleri/duzenle';
import { Navigate, Route, Routes } from 'react-router';

export function AppRoutingSetup() {
  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route element={<Demo1Layout />}>
          <Route path="/" element={<DefaultPage />} />
          <Route path="/kitaplar/liste" element={<BookList />} />
          <Route path="/kitaplar/ekle" element={<AddBook />} />
          <Route path="/kitaplar/duzenle/:id" element={<EditBook />} />
          <Route path="/alimler/liste" element={<ScholarList />} />
          <Route path="/alimler/ekle" element={<AddScholarPage />} />
          <Route path="/alimler/duzenle/:id" element={<EditScholarPage />} />
          <Route path="/alimler/profile/:id" element={<ProfileDefaultPage />} />
          <Route path="/kitap-dilleri/liste" element={<KitapDilleriList />} />
          <Route path="/depolar/liste" element={<StoreList />} />
          <Route path="/depolar/ekle" element={<AddStorePage />} />
          <Route path="/depolar/duzenle/:id" element={<EditStorePage />} />
          <Route path="/stoklar/liste" element={<StockList />} />
          <Route path="/stoklar/ekle" element={<AddStockPage />} />
          <Route path="/stoklar/duzenle/:id" element={<EditStockPage />} />
          <Route path="/stok-transfer/liste" element={<StockTransferList />} />
          <Route path="/stok-transfer/ekle" element={<AddStockTransferPage />} />
          <Route path="/stok-transfer/duzenle/:id" element={<EditStockTransferPage />} />
          <Route path="/stok-transfer/detay/:id" element={<StockTransferDetail />} />
          <Route path="/alim-hikayeleri/liste" element={<AlimHikayeleriListe />} />
          <Route path="/alim-hikayeleri/ekle" element={<AlimHikayesiEkle />} />
          <Route path="/alim-hikayeleri/duzenle/:id" element={<AlimHikayesiDuzenle />} />
          <Route path="/makaleler/liste" element={<ArticleList />} />
          <Route path="/makaleler/ekle" element={<AddArticle />} />
          <Route path="/makaleler/duzenle/:id" element={<EditArticle />} />
          <Route path="/podcast/liste" element={<PodcastList />} />
          <Route path="/podcast/ekle" element={<AddPodcast />} />
          <Route path="/podcast/duzenle/:id" element={<EditPodcast />} />
          <Route path="/kullanicilar/yoneticiler" element={<YoneticilerPage />} />
          <Route path="/kullanicilar/editorler" element={<EditorlerPage />} />
          <Route path="/kullanicilar/bireysel" element={<BireyselKullanicilarPage />} />
          <Route path="/kullanicilar/post-onaylama" element={<PostOnaylamaPage />} />
        </Route>
      </Route>
      <Route path="error/*" element={<ErrorRouting />} />
      <Route path="auth/*" element={<AuthRouting />} />
      <Route path="*" element={<Navigate to="/error/404" />} />
    </Routes>
  );
}
