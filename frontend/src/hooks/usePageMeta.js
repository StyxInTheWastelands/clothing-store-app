import { useEffect } from 'react';

// Ustawia tytuł karty i meta description dla danej podstrony (SPA nie robi tego automatycznie)
export default function usePageMeta(title, description) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} — Urban Stitch` : 'Urban Stitch';

    let meta = document.querySelector('meta[name="description"]');
    const prevDescription = meta ? meta.getAttribute('content') : null;
    if (description && meta) {
      meta.setAttribute('content', description);
    }

    return () => {
      document.title = prevTitle;
      if (meta && prevDescription !== null) meta.setAttribute('content', prevDescription);
    };
  }, [title, description]);
}
