import { FormattedMessage } from "react-intl";
import { useState } from 'react';
import { Copy, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input, InputWrapper } from '@/components/ui/input';

const ApiCredentials = () => {
  const [keyInput, setKeyInput] = useState('hwewe4654fdd5sdfh');

  return (
    <Card>
      <CardHeader>
        <CardTitle><FormattedMessage id="UI.API_CREDENTIALS" /></CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-foreground leading-5.5 pb-5">
          <FormattedMessage id="UI.THE_GRANTED_CREDENTIALS_SERVE_A_TWOFOLD_" />{' '}
          <Button mode="link" asChild>
            <Link to="#"><FormattedMessage id="UI.API_AUTHENTICATION" /></Link>
          </Button>{' '}
          <FormattedMessage id="UI.AND_GOVERNING_JAVASCRIPT_CUSTOMIZATION" />
        </div>
        <div className="flex flex-col flex-wrap gap-4">
          <InputWrapper>
            <Input
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
            />

            <Button variant="dim" mode="icon" className="-me-2">
              <Copy size={16} />
            </Button>
          </InputWrapper>
          <div>
            <Button>
              <KeyRound /> <FormattedMessage id="UI.ACCESS_TOKENS" />
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Button mode="link" underlined="dashed" asChild>
          <Link to="/account/api-keys"><FormattedMessage id="UI.CHECK_APIS" /></Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export { ApiCredentials };
