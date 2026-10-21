import Link from "next/link";

function getPageHref(basePath, page) {
  return page === 1 ? basePath : `${basePath}?page=${page}`;
}

export default function BlogPagination({ basePath, currentPage, totalPages }) {
  if (totalPages <= 1) return null;

  const firstPage = Math.max(1, currentPage - 2);
  const lastPage = Math.min(totalPages, currentPage + 2);

  return (
    <nav aria-label="Article pages" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {currentPage > 1 && (
        <>
          <link rel="prev" href={getPageHref(basePath, currentPage - 1)} />
          <Link
            href={getPageHref(basePath, currentPage - 1)}
            rel="prev"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-700 hover:text-emerald-800"
          >
            Previous
          </Link>
        </>
      )}

      {firstPage > 1 && (
        <>
          <Link href={getPageHref(basePath, 1)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700">
            1
          </Link>
          {firstPage > 2 && <span aria-hidden="true" className="px-1 text-slate-400">…</span>}
        </>
      )}

      {Array.from({ length: lastPage - firstPage + 1 }, (_, index) => firstPage + index).map((page) => (
        <Link
          key={page}
          href={getPageHref(basePath, page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
            page === currentPage
              ? "border-emerald-800 bg-emerald-800 text-white"
              : "border-slate-300 text-slate-700 hover:border-emerald-700 hover:text-emerald-800"
          }`}
        >
          {page}
        </Link>
      ))}

      {lastPage < totalPages && (
        <>
          {lastPage < totalPages - 1 && <span aria-hidden="true" className="px-1 text-slate-400">…</span>}
          <Link href={getPageHref(basePath, totalPages)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700">
            {totalPages}
          </Link>
        </>
      )}

      {currentPage < totalPages && (
        <>
          <link rel="next" href={getPageHref(basePath, currentPage + 1)} />
          <Link
            href={getPageHref(basePath, currentPage + 1)}
            rel="next"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-700 hover:text-emerald-800"
          >
            Next
          </Link>
        </>
      )}
    </nav>
  );
}
