import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Tags = ({ title, className, sources = [] }) => {
  const renderSource = (source, index) => (
    <a
      key={index}
      href={source.url?.startsWith('http') ? source.url : `https://${source.url}`}
      target="_blank"
      rel="noopener noreferrer"
      className="no-underline"
    >
      <Badge variant="outline" className="hover:bg-primary/10 cursor-pointer">
        {source.content}
      </Badge>
    </a>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2.5 mb-2">
          {sources.length > 0 ? (
            sources.map((source, index) => renderSource(source, index))
          ) : (
            <span className="text-muted-foreground text-sm">Kaynak bulunamadı.</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export { Tags };
