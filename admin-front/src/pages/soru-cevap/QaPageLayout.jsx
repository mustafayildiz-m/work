import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrash, FaFilter } from 'react-icons/fa';

export const qaInputClass =
  'w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition';

export const qaSelectClass = `${qaInputClass} cursor-pointer`;

export const qaLabelClass = 'block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2';

export const qaTableThClass =
  'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider';

export const qaTableTdClass = 'px-6 py-4 text-sm text-gray-900 dark:text-gray-100';

export function QaPageShell({ title, width = 'wide', children }) {
  const widthClass = width === 'narrow' ? 'max-w-4xl' : width === 'medium' ? 'max-w-5xl' : 'max-w-7xl';
  return (
    <>
      {title ? (
        <Helmet>
          <title>{title}</title>
        </Helmet>
      ) : null}
      <div className={`p-6 ${widthClass} mx-auto`}>{children}</div>
    </>
  );
}

export function QaPageHeader({ title, subtitle, icon: Icon, action, backTo, backLabel }) {
  return (
    <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          {Icon ? <Icon className="text-blue-600 dark:text-blue-400" /> : null}
          {title}
        </h2>
        {subtitle ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {backTo ? (
          <Link
            to={backTo}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 flex items-center gap-2 shadow"
          >
            <FaArrowLeft size={14} />
            {backLabel}
          </Link>
        ) : null}
        {action}
      </div>
    </div>
  );
}

export function QaPrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function QaSecondaryButton({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function QaStatsGrid({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">{children}</div>;
}

export function QaStatCard({ label, value, hint, gradient, icon: Icon }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl shadow-lg p-5 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {hint ? <p className="text-white/70 text-xs mt-1">{hint}</p> : null}
        </div>
        {Icon ? <Icon className="text-5xl text-white/30" /> : null}
      </div>
    </div>
  );
}

export function QaFilterPanel({ title, children }) {
  return (
    <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-blue-600 rounded-lg">
          <FaFilter className="text-white text-lg" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export function QaContentCard({ children, className = '' }) {
  return (
    <div
      className={`rounded-xl shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

export function QaFormCard({ children }) {
  return (
    <div className="rounded-xl shadow-lg bg-white dark:bg-gray-900 p-6 md:p-8 border border-gray-200 dark:border-gray-700">
      {children}
    </div>
  );
}

export function QaTableShell({ children, empty, loading, loadingText }) {
  if (loading) {
    return (
      <QaContentCard>
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">{loadingText}</div>
      </QaContentCard>
    );
  }
  if (empty) {
    return (
      <QaContentCard>
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">{empty}</div>
      </QaContentCard>
    );
  }
  return (
    <QaContentCard>
      <div className="overflow-x-auto">{children}</div>
    </QaContentCard>
  );
}

export function QaPagination({ page, totalPages, onPrev, onNext, prevLabel, nextLabel, pageLabel }) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={onPrev}
          className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 disabled:opacity-50"
        >
          {prevLabel}
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={onNext}
          className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 disabled:opacity-50"
        >
          {nextLabel}
        </button>
      </div>
      <span className="text-sm text-gray-700 dark:text-gray-300">{pageLabel}</span>
    </div>
  );
}

export function QaActionButtons({ onEdit, onDelete, editLabel, deleteLabel }) {
  return (
    <div className="flex gap-2 items-center justify-end">
      <button
        type="button"
        onClick={onEdit}
        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 flex items-center gap-1.5"
        title={editLabel}
      >
        <FaEdit size={16} />
        <span className="text-xs font-medium hidden lg:inline">{editLabel}</span>
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 flex items-center gap-1.5"
        title={deleteLabel}
      >
        <FaTrash size={16} />
        <span className="text-xs font-medium hidden lg:inline">{deleteLabel}</span>
      </button>
    </div>
  );
}
