import { FormattedMessage } from "react-intl";
import { AvatarGroup } from '@/partials/common/avatar-group';
import { DropdownMenu1 } from '@/partials/dropdown-menu/dropdown-menu-1';
import { DropdownMenu2 } from '@/partials/dropdown-menu/dropdown-menu-2';
import { EllipsisVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith(BASE_URL)) return url;
  return BASE_URL.replace(/\/$/, '') + (url.startsWith('/') ? url : '/' + url);
};

const Projects = ({ books = [] }) => {
  const items = books.length > 0
    ? books.map(book => ({
        name: book.title,
        description: book.description,
        coverUrl: getImageUrl(book.coverUrl),
      }))
    : [];

  const renderItem = (item, index) => (
    <TableRow key={index}>
      <TableCell className="text-start py-2">
        <span className="text-sm font-medium text-mono">{item.name}</span>
      </TableCell>
      <TableCell>
        <span className="text-sm">{item.description}</span>
      </TableCell>
      <TableCell>
        {item.coverUrl && (
          <img
            src={item.coverUrl}
            alt={item.name}
            style={{ width: 40, height: 60, objectFit: 'cover', borderRadius: 4 }}
          />
        )}
      </TableCell>
    </TableRow>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle><FormattedMessage id="UI.KITAPLAR" /></CardTitle>
      </CardHeader>
      <CardContent className="kt-scrollable-x-auto p-0">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead><FormattedMessage id="UI.KITAP_ADI" /></TableHead>
              <TableHead><FormattedMessage id="UI.ACIKLAMA" /></TableHead>
              <TableHead><FormattedMessage id="UI.KAPAK" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? (
              items.map(renderItem)
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  <FormattedMessage id="UI.KITAP_BULUNAMADI" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export { Projects };
