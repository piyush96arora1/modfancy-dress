-- Split the single business number into two: a WhatsApp chat line and a call line.
--
--   WhatsApp chat  -> +91 99537 64137   (new)
--   Call / NAP     -> +91 93113 65366   (unchanged; still in LocalBusiness schema + GBP)
--
-- Only WhatsApp-context mentions move. Rows are filtered on the literal word 'WhatsApp'
-- so any call-context mention of 93113 65366 is deliberately left alone. Mirrors the
-- approach in 032_update_phone_to_9311365366.sql.
--
-- Known affected rows at time of writing:
--   faqs        - 'How do I place an order?'
--               - 'Can I rent fancy dress online or do I need to visit the shop?'
--   blog_posts  - fancy-dress-on-rent-guide-for-parents
--               - rent-or-buy-fancy-dress-costume
--
-- Deliberately NOT touched:
--   banner_settings.ticker_text - shows the number without a WhatsApp label, so it stays
--                                 on the call line.

-- FAQs -----------------------------------------------------------------------
UPDATE faqs
SET answer = REPLACE(
      REPLACE(
        REPLACE(answer, '+91 93113 65366', '+91 99537 64137'),
        '93113 65366',
        '99537 64137'
      ),
      '9311365366',
      '9953764137'
    )
WHERE answer ILIKE '%whatsapp%'
  AND (answer LIKE '%93113 65366%' OR answer LIKE '%9311365366%');

UPDATE faqs
SET question = REPLACE(
      REPLACE(
        REPLACE(question, '+91 93113 65366', '+91 99537 64137'),
        '93113 65366',
        '99537 64137'
      ),
      '9311365366',
      '9953764137'
    )
WHERE question ILIKE '%whatsapp%'
  AND (question LIKE '%93113 65366%' OR question LIKE '%9311365366%');

-- Blog posts -----------------------------------------------------------------
UPDATE blog_posts
SET content = REPLACE(
      REPLACE(
        REPLACE(content, '+91 93113 65366', '+91 99537 64137'),
        '93113 65366',
        '99537 64137'
      ),
      '9311365366',
      '9953764137'
    )
WHERE content ILIKE '%whatsapp%'
  AND (content LIKE '%93113 65366%' OR content LIKE '%9311365366%');

UPDATE blog_posts
SET excerpt = REPLACE(
      REPLACE(
        REPLACE(COALESCE(excerpt, ''), '+91 93113 65366', '+91 99537 64137'),
        '93113 65366',
        '99537 64137'
      ),
      '9311365366',
      '9953764137'
    )
WHERE excerpt ILIKE '%whatsapp%'
  AND (excerpt LIKE '%93113 65366%' OR excerpt LIKE '%9311365366%');
