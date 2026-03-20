-- SEO guide posts: slugs wired in app/(public)/blog/[slug]/page.tsx (OccasionGuideTable / ClassicalDanceComparisonTable)
INSERT INTO blog_posts (slug, title, language, content, excerpt, published_at)
VALUES
  (
    'school-annual-function-fancy-dress-guide',
    'Fancy dress ideas for school annual function (parents'' guide)',
    'en',
    'Planning a school annual function costume does not have to be stressful. Most schools in Delhi want something stage-ready, comfortable for kids, and easy for teachers to manage on the day.

Start with the theme your school announced — patriotic days, classical dance, folk dance, or a free-theme fancy dress round. If the theme is open, pick a costume your child can walk and sit in for two to three hours.

Order at least one week ahead during peak season (August–November and January–February). If you need ten or more pieces for a class or house, ask us about wholesale pricing.

Below is a quick reference table for common occasions — you will also find it on our homepage and FAQ for easy sharing.',

    'How to pick annual function fancy dress in Delhi: themes, timing, and a quick occasion-to-costume reference.',
    NOW()
  ),
  (
    'which-classical-dance-costume-for-your-child',
    'Which classical dance costume is right for your child?',
    'en',
    'Bharatnatyam, Kathak, Odissi and Kuchipudi costumes all look different on stage — and schools often have strong preferences for the “right” silhouette and jewellery style.

Use your teacher’s syllabus as the source of truth: some schools want a simple practice set, others want full temple jewellery and hair pieces for the annual day.

If your child is between sizes, size up slightly — alterations are easier than a tight fit on stage. WhatsApp us a photo of the dress code note and we will shortlist options.

The comparison table below summarises typical costume styles and starting prices — categories link to what we usually stock.',

    'Kathak vs Bharatnatyam vs folk: costume styles, features, and how to choose for school recitals.',
    NOW()
  )
ON CONFLICT (slug) DO NOTHING;
