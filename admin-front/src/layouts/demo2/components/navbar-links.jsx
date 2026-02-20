import { FormattedMessage } from "react-intl";
export function NavbarLinks() {
  return (
    <div className="flex items-center text-sm gap-5 lg:pb-1">
      <a
        className="hover:text-primary"
        href="https://www.youtube.com/c/KeenThemesTuts/videos"
      >
        <FormattedMessage id="UI.VIDEOS" />
      </a>
      <a
        className="hover:text-primary"
        href="https://keenthemes.com/metronic/tailwind/docs/"
      >
        <FormattedMessage id="UI.USER_GUIDES" />
      </a>
      <a className="hover:text-primary" href="https://devs.keenthemes.com">
        <FormattedMessage id="UI.SUPPORT" />
      </a>
    </div>
  );
}
