import { FormattedMessage } from "react-intl";
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

function getAge(birthDate, deathDate) {
  if (!birthDate) return '-';
  
  // Convert Hijri dates to numbers
  const birth = parseInt(birthDate);
  const death = deathDate ? parseInt(deathDate) : null;
  
  if (isNaN(birth)) return '-';
  
  // If death date exists, calculate age at death
  if (death && !isNaN(death)) {
    return death - birth;
  }
  
  // If no death date, calculate current age
  const currentHijriYear = new Date().getFullYear() - 579; // Approximate conversion to Hijri year
  return currentHijriYear - birth;
}

const About = ({ scholar, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader className="ps-8">
          <CardTitle><FormattedMessage id="UI.HAKKINDA" /></CardTitle>
        </CardHeader>
        <CardContent>
          <div><FormattedMessage id="UI.YUKLENIYOR" /></div>
        </CardContent>
      </Card>
    );
  }

  const tables = [
    { status: 'Doğum Yılı:', info: scholar?.birthDate ? scholar.birthDate : '-' },
    { status: 'Vefat Yılı:', info: scholar?.deathDate ? scholar.deathDate : '-' },
    { status: 'Vefat Yaşı:', info: getAge(scholar?.birthDate, scholar?.deathDate) },
    { status: 'Şehir:', info: scholar?.locationName ? scholar.locationName.split(',')[0] : '-' },
    { status: 'İlçe:', info: scholar?.locationName ? scholar.locationName.split(',')[1]?.trim() || '-' : '-' },
    { status: 'Ülke:', info: scholar?.locationName ? scholar.locationName.split(',').slice(-1)[0]?.trim() || '-' : '-' },
  ];

  const renderTable = (table, index) => {
    return (
      <TableRow key={index} className="border-0">
        <TableCell className="text-sm text-secondary-foreground py-2">
          {table.status}
        </TableCell>
        <TableCell className="text-sm text-mono py-2">{table.info}</TableCell>
      </TableRow>
    );
  };

  return (
    <Card>
      <CardHeader className="ps-8">
        <CardTitle><FormattedMessage id="UI.HAKKINDA" /></CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {tables.map((table, index) => {
              return renderTable(table, index);
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export { About };
