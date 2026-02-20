import { FormattedMessage } from "react-intl";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith(BASE_URL)) return url;
  return BASE_URL.replace(/\/$/, '') + (url.startsWith('/') ? url : '/' + url);
};

export function RelatedBooks({ books = [] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4"><FormattedMessage id="UI.BAGLANTILI_KITAPLAR" /></h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {books.length > 0 ? (
          books.map((book) => (
            <Card key={book.id} className="flex flex-col h-full">
              <CardHeader>
                <CardTitle>{book.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-3">
                {(book.coverUrl || book.coverImage) && (
                  <img
                    src={getImageUrl(book.coverUrl || book.coverImage)}
                    alt={book.title}
                    style={{ width: 80, height: 120, objectFit: 'cover', borderRadius: 6 }}
                  />
                )}
                <div className="w-full">
                  <div className="text-sm text-secondary-foreground mb-1"><b><FormattedMessage id="UI.YAZAR" /></b> {book.author || '-'}</div>
                  <div className="text-sm text-secondary-foreground mb-1"><b><FormattedMessage id="UI.YAYIN_TARIHI" /></b> {book.publishDate || '-'}</div>
                  <div className="text-sm text-secondary-foreground mb-2"><b><FormattedMessage id="UI.OZET" /></b> {book.summary || '-'}</div>
                  {book.languages && book.languages.length > 0 && book.languages[0].pdfUrl && (
                    <a
                      href={getImageUrl(book.languages[0].pdfUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 px-3 py-1 bg-primary text-white rounded text-xs hover:bg-primary-dark"
                    >
                      <FormattedMessage id="UI.PDF_INDIR" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground"><FormattedMessage id="UI.BAGLANTILI_KITAP_BULUNAMADI" /></div>
        )}
      </div>
    </div>
  );
} 