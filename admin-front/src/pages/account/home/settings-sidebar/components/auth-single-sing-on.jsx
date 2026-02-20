import { FormattedMessage } from "react-intl";
import { Fragment } from 'react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AuthSingleSingOn = () => {
  const items = [
    {
      logo: 'azure.svg',
      title: 'Microsoft Azure',
      size: 'w-5',
      checked: false,
    },
    {
      logo: 'google.svg',
      title: 'Google',
      size: 'w-8',
      checked: true,
    },
    {
      logo: 'openid.svg',
      title: 'OpenID Connect',
      size: 'w-24',
      checked: false,
    },
  ];

  const renderItem = (item, index) => {
    return (
      <Label
        key={index}
        className="flex align-stretch cursor-pointer bg-center h-44 bg-no-repeat border border-input rounded-xl border-dashed has-checked:border-primary bg-[length:500px] sso-active singl-sign-on-bg"
      >
        <div className="flex flex-col place-items-center place-content-center rounded-xl grow">
          <div className="flex items-center h-11">
            <img
              src={toAbsoluteUrl(`/media/brand-logos/${item.logo}`)}
              className={item.size}
              alt="image"
            />
          </div>
          <span className="text-base font-medium text-mono">{item.title}</span>
          <Input
            className="peer hidden"
            type="radio"
            name="sso_option"
            defaultChecked={index === 1}
          />
        </div>
      </Label>
    );
  };

  return (
    <Fragment>
      <style>
        {`
          .singl-sign-on-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/bg-2.png')}');
          }
          .dark .singl-sign-on-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/bg-2-dark.png')}');
          }
        `}
      </style>
      <Card>
        <CardHeader id="auth_social_sign_in_sso">
          <CardTitle><FormattedMessage id="UI.SINGLE_SIGN_ONSSO" /></CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-7.5">
          <div className="grid gap-7">
            <div className="text-base font-semibold text-mono">
              <FormattedMessage id="UI.1_SELECT_SSO_INTEGRATION_TYPE" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-7.5">
              {items.map((item, index) => {
                return renderItem(item, index);
              })}
            </div>
            <style>
              {`
                .sso-active:has(:checked) {
                  background-image: url('${toAbsoluteUrl('/media/images/2600x1600/bg-1.png')}');
                }
                .dark .sso-active:has(:checked) {
                  background-image: url('${toAbsoluteUrl('/media/images/2600x1600/bg-1-dark.png')}');
                }
              `}
            </style>
          </div>
          <div className="border-b border-border"></div>
          <div className="grid gap-7">
            <div className="text-base font-semibold text-mono">
              <FormattedMessage id="UI.2_CONFIGURE_GOOGLE_AUTHENTICATION" />
            </div>
            <div className="w-full">
              <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                <Label className="flex w-full max-w-56"><FormattedMessage id="UI.CLIENT_ID" /></Label>
                <Input type="text" placeholder="02874374-367145773" />
              </div>
            </div>
            <div className="w-full">
              <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                <Label className="flex w-full max-w-56"><FormattedMessage id="UI.CLIENT_SECRET" /></Label>
                <Input
                  type="text"
                  placeholder="23djfn784957f8022we2232307822-cey2442"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button><FormattedMessage id="UI.SAVE_CHANGES" /></Button>
            </div>
          </div>
          <div className="border-b border-border"></div>
          <div className="grid gap-7">
            <div className="text-base font-semibold text-mono">
              <FormattedMessage id="UI.3_NOTE_DOWN_CUSTOM_URL_FOR_GOOGLE_SSO_AU" />
            </div>
            <div className="w-full">
              <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                <Label className="flex w-full max-w-56"><FormattedMessage id="UI.CUSTOM_LOGIN_UTL" /></Label>
                <div className="grow">
                  <div className="flex items-center">
                    <Input
                      type="text"
                      placeholder="https://devs.keenthemes.com/rl/AirMikeStudios"
                      className="rounded-r-none border-r-0 focus:ring-0 focus:ring-offset-0"
                    />

                    <Button className="rounded-l-none border-l-0"><FormattedMessage id="UI.COPY" /></Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-b border-border"></div>
          <div className="form-info pb-5 text-foreground font-normal">
            <FormattedMessage id="UI.SINGLE_SIGNON_SSO_AUTHENTICATION_STREAML" />
          </div>
        </CardContent>
      </Card>
    </Fragment>
  );
};

export { AuthSingleSingOn };
