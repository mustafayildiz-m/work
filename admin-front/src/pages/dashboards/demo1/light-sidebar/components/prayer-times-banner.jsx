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

function stripPrayerTimezone(timeStr) {
  return timeStr.split(' ')[0];
}

function getNextPrayerTarget(timings, now) {
  for (const key of PRAYER_KEYS) {
    const prayerDate = parsePrayerTime(stripPrayerTimezone(timings[key]));
    if (prayerDate > now) {
      return { key, time: stripPrayerTimezone(timings[key]), target: prayerDate };
    }
  }

  const tomorrowFajr = parsePrayerTime(stripPrayerTimezone(timings.Fajr));
  tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
  return {
    key: 'Fajr',
    time: stripPrayerTimezone(timings.Fajr),
    target: tomorrowFajr,
    tomorrow: true,
  };
}

function formatCountdownParts(diffMs) {
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
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
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const nextPrayer = useMemo(() => {
    if (!timings) return null;
    return getNextPrayerTarget(timings, now);
  }, [timings, now]);

  const countdown = useMemo(() => {
    if (!nextPrayer?.target) return null;
    return formatCountdownParts(nextPrayer.target - now);
  }, [nextPrayer, now]);

  const countdownLabel = useMemo(() => {
    if (!countdown) return '';
    const { hours, minutes, seconds } = countdown;
    if (hours > 0) {
      return intl.formatMessage(
        { id: 'UI.PRAYER_COUNTDOWN_HMS' },
        { hours, minutes, seconds: String(seconds).padStart(2, '0') },
      );
    }
    return intl.formatMessage(
      { id: 'UI.PRAYER_COUNTDOWN_MS' },
      { minutes, seconds: String(seconds).padStart(2, '0') },
    );
  }, [countdown, intl]);

  const currentPrayerKey = useMemo(() => {
    if (!timings) return null;

    let active = PRAYER_KEYS[0];
    for (const key of PRAYER_KEYS) {
      if (parsePrayerTime(stripPrayerTimezone(timings[key])) <= now) active = key;
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
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-4 sm:p-6 md:p-8 text-white shadow-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_40%)]" />

      <div className="relative z-10 space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="space-y-1.5 sm:space-y-2 min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-100">
              <Clock className="size-3.5" />
              <FormattedMessage id="UI.PRAYER_TIMES_TITLE" />
            </div>
            <div className="flex items-start gap-2 text-base sm:text-lg font-semibold md:text-xl">
              <MapPin className="size-5 text-emerald-300 shrink-0 mt-0.5" />
              <span className="break-words">
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

          <div className="flex items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {nextPrayer && !loading && (
              <div className="flex-1 sm:flex-none rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-3 backdrop-blur-sm min-w-0">
                <p className="text-xs text-emerald-100/70">
                  <FormattedMessage id="UI.PRAYER_NEXT" />
                </p>
                <p className="text-base sm:text-lg font-bold break-words">
                  {SABAH_PRAYER_KEYS.has(nextPrayer.key) && (
                    <>
                      {intl.formatMessage({ id: 'UI.PRAYER_SABAH' })} ·{' '}
                    </>
                  )}
                  {prayerLabels[nextPrayer.key]} · {nextPrayer.time}
                </p>
                {countdownLabel && (
                  <p className="mt-1 text-xs sm:text-sm font-mono text-emerald-200 tabular-nums break-all">
                    <FormattedMessage id="UI.PRAYER_COUNTDOWN" />: {countdownLabel}
                  </p>
                )}
              </div>
            )}
            <Button
              type="button"
              size="sm"
              mode="icon"
              variant="outline"
              onClick={() => loadPrayerTimes(true)}
              disabled={loading || refreshing}
              className="shrink-0 border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
            {PRAYER_KEYS.map((key) => {
              const isCurrent = currentPrayerKey === key;
              const isNext = nextPrayer?.key === key;
              const isSabah = SABAH_PRAYER_KEYS.has(key);

              return (
                <div
                  key={key}
                  className={`rounded-lg sm:rounded-xl border px-2.5 py-3 sm:px-4 sm:py-4 transition-all ${
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
                  <p className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-bold tabular-nums">{stripPrayerTimezone(timings?.[key])}</p>
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

        <p className="hidden sm:block text-xs text-emerald-100/50">
          <FormattedMessage id="UI.PRAYER_TIMES_NOTE" />
        </p>
      </div>
    </div>
  );
}

export { PrayerTimesBanner };
