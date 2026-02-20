import { FormattedMessage } from "react-intl";
import { AvatarInput } from '@/partials/common/avatar-input';
import { SquarePen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

const TeamInfo = () => {
  const skills = [
    { label: 'Management' },
    { label: 'Web Design' },
    { label: 'Code Review' },
    { label: 'No-code' },
    { label: 'Webflow' },
    { label: 'AI' },
  ];

  const renderItem = (skill, index) => {
    return (
      <Badge key={index} size="md" appearance="outline">
        {skill.label}
      </Badge>
    );
  };

  return (
    <Card className="min-w-full">
      <CardHeader>
        <CardTitle><FormattedMessage id="UI.TEAM_INFO" /></CardTitle>
        <div className="flex items-center space-x-2">
          <Label htmlFor="size-sm" className="text-sm">
            <FormattedMessage id="UI.VISIBLE_TO_ALL" />
          </Label>
          <Switch id="size-sm" size="sm" />
        </div>
      </CardHeader>
      <CardContent className="card-table kt-scrollable-x-auto pb-3 p-0">
        <Table className="align-middle text-sm">
          <TableBody>
            <TableRow>
              <TableCell className="py-2 min-w-32 text-secondary-foreground font-normal">
                <FormattedMessage id="UI.THUMBNAIL" />
              </TableCell>
              <TableCell className="py-2 text-secondary-foreground font-normal min-w-32 text-sm">
                <FormattedMessage id="UI.150X150PX_JPEG_PNG_IMAGE" />
              </TableCell>
              <TableCell className="py-2 text-center min-w-16">
                <AvatarInput />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-2 text-secondary-foreground font-normal">
                <FormattedMessage id="UI.TEAM_NAME" />
              </TableCell>
              <TableCell className="py-2 text-secondary-foreground font-normal">
                <FormattedMessage id="UI.PRODUCT_MANAGEMENT" />
              </TableCell>
              <TableCell className="py-2 text-center">
                <Button variant="ghost" mode="icon">
                  <SquarePen size={16} className="text-blue-500" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-2 text-secondary-foreground font-normal">
                <FormattedMessage id="UI.DESCRIPTION" />
              </TableCell>
              <TableCell className="py-2 text-secondary-foreground font-normal">
                <FormattedMessage id="UI.WERE_OPEN_TO_PARTNERSHIPS_GUEST_POSTS_AN" />
              </TableCell>
              <TableCell className="py-2 text-center">
                <Button variant="ghost" mode="icon">
                  <SquarePen size={16} className="text-blue-500" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-3 text-secondary-foreground font-normal">
                <FormattedMessage id="UI.VIEW_AS" />
              </TableCell>
              <TableCell className="py-3 text-secondary-foreground">
                <Badge size="md" variant="success" appearance="outline">
                  <FormattedMessage id="UI.PUBLIC" />
                </Badge>
              </TableCell>
              <TableCell className="py-3 text-center">
                <Button variant="ghost" mode="icon">
                  <SquarePen size={16} className="text-blue-500" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-3 text-secondary-foreground font-normal">
                <FormattedMessage id="UI.SKILLS" />
              </TableCell>
              <TableCell className="py-3 text-secondary-foreground">
                <div className="flex flex-wrap gap-2.5">
                  {skills.map((skill, index) => {
                    return renderItem(skill, index);
                  })}
                </div>
              </TableCell>
              <TableCell className="py-3 text-center">
                <Button variant="ghost" mode="icon">
                  <SquarePen size={16} className="text-blue-500" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export { TeamInfo };
