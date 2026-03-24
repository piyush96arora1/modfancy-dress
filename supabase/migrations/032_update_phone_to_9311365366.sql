-- Replace legacy contact +91 92110 77110 with +91 93113 65366 in Supabase-stored content (ticker, FAQs, blogs, banner links).

UPDATE banner_settings SET
  ticker_text = REPLACE(
    REPLACE(
      REPLACE(COALESCE(ticker_text, ''), '+91 92110 77110', '+91 93113 65366'),
      '92110 77110',
      '93113 65366'
    ),
    '9211077110',
    '9311365366'
  )
WHERE ticker_text IS NOT NULL
  AND (ticker_text LIKE '%92110%' OR ticker_text LIKE '%919211077110%');

UPDATE banner_settings SET
  link_url = REPLACE(link_url, '919211077110', '919311365366')
WHERE link_url IS NOT NULL AND link_url LIKE '%919211077110%';

UPDATE faqs SET
  question = REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(question, '+91 92110 77110', '+91 93113 65366'),
        '92110 77110',
        '93113 65366'
      ),
      '9211077110',
      '9311365366'
    ),
    '919211077110',
    '919311365366'
  ),
  answer = REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(answer, '+91 92110 77110', '+91 93113 65366'),
        '92110 77110',
        '93113 65366'
      ),
      '9211077110',
      '9311365366'
    ),
    '919211077110',
    '919311365366'
  )
WHERE question LIKE '%92110%'
   OR answer LIKE '%92110%'
   OR question LIKE '%919211077110%'
   OR answer LIKE '%919211077110%';

UPDATE blog_posts SET
  content = REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(content, '+91 92110 77110', '+91 93113 65366'),
        '92110 77110',
        '93113 65366'
      ),
      '9211077110',
      '9311365366'
    ),
    '919211077110',
    '919311365366'
  ),
  excerpt = REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(COALESCE(excerpt, ''), '+91 92110 77110', '+91 93113 65366'),
        '92110 77110',
        '93113 65366'
      ),
      '9211077110',
      '9311365366'
    ),
    '919211077110',
    '919311365366'
  )
WHERE content LIKE '%92110%'
   OR content LIKE '%919211077110%'
   OR COALESCE(excerpt, '') LIKE '%92110%'
   OR COALESCE(excerpt, '') LIKE '%919211077110%';
