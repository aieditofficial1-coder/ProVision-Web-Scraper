const INDUSTRY_MAP = [
  {
    label: 'Dental',
    keywords: ['dentist', 'dental', 'implant', 'orthodontic', 'orthodontist', 'teeth whitening', 'periodontal', 'endodontic', 'cosmetic dentistry', 'oral health', 'tooth', 'braces', 'invisalign'],
  },
  {
    label: 'Legal',
    keywords: ['law firm', 'lawyer', 'attorney', 'solicitor', 'barrister', 'legal services', 'litigation', 'legal advice', 'court', 'paralegal', 'counsel', 'law office'],
  },
  {
    label: 'Marketing Agency',
    keywords: ['marketing', 'seo', 'digital agency', 'advertising', 'branding', 'social media agency', 'content marketing', 'ppc', 'pay-per-click', 'media buying', 'pr agency', 'public relations'],
  },
  {
    label: 'SaaS',
    keywords: ['saas', 'software as a service', 'cloud platform', 'software platform', 'b2b software', 'api', 'subscription software', 'enterprise software', 'web app', 'dashboard', 'integration platform'],
  },
  {
    label: 'Healthcare',
    keywords: ['clinic', 'medical', 'hospital', 'health', 'healthcare', 'physician', 'doctor', 'gp', 'surgery', 'nurse', 'therapy', 'physiotherapy', 'wellness', 'mental health', 'pharmacy'],
  },
  {
    label: 'Real Estate',
    keywords: ['real estate', 'property', 'estate agent', 'realtor', 'lettings', 'buy to let', 'mortgage', 'land for sale', 'commercial property', 'residential', 'property management', 'conveyancing'],
  },
  {
    label: 'Construction',
    keywords: ['construction', 'builder', 'building contractor', 'civil engineering', 'renovation', 'general contractor', 'roofing', 'plumbing', 'electrical contractor', 'landscaping', 'architecture'],
  },
  {
    label: 'Finance',
    keywords: ['finance', 'financial services', 'accounting', 'accountant', 'bookkeeping', 'cpa', 'chartered accountant', 'investment', 'wealth management', 'tax', 'payroll', 'audit', 'fintech'],
  },
  {
    label: 'Insurance',
    keywords: ['insurance', 'insurer', 'underwriting', 'life insurance', 'health insurance', 'car insurance', 'home insurance', 'broker', 'policy', 'claims'],
  },
  {
    label: 'Coaching',
    keywords: ['coaching', 'life coach', 'business coach', 'executive coach', 'mentoring', 'personal development', 'training program', 'leadership coaching', 'career coaching'],
  },
  {
    label: 'E-Commerce',
    keywords: ['shop', 'store', 'ecommerce', 'e-commerce', 'online store', 'buy now', 'add to cart', 'shopify', 'woocommerce', 'retail', 'marketplace', 'products'],
  },
  {
    label: 'Education',
    keywords: ['school', 'university', 'college', 'education', 'tutor', 'tutoring', 'learning', 'academy', 'e-learning', 'online course', 'training', 'certification'],
  },
  {
    label: 'Hospitality',
    keywords: ['hotel', 'restaurant', 'cafe', 'catering', 'hospitality', 'bar', 'venue', 'events', 'food delivery', 'bed and breakfast', 'resort', 'cuisine'],
  },
  {
    label: 'Technology',
    keywords: ['technology', 'it services', 'tech company', 'cybersecurity', 'data science', 'machine learning', 'artificial intelligence', 'cloud computing', 'devops', 'blockchain'],
  },
  {
    label: 'Recruitment',
    keywords: ['recruitment', 'staffing', 'hiring', 'talent acquisition', 'headhunter', 'job placement', 'employment agency', 'executive search', 'hr services'],
  },
  {
    label: 'Logistics',
    keywords: ['logistics', 'freight', 'shipping', 'courier', 'supply chain', 'warehousing', 'delivery', 'transport', 'haulage', 'distribution'],
  },
  {
    label: 'Media & Publishing',
    keywords: ['media', 'news', 'publishing', 'magazine', 'newspaper', 'blog', 'podcast', 'broadcasting', 'journalism', 'content creation'],
  },
  {
    label: 'Non-Profit',
    keywords: ['charity', 'non-profit', 'nonprofit', 'foundation', 'ngo', 'volunteer', 'donation', 'fundraising', 'community', 'social enterprise'],
  },
];

export function detectIndustry(text) {
  if (!text) return 'Not Available';
  const lower = text.toLowerCase();
  const scores = {};
  for (const industry of INDUSTRY_MAP) {
    let score = 0;
    for (const keyword of industry.keywords) {
      if (lower.includes(keyword)) {
        score += keyword.split(' ').length;
      }
    }
    if (score > 0) scores[industry.label] = score;
  }
  if (Object.keys(scores).length === 0) return 'Not Available';
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}
