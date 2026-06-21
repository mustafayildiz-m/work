import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Clock, Loader2, MapPin, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DEFAULT_LOCATION = {
  latitude: 41.0082,
  longitude: 28.9784,
  city: 'İstanbul',
  country: 'Türkiye',
};

const PRAYER_KEYS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const SABAH_PRAYER_KEYS = new Set(['Fajr', 'Sunrise']);

async function reverseGeocode(latitude, longitude) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
      { headers: { 'Accept-Language': 'tr' } },
    );
    if (!res.ok) throw new Error('reverse geocode failed');
    const data = await res.json();
    return {
      city:
        data.address?.city ||
        data.address?.town ||
        data.address?.province ||
        data.address?.state ||
        DEFAULT_LOCATION.city,
      country: data.address?.country || DEFAULT_LOCATION.country,
    };
  } catch {
    return { city: DEFAULT_LOCATION.city, country: DEFAULT_LOCATION.country };
  }
}

async function resolveLocation() {
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 1000 * 60 * 30,
        });
      });
      const { latitude, longitude } = position.coords;
      const place = await reverseGeocode(latitude, longitude);
      return { latitude, longitude, ...place, source: 'gps' };
    } catch {
      // fall through to IP lookup
    }
  }

  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude) {
        return {
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city || DEFAULT_LOCATION.city,
          country: data.country_name || DEFAULT_LOCATION.country,
          source: 'ip',
        };
      }
    }
  } catch {
    // use default
  }

  return { ...DEFAULT_LOCATION, source: 'default' };
}

function formatApiDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function parsePrayerTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function PrayerTimesBanner() {
  const intl = useIntl();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [timings, setTimings] = useState(null);
  const [hijriDate, setHijriDate] = useState('');
  const [now, setNow] = useState(() => new Date());

  const prayerLabels = useMemo(
    () => ({
      Fajr: intl.formatMessage({ id: 'UI.PRAYER_FAJR' }),
      Sunrise: intl.formatMessage({ id: 'UI.PRAYER_SUNRISE' }),
      Dhuhr: intl.formatMessage({ id: 'UI.PRAYER_DHUHR' }),
      Asr: intl.formatMessage({ id: 'UI.PRAYER_ASR' }),
      Maghrib: intl.formatMessage({ id: 'UI.PRAYER_MAGHRIB' }),
      Isha: intl.formatMessage({ id: 'UI.PRAYER_ISHA' }),
    }),
    [intl],
  );

  const loadPrayerTimes = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const resolvedLocation = await resolveLocation();
      const dateStr = formatApiDate(new Date());
      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${resolvedLocation.latitude}&longitude=${resolvedLocation.longitude}&method=13`,
      );

      if (!res.ok) throw new Error('prayer api failed');

      const payload = await res.json();
      setLocation(resolvedLocation);
      setTimings(payload.data.timings);
      setHijriDate(payload.data.date?.hijri?.date || '');
    } catch {
      setError(intl.formatMessage({ id: 'UI.PRAYER_TIMES_ERROR' }));
      setLocation(DEFAULT_LOCATION);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [intl]);

  useEffect(() => {
    loadPrayerTimes();
  }, [loadPrayerTimes]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const nextPrayer = useMemo(() => {
    if (!timings) return null;

    for (const key of PRAYER_KEYS) {
      const prayerDate = parsePrayerTime(timings[key]);
      if (prayerDate > now) {
        return { key, time: timings[key] };
      }
    }

    return { key: 'Fajr', time: timings.Fajr, tomorrow: true };
  }, [timings, now]);

  const currentPrayerKey = useMemo(() => {
    if (!timings) return null;

    let active = PRAYER_KEYS[0];
    for (const key of PRAYER_KEYS) {
      if (parsePrayerTime(timings[key]) <= now) active = key;
    }
    return active;
  }, [timings, now]);

  const localeTag = intl.locale === 'tr' ? 'tr-TR' : 'en-US';
  const gregorianDate = now.toLocaleDateString(localeTag, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-6 md:p-8 text-white shadow-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_40%)]" />

      <div className="relative z-10 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-100">
              <Clock className="size-3.5" />
              <FormattedMessage id="UI.PRAYER_TIMES_TITLE" />
            </div>
            <div className="flex items-center gap-2 text-lg font-semibold md:text-xl">
              <MapPin className="size-5 text-emerald-300 shrink-0" />
              <span>
                {loading
                  ? intl.formatMessage({ id: 'UI.PRAYER_LOCATION_LOADING' })
                  : `${location?.city || DEFAULT_LOCATION.city}, ${location?.country || DEFAULT_LOCATION.country}`}
              </span>
            </div>
            <p className="text-sm text-emerald-100/75">{gregorianDate}</p>
            {hijriDate && (
              <p className="text-xs text-emerald-100/60">
                <FormattedMessage id="UI.PRAYER_HIJRI_DATE" values={{ date: hijriDate }} />
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {nextPrayer && !loading && (
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs text-emerald-100/70">
                  <FormattedMessage id="UI.PRAYER_NEXT" />
                </p>
                <p className="text-lg font-bold">
                  {SABAH_PRAYER_KEYS.has(nextPrayer.key) && (
                    <>
                      {intl.formatMessage({ id: 'UI.PRAYER_SABAH' })} ·{' '}
                    </>
                  )}
                  {prayerLabels[nextPrayer.key]} · {nextPrayer.time}
                </p>
              </div>
            )}
            <Button
              type="button"
              size="sm"
              mode="icon"
              variant="outline"
              onClick={() => loadPrayerTimes(true)}
              disabled={loading || refreshing}
              className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              aria-label={intl.formatMessage({ id: 'UI.PRAYER_REFRESH' })}
            >
              {refreshing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-10">
            <Loader2 className="size-5 animate-spin text-emerald-300" />
            <span className="text-sm text-emerald-100/80">
              <FormattedMessage id="UI.PRAYER_TIMES_LOADING" />
            </span>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {PRAYER_KEYS.map((key) => {
              const isCurrent = currentPrayerKey === key;
              const isNext = nextPrayer?.key === key;
              const isSabah = SABAH_PRAYER_KEYS.has(key);

              return (
                <div
                  key={key}
                  className={`rounded-xl border px-4 py-4 transition-all ${
                    isNext
                      ? 'border-emerald-400/40 bg-emerald-500/20 shadow-lg shadow-emerald-500/10'
                      : isCurrent
                        ? 'border-white/20 bg-white/10'
                        : isSabah
                          ? 'border-amber-400/20 bg-amber-500/10'
                          : 'border-white/10 bg-white/5'
                  }`}
                >
                  {isSabah && (
                    <p className="mb-2 inline-flex rounded-full border border-amber-300/30 bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-100">
                      <FormattedMessage id="UI.PRAYER_SABAH" />
                    </p>
                  )}
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-100/70">
                    {prayerLabels[key]}
                  </p>
                  <p className="mt-2 text-2xl font-bold">{timings?.[key]}</p>
                  {isSabah && (
                    <p className="mt-1 text-[11px] text-amber-100/80">
                      <FormattedMessage
                        id={key === 'Fajr' ? 'UI.PRAYER_SABAH_START' : 'UI.PRAYER_SABAH_END'}
                      />
                    </p>
                  )}
                  {isNext && (
                    <p className="mt-1 text-[11px] font-semibold text-emerald-200">
                      <FormattedMessage id="UI.PRAYER_NEXT_BADGE" />
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-emerald-100/50">
          <FormattedMessage id="UI.PRAYER_TIMES_NOTE" />
        </p>
      </div>
    </div>
  );
}

export { PrayerTimesBanner };
