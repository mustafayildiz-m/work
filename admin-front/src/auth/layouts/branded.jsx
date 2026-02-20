import { Link, Outlet } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Card, CardContent } from '@/components/ui/card';
import { useIntl } from 'react-intl';

export function BrandedLayout() {
  const intl = useIntl();
  const isTr = intl.locale.startsWith('tr');

  const quotesTr = [
    {
      text: "İlim öğrenmek, her Müslüman erkek ve kadına farzdır.",
      author: "Hz. Muhammed (s.a.v.)"
    },
    {
      text: "İlim, müminin yitik malıdır. Onu nerede bulursa alır.",
      author: "Hz. Muhammed (s.a.v.)"
    },
    {
      text: "İlim, amel etmek içindir. Amel etmeyen âlim, yağmur yağmayan bulut gibidir.",
      author: "İmam Gazali"
    },
    {
      text: "Allah'ım! Faydasız ilimden, korkmayan kalpten, doymayan nefisten ve kabul olunmayan duadan sana sığınırım.",
      author: "Hz. Muhammed (s.a.v.)"
    },
    {
      text: "İlim üç türlüdür: Konuşan bir dil, susan bir kalp ve amel eden organlar.",
      author: "Hz. Muhammed (s.a.v.)"
    },
    {
      text: "İlim öğrenmek için yola çıkan kimse, dönünceye kadar Allah yolundadır.",
      author: "Hz. Muhammed (s.a.v.)"
    },
    {
      text: "İlim, insanı Allah'a götüren en kısa yoldur.",
      author: "İmam Gazali"
    },
    {
      text: "İlim, insanı cehaletten kurtarır ve onu yüceltir.",
      author: "Hz. Ali (r.a.)"
    },
    {
      text: "İlim, insanın en değerli hazinesidir.",
      author: "Hz. Ömer (r.a.)"
    },
    {
      text: "İlim, insanı Allah'a yaklaştırır, cehalet ise uzaklaştırır.",
      author: "Hz. Muhammed (s.a.v.)"
    }
  ];

  const quotesEn = [
    {
      text: "Seeking knowledge is an obligation upon every Muslim.",
      author: "Prophet Muhammad (PBUH)"
    },
    {
      text: "Knowledge is the lost property of the believer. Wherever he finds it, he is most deserving of it.",
      author: "Prophet Muhammad (PBUH)"
    },
    {
      text: "Knowledge without action is like a cloud without rain.",
      author: "Imam Al-Ghazali"
    },
    {
      text: "O Allah! I seek refuge in You from knowledge that is of no benefit, from a heart that does not feel humble, from a soul that is never satisfied, and from a supplication that is not answered.",
      author: "Prophet Muhammad (PBUH)"
    },
    {
      text: "Knowledge is of three kinds: a speaking tongue, a silent heart, and acting limbs.",
      author: "Prophet Muhammad (PBUH)"
    },
    {
      text: "He who sets out in search of knowledge is in the path of Allah until he returns.",
      author: "Prophet Muhammad (PBUH)"
    },
    {
      text: "Knowledge is the shortest path to Allah.",
      author: "Imam Al-Ghazali"
    },
    {
      text: "Knowledge saves man from ignorance and exalts him.",
      author: "Ali ibn Abi Talib (RA)"
    },
    {
      text: "Knowledge is the most valuable treasure of a person.",
      author: "Umar ibn Al-Khattab (RA)"
    },
    {
      text: "Knowledge draws one closer to Allah, whereas ignorance distances one from Him.",
      author: "Prophet Muhammad (PBUH)"
    }
  ];

  const currentQuotes = isTr ? quotesTr : quotesEn;
  const randomQuote = currentQuotes[Math.floor(Math.random() * currentQuotes.length)];

  return (
    <>
      <style>
        {`
          .branded-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/bg-3.png')}');
          }
          .dark .branded-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/bg-3-dark.png')}');
          }
        `}
      </style>
      <div className="grid lg:grid-cols-2 grow">
        <div className="flex justify-center items-center p-8 lg:p-10 order-2 lg:order-1">
          <Card className="w-full max-w-[400px]">
            <CardContent className="p-6">
              <Outlet />
            </CardContent>
          </Card>
        </div>

        <div className="lg:rounded-xl lg:border lg:border-border lg:m-5 order-1 lg:order-2 bg-top xxl:bg-center xl:bg-cover bg-no-repeat branded-bg">
          <div className="flex flex-col p-8 lg:p-16 gap-6">
            <Link to="/">
              <img
                src={toAbsoluteUrl('/media/app/logo.png')}
                className="h-[96px] max-w-none mb-6"
                alt="Islamic Windows Admin"
              />
            </Link>

            <div className="flex flex-col gap-4">
              <h3 className="text-3xl font-semibold text-mono">
                {intl.formatMessage({ id: 'AUTH.BRANDED_TITLE' })}
              </h3>
              <div className="text-lg font-medium text-secondary-foreground opacity-80">
                {intl.formatMessage({ id: 'AUTH.BRANDED_SUBTITLE' })}
              </div>
              <div className="text-base font-medium text-secondary-foreground">
                {intl.formatMessage({ id: 'AUTH.BRANDED_DESC_1' })}
                <br /> {intl.formatMessage({ id: 'AUTH.BRANDED_DESC_2' })}&nbsp;
                <span className="text-mono font-semibold">
                  {intl.formatMessage({ id: 'AUTH.BRANDED_DESC_3' })}
                </span>
              </div>

              <div className="mt-8 p-6 bg-black/70 backdrop-blur-md rounded-lg shadow-lg border border-white/20">
                <blockquote className="text-lg italic text-white drop-shadow-md">
                  "{randomQuote.text}"
                </blockquote>
                <p className="text-right mt-4 text-white/90 font-semibold drop-shadow">
                  - {randomQuote.author}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
