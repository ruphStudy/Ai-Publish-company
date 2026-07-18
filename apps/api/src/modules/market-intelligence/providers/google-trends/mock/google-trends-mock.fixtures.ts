import type {
  GoogleTrendsTimelineItem,
  GoogleTrendsRelatedTopic,
  GoogleTrendsRelatedQuery,
  GoogleTrendsGeoItem,
  GoogleTrendsTrendingSearchItem,
} from '../interfaces/google-trends.interface';

export interface KeywordFixture {
  keyword: string;
  trendScore: number;
  growthPercentage: number;
  searchVolume: number;
  trendDirection: 'rising' | 'stable' | 'declining';
  timeline: GoogleTrendsTimelineItem[];
  relatedTopics: { rising: GoogleTrendsRelatedTopic[]; top: GoogleTrendsRelatedTopic[] };
  relatedQueries: { rising: GoogleTrendsRelatedQuery[]; top: GoogleTrendsRelatedQuery[] };
  geoInterest: GoogleTrendsGeoItem[];
}

function buildTimeline(
  baseValue: number,
  variance: number,
  months: number = 12,
): GoogleTrendsTimelineItem[] {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const trend = Math.max(
      0,
      Math.min(100, baseValue + (i * variance) / months + Math.floor(Math.random() * 8 - 4)),
    );
    return {
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`,
      value: trend,
      isPartial: i === months - 1,
    };
  });
}

export const KEYWORD_FIXTURES: Record<string, KeywordFixture> = {
  'machine learning books': {
    keyword: 'machine learning books',
    trendScore: 87,
    growthPercentage: 34.2,
    searchVolume: 74000,
    trendDirection: 'rising',
    timeline: buildTimeline(60, 28, 12),
    relatedTopics: {
      rising: [
        { topic: 'Large Language Models', type: 'Topic', value: 'Breakout', link: '/trends/explore?q=large+language+models' },
        { topic: 'Generative AI', type: 'Topic', value: 'Breakout', link: '/trends/explore?q=generative+ai' },
        { topic: 'ChatGPT', type: 'Topic', value: 'Breakout', link: '/trends/explore?q=chatgpt' },
      ],
      top: [
        { topic: 'Machine Learning', type: 'Topic', value: 100, link: '/trends/explore?q=machine+learning' },
        { topic: 'Artificial Intelligence', type: 'Topic', value: 95, link: '/trends/explore?q=artificial+intelligence' },
        { topic: 'Deep Learning', type: 'Topic', value: 88, link: '/trends/explore?q=deep+learning' },
        { topic: 'Python Programming', type: 'Topic', value: 82, link: '/trends/explore?q=python+programming' },
        { topic: 'TensorFlow', type: 'Topic', value: 74, link: '/trends/explore?q=tensorflow' },
      ],
    },
    relatedQueries: {
      rising: [
        { query: 'llm books 2024', value: 'Breakout', link: '/trends/explore?q=llm+books+2024' },
        { query: 'generative ai books', value: 'Breakout', link: '/trends/explore?q=generative+ai+books' },
        { query: 'best ai books 2025', value: 650, link: '/trends/explore?q=best+ai+books+2025' },
        { query: 'machine learning for beginners', value: 320, link: '/trends/explore?q=machine+learning+for+beginners' },
      ],
      top: [
        { query: 'best machine learning books', value: 100, link: '/trends/explore?q=best+machine+learning+books' },
        { query: 'machine learning book python', value: 92, link: '/trends/explore?q=machine+learning+book+python' },
        { query: 'hands on machine learning', value: 88, link: '/trends/explore?q=hands+on+machine+learning' },
        { query: 'machine learning andrew ng', value: 79, link: '/trends/explore?q=machine+learning+andrew+ng' },
        { query: 'introduction to machine learning', value: 71, link: '/trends/explore?q=introduction+to+machine+learning' },
      ],
    },
    geoInterest: [
      { geoCode: 'IN', geoName: 'India', value: 100, maxValueIndex: 0 },
      { geoCode: 'US', geoName: 'United States', value: 87, maxValueIndex: 0 },
      { geoCode: 'GB', geoName: 'United Kingdom', value: 74, maxValueIndex: 0 },
      { geoCode: 'CA', geoName: 'Canada', value: 68, maxValueIndex: 0 },
      { geoCode: 'AU', geoName: 'Australia', value: 62, maxValueIndex: 0 },
      { geoCode: 'DE', geoName: 'Germany', value: 55, maxValueIndex: 0 },
      { geoCode: 'PH', geoName: 'Philippines', value: 49, maxValueIndex: 0 },
    ],
  },

  'self help books': {
    keyword: 'self help books',
    trendScore: 73,
    growthPercentage: 8.7,
    searchVolume: 246000,
    trendDirection: 'stable',
    timeline: buildTimeline(70, 5, 12),
    relatedTopics: {
      rising: [
        { topic: 'Atomic Habits', type: 'Book', value: 180, link: '/trends/explore?q=atomic+habits' },
        { topic: 'The Let Them Theory', type: 'Book', value: 'Breakout', link: '/trends/explore?q=let+them+theory' },
        { topic: 'Dopamine Nation', type: 'Book', value: 95, link: '/trends/explore?q=dopamine+nation' },
      ],
      top: [
        { topic: 'Self-Help', type: 'Topic', value: 100, link: '/trends/explore?q=self-help' },
        { topic: 'Motivation', type: 'Topic', value: 89, link: '/trends/explore?q=motivation' },
        { topic: 'Personal Development', type: 'Topic', value: 83, link: '/trends/explore?q=personal+development' },
        { topic: 'Mindfulness', type: 'Topic', value: 77, link: '/trends/explore?q=mindfulness' },
        { topic: 'Productivity', type: 'Topic', value: 71, link: '/trends/explore?q=productivity' },
      ],
    },
    relatedQueries: {
      rising: [
        { query: 'best self help books 2025', value: 210, link: '/trends/explore?q=best+self+help+books+2025' },
        { query: 'self help books for anxiety', value: 160, link: '/trends/explore?q=self+help+books+anxiety' },
        { query: 'self help books for women 2025', value: 140, link: '/trends/explore?q=self+help+books+women' },
      ],
      top: [
        { query: 'best self help books', value: 100, link: '/trends/explore?q=best+self+help+books' },
        { query: 'self help books for men', value: 87, link: '/trends/explore?q=self+help+books+men' },
        { query: 'free self help books', value: 74, link: '/trends/explore?q=free+self+help+books' },
        { query: 'self help books reddit', value: 68, link: '/trends/explore?q=self+help+books+reddit' },
        { query: 'self help books list', value: 63, link: '/trends/explore?q=self+help+books+list' },
      ],
    },
    geoInterest: [
      { geoCode: 'US', geoName: 'United States', value: 100, maxValueIndex: 0 },
      { geoCode: 'CA', geoName: 'Canada', value: 91, maxValueIndex: 0 },
      { geoCode: 'AU', geoName: 'Australia', value: 86, maxValueIndex: 0 },
      { geoCode: 'GB', geoName: 'United Kingdom', value: 80, maxValueIndex: 0 },
      { geoCode: 'IE', geoName: 'Ireland', value: 71, maxValueIndex: 0 },
      { geoCode: 'NZ', geoName: 'New Zealand', value: 65, maxValueIndex: 0 },
      { geoCode: 'IN', geoName: 'India', value: 58, maxValueIndex: 0 },
    ],
  },

  'personal finance books': {
    keyword: 'personal finance books',
    trendScore: 81,
    growthPercentage: 22.4,
    searchVolume: 135000,
    trendDirection: 'rising',
    timeline: buildTimeline(55, 26, 12),
    relatedTopics: {
      rising: [
        { topic: 'The Psychology of Money', type: 'Book', value: 280, link: '/trends/explore?q=psychology+of+money' },
        { topic: 'Financial Independence', type: 'Topic', value: 170, link: '/trends/explore?q=financial+independence' },
        { topic: 'FIRE Movement', type: 'Topic', value: 145, link: '/trends/explore?q=fire+movement' },
      ],
      top: [
        { topic: 'Personal Finance', type: 'Topic', value: 100, link: '/trends/explore?q=personal+finance' },
        { topic: 'Investing', type: 'Topic', value: 93, link: '/trends/explore?q=investing' },
        { topic: 'Budgeting', type: 'Topic', value: 85, link: '/trends/explore?q=budgeting' },
        { topic: 'Stock Market', type: 'Topic', value: 78, link: '/trends/explore?q=stock+market' },
        { topic: 'Retirement Planning', type: 'Topic', value: 69, link: '/trends/explore?q=retirement+planning' },
      ],
    },
    relatedQueries: {
      rising: [
        { query: 'best personal finance books 2025', value: 'Breakout', link: '/trends/explore?q=best+personal+finance+books+2025' },
        { query: 'personal finance books for beginners', value: 390, link: '/trends/explore?q=personal+finance+books+beginners' },
        { query: 'dave ramsey books', value: 220, link: '/trends/explore?q=dave+ramsey+books' },
      ],
      top: [
        { query: 'best personal finance books', value: 100, link: '/trends/explore?q=best+personal+finance+books' },
        { query: 'rich dad poor dad', value: 94, link: '/trends/explore?q=rich+dad+poor+dad' },
        { query: 'the psychology of money', value: 89, link: '/trends/explore?q=the+psychology+of+money' },
        { query: 'personal finance 101', value: 72, link: '/trends/explore?q=personal+finance+101' },
        { query: 'financial freedom book', value: 67, link: '/trends/explore?q=financial+freedom+book' },
      ],
    },
    geoInterest: [
      { geoCode: 'US', geoName: 'United States', value: 100, maxValueIndex: 0 },
      { geoCode: 'IN', geoName: 'India', value: 78, maxValueIndex: 0 },
      { geoCode: 'CA', geoName: 'Canada', value: 74, maxValueIndex: 0 },
      { geoCode: 'AU', geoName: 'Australia', value: 70, maxValueIndex: 0 },
      { geoCode: 'GB', geoName: 'United Kingdom', value: 67, maxValueIndex: 0 },
      { geoCode: 'NG', geoName: 'Nigeria', value: 59, maxValueIndex: 0 },
      { geoCode: 'PH', geoName: 'Philippines', value: 54, maxValueIndex: 0 },
    ],
  },

  'business books': {
    keyword: 'business books',
    trendScore: 68,
    growthPercentage: 3.1,
    searchVolume: 320000,
    trendDirection: 'stable',
    timeline: buildTimeline(65, 4, 12),
    relatedTopics: {
      rising: [
        { topic: 'AI Business Strategy', type: 'Topic', value: 'Breakout', link: '/trends/explore?q=ai+business+strategy' },
        { topic: 'Entrepreneurship 2025', type: 'Topic', value: 120, link: '/trends/explore?q=entrepreneurship+2025' },
        { topic: 'Startup Books', type: 'Topic', value: 95, link: '/trends/explore?q=startup+books' },
      ],
      top: [
        { topic: 'Business', type: 'Topic', value: 100, link: '/trends/explore?q=business' },
        { topic: 'Entrepreneurship', type: 'Topic', value: 88, link: '/trends/explore?q=entrepreneurship' },
        { topic: 'Leadership', type: 'Topic', value: 81, link: '/trends/explore?q=leadership' },
        { topic: 'Management', type: 'Topic', value: 74, link: '/trends/explore?q=management' },
        { topic: 'Marketing', type: 'Topic', value: 67, link: '/trends/explore?q=marketing' },
      ],
    },
    relatedQueries: {
      rising: [
        { query: 'best business books 2025', value: 310, link: '/trends/explore?q=best+business+books+2025' },
        { query: 'business books on ai', value: 280, link: '/trends/explore?q=business+books+ai' },
        { query: 'business books kindle unlimited', value: 190, link: '/trends/explore?q=business+books+kindle' },
      ],
      top: [
        { query: 'best business books', value: 100, link: '/trends/explore?q=best+business+books' },
        { query: 'best business books of all time', value: 91, link: '/trends/explore?q=best+business+books+all+time' },
        { query: 'zero to one', value: 85, link: '/trends/explore?q=zero+to+one' },
        { query: 'good to great book', value: 78, link: '/trends/explore?q=good+to+great' },
        { query: 'how to win friends and influence people', value: 72, link: '/trends/explore?q=how+to+win+friends' },
      ],
    },
    geoInterest: [
      { geoCode: 'US', geoName: 'United States', value: 100, maxValueIndex: 0 },
      { geoCode: 'GB', geoName: 'United Kingdom', value: 83, maxValueIndex: 0 },
      { geoCode: 'AU', geoName: 'Australia', value: 79, maxValueIndex: 0 },
      { geoCode: 'CA', geoName: 'Canada', value: 75, maxValueIndex: 0 },
      { geoCode: 'IN', geoName: 'India', value: 69, maxValueIndex: 0 },
      { geoCode: 'IE', geoName: 'Ireland', value: 64, maxValueIndex: 0 },
      { geoCode: 'SG', geoName: 'Singapore', value: 58, maxValueIndex: 0 },
    ],
  },

  'health wellness books': {
    keyword: 'health wellness books',
    trendScore: 75,
    growthPercentage: 15.6,
    searchVolume: 110000,
    trendDirection: 'rising',
    timeline: buildTimeline(58, 18, 12),
    relatedTopics: {
      rising: [
        { topic: 'Longevity', type: 'Topic', value: 'Breakout', link: '/trends/explore?q=longevity' },
        { topic: 'Biohacking Books', type: 'Topic', value: 240, link: '/trends/explore?q=biohacking+books' },
        { topic: 'Gut Health', type: 'Topic', value: 180, link: '/trends/explore?q=gut+health' },
      ],
      top: [
        { topic: 'Health', type: 'Topic', value: 100, link: '/trends/explore?q=health' },
        { topic: 'Nutrition', type: 'Topic', value: 90, link: '/trends/explore?q=nutrition' },
        { topic: 'Fitness', type: 'Topic', value: 83, link: '/trends/explore?q=fitness' },
        { topic: 'Mental Health', type: 'Topic', value: 79, link: '/trends/explore?q=mental+health' },
        { topic: 'Meditation', type: 'Topic', value: 70, link: '/trends/explore?q=meditation' },
      ],
    },
    relatedQueries: {
      rising: [
        { query: 'longevity books 2025', value: 'Breakout', link: '/trends/explore?q=longevity+books+2025' },
        { query: 'gut health books', value: 340, link: '/trends/explore?q=gut+health+books' },
        { query: 'outlive book', value: 290, link: '/trends/explore?q=outlive+book' },
      ],
      top: [
        { query: 'best health books', value: 100, link: '/trends/explore?q=best+health+books' },
        { query: 'why we sleep book', value: 88, link: '/trends/explore?q=why+we+sleep' },
        { query: 'the body keeps the score', value: 84, link: '/trends/explore?q=body+keeps+score' },
        { query: 'breath book james nestor', value: 76, link: '/trends/explore?q=breath+james+nestor' },
        { query: 'how not to die book', value: 68, link: '/trends/explore?q=how+not+to+die' },
      ],
    },
    geoInterest: [
      { geoCode: 'US', geoName: 'United States', value: 100, maxValueIndex: 0 },
      { geoCode: 'AU', geoName: 'Australia', value: 88, maxValueIndex: 0 },
      { geoCode: 'CA', geoName: 'Canada', value: 82, maxValueIndex: 0 },
      { geoCode: 'GB', geoName: 'United Kingdom', value: 78, maxValueIndex: 0 },
      { geoCode: 'NZ', geoName: 'New Zealand', value: 71, maxValueIndex: 0 },
      { geoCode: 'ZA', geoName: 'South Africa', value: 62, maxValueIndex: 0 },
      { geoCode: 'IE', geoName: 'Ireland', value: 57, maxValueIndex: 0 },
    ],
  },

  'python programming': {
    keyword: 'python programming',
    trendScore: 92,
    growthPercentage: 41.8,
    searchVolume: 1220000,
    trendDirection: 'rising',
    timeline: buildTimeline(50, 42, 12),
    relatedTopics: {
      rising: [
        { topic: 'Python AI', type: 'Topic', value: 'Breakout', link: '/trends/explore?q=python+ai' },
        { topic: 'LangChain Python', type: 'Topic', value: 'Breakout', link: '/trends/explore?q=langchain+python' },
        { topic: 'FastAPI', type: 'Topic', value: 380, link: '/trends/explore?q=fastapi' },
      ],
      top: [
        { topic: 'Python', type: 'Programming Language', value: 100, link: '/trends/explore?q=python' },
        { topic: 'Django', type: 'Framework', value: 82, link: '/trends/explore?q=django' },
        { topic: 'Data Science', type: 'Topic', value: 79, link: '/trends/explore?q=data+science' },
        { topic: 'Jupyter Notebook', type: 'Tool', value: 71, link: '/trends/explore?q=jupyter' },
        { topic: 'NumPy', type: 'Library', value: 65, link: '/trends/explore?q=numpy' },
      ],
    },
    relatedQueries: {
      rising: [
        { query: 'python for ai 2025', value: 'Breakout', link: '/trends/explore?q=python+ai+2025' },
        { query: 'python llm tutorial', value: 'Breakout', link: '/trends/explore?q=python+llm+tutorial' },
        { query: 'learn python 2025', value: 520, link: '/trends/explore?q=learn+python+2025' },
      ],
      top: [
        { query: 'python tutorial', value: 100, link: '/trends/explore?q=python+tutorial' },
        { query: 'python crash course', value: 91, link: '/trends/explore?q=python+crash+course' },
        { query: 'python for data science', value: 86, link: '/trends/explore?q=python+data+science' },
        { query: 'python beginner', value: 80, link: '/trends/explore?q=python+beginner' },
        { query: 'automate the boring stuff python', value: 74, link: '/trends/explore?q=automate+boring+stuff' },
      ],
    },
    geoInterest: [
      { geoCode: 'IN', geoName: 'India', value: 100, maxValueIndex: 0 },
      { geoCode: 'PK', geoName: 'Pakistan', value: 87, maxValueIndex: 0 },
      { geoCode: 'BD', geoName: 'Bangladesh', value: 80, maxValueIndex: 0 },
      { geoCode: 'PH', geoName: 'Philippines', value: 74, maxValueIndex: 0 },
      { geoCode: 'NG', geoName: 'Nigeria', value: 68, maxValueIndex: 0 },
      { geoCode: 'US', geoName: 'United States', value: 62, maxValueIndex: 0 },
      { geoCode: 'ID', geoName: 'Indonesia', value: 57, maxValueIndex: 0 },
    ],
  },

  'mindfulness meditation': {
    keyword: 'mindfulness meditation',
    trendScore: 64,
    growthPercentage: -4.2,
    searchVolume: 188000,
    trendDirection: 'declining',
    timeline: buildTimeline(75, -12, 12),
    relatedTopics: {
      rising: [
        { topic: 'Somatic Healing', type: 'Topic', value: 'Breakout', link: '/trends/explore?q=somatic+healing' },
        { topic: 'Nervous System Regulation', type: 'Topic', value: 280, link: '/trends/explore?q=nervous+system+regulation' },
      ],
      top: [
        { topic: 'Meditation', type: 'Topic', value: 100, link: '/trends/explore?q=meditation' },
        { topic: 'Yoga', type: 'Topic', value: 87, link: '/trends/explore?q=yoga' },
        { topic: 'Stress Management', type: 'Topic', value: 76, link: '/trends/explore?q=stress+management' },
        { topic: 'Anxiety', type: 'Topic', value: 70, link: '/trends/explore?q=anxiety' },
        { topic: 'Sleep', type: 'Topic', value: 64, link: '/trends/explore?q=sleep' },
      ],
    },
    relatedQueries: {
      rising: [
        { query: 'somatic exercises book', value: 'Breakout', link: '/trends/explore?q=somatic+exercises+book' },
        { query: 'polyvagal theory book', value: 190, link: '/trends/explore?q=polyvagal+theory+book' },
      ],
      top: [
        { query: 'mindfulness books', value: 100, link: '/trends/explore?q=mindfulness+books' },
        { query: 'the power of now', value: 88, link: '/trends/explore?q=the+power+of+now' },
        { query: 'mindfulness for beginners', value: 82, link: '/trends/explore?q=mindfulness+beginners' },
        { query: 'headspace', value: 76, link: '/trends/explore?q=headspace' },
        { query: 'mindfulness based stress reduction', value: 70, link: '/trends/explore?q=mbsr' },
      ],
    },
    geoInterest: [
      { geoCode: 'AU', geoName: 'Australia', value: 100, maxValueIndex: 0 },
      { geoCode: 'NZ', geoName: 'New Zealand', value: 93, maxValueIndex: 0 },
      { geoCode: 'GB', geoName: 'United Kingdom', value: 88, maxValueIndex: 0 },
      { geoCode: 'CA', geoName: 'Canada', value: 83, maxValueIndex: 0 },
      { geoCode: 'US', geoName: 'United States', value: 79, maxValueIndex: 0 },
      { geoCode: 'IE', geoName: 'Ireland', value: 71, maxValueIndex: 0 },
      { geoCode: 'SE', geoName: 'Sweden', value: 65, maxValueIndex: 0 },
    ],
  },

  'entrepreneurship startup': {
    keyword: 'entrepreneurship startup',
    trendScore: 78,
    growthPercentage: 18.3,
    searchVolume: 92000,
    trendDirection: 'rising',
    timeline: buildTimeline(56, 24, 12),
    relatedTopics: {
      rising: [
        { topic: 'AI Startup', type: 'Topic', value: 'Breakout', link: '/trends/explore?q=ai+startup' },
        { topic: 'Solo Founder', type: 'Topic', value: 320, link: '/trends/explore?q=solo+founder' },
        { topic: 'Bootstrapping', type: 'Topic', value: 220, link: '/trends/explore?q=bootstrapping' },
      ],
      top: [
        { topic: 'Startup', type: 'Topic', value: 100, link: '/trends/explore?q=startup' },
        { topic: 'Venture Capital', type: 'Topic', value: 84, link: '/trends/explore?q=venture+capital' },
        { topic: 'Product Market Fit', type: 'Topic', value: 76, link: '/trends/explore?q=product+market+fit' },
        { topic: 'SaaS', type: 'Topic', value: 70, link: '/trends/explore?q=saas' },
        { topic: 'Pitch Deck', type: 'Topic', value: 63, link: '/trends/explore?q=pitch+deck' },
      ],
    },
    relatedQueries: {
      rising: [
        { query: 'startup books 2025', value: 'Breakout', link: '/trends/explore?q=startup+books+2025' },
        { query: 'zero to one summary', value: 260, link: '/trends/explore?q=zero+to+one+summary' },
        { query: 'lean startup 2025', value: 180, link: '/trends/explore?q=lean+startup+2025' },
      ],
      top: [
        { query: 'best startup books', value: 100, link: '/trends/explore?q=best+startup+books' },
        { query: 'zero to one book', value: 92, link: '/trends/explore?q=zero+to+one' },
        { query: 'lean startup book', value: 87, link: '/trends/explore?q=lean+startup' },
        { query: 'startup founder books', value: 79, link: '/trends/explore?q=startup+founder+books' },
        { query: 'blitzscaling book', value: 72, link: '/trends/explore?q=blitzscaling' },
      ],
    },
    geoInterest: [
      { geoCode: 'US', geoName: 'United States', value: 100, maxValueIndex: 0 },
      { geoCode: 'SG', geoName: 'Singapore', value: 86, maxValueIndex: 0 },
      { geoCode: 'IN', geoName: 'India', value: 80, maxValueIndex: 0 },
      { geoCode: 'GB', geoName: 'United Kingdom', value: 74, maxValueIndex: 0 },
      { geoCode: 'IL', geoName: 'Israel', value: 68, maxValueIndex: 0 },
      { geoCode: 'CA', geoName: 'Canada', value: 63, maxValueIndex: 0 },
      { geoCode: 'AU', geoName: 'Australia', value: 58, maxValueIndex: 0 },
    ],
  },
};

export const TRENDING_SEARCHES_FIXTURE: GoogleTrendsTrendingSearchItem[] = [
  { title: 'AI books 2025', trafficVolume: '500K+', relatedLinks: ['/trends/explore?q=ai+books+2025'], articleLinks: ['https://example.com/ai-books-2025'] },
  { title: 'atomic habits summary', trafficVolume: '200K+', relatedLinks: ['/trends/explore?q=atomic+habits+summary'], articleLinks: ['https://example.com/atomic-habits'] },
  { title: 'best books to read 2025', trafficVolume: '100K+', relatedLinks: ['/trends/explore?q=best+books+2025'], articleLinks: ['https://example.com/best-books-2025'] },
  { title: 'the psychology of money review', trafficVolume: '90K+', relatedLinks: ['/trends/explore?q=psychology+of+money'], articleLinks: ['https://example.com/psychology-money'] },
  { title: 'kindle unlimited books', trafficVolume: '80K+', relatedLinks: ['/trends/explore?q=kindle+unlimited'], articleLinks: ['https://example.com/kindle-unlimited'] },
  { title: 'llm book recommendations', trafficVolume: '75K+', relatedLinks: ['/trends/explore?q=llm+books'], articleLinks: ['https://example.com/llm-books'] },
  { title: 'outlive peter attia book', trafficVolume: '70K+', relatedLinks: ['/trends/explore?q=outlive+book'], articleLinks: ['https://example.com/outlive'] },
  { title: 'startup book recommendations', trafficVolume: '65K+', relatedLinks: ['/trends/explore?q=startup+books'], articleLinks: ['https://example.com/startup-books'] },
  { title: 'python beginners book 2025', trafficVolume: '60K+', relatedLinks: ['/trends/explore?q=python+beginners+book'], articleLinks: ['https://example.com/python-books'] },
  { title: 'longevity books recommendations', trafficVolume: '55K+', relatedLinks: ['/trends/explore?q=longevity+books'], articleLinks: ['https://example.com/longevity-books'] },
];

export const DEFAULT_KEYWORDS: string[] = Object.keys(KEYWORD_FIXTURES);

export function findClosestKeywordFixture(keyword: string): KeywordFixture | undefined {
  const lower = keyword.toLowerCase();
  const direct = KEYWORD_FIXTURES[lower];
  if (direct) return direct;

  for (const [key, fixture] of Object.entries(KEYWORD_FIXTURES)) {
    const keyTerms = key.split(' ');
    if (keyTerms.some((term) => lower.includes(term) || term.includes(lower.split(' ')[0] ?? ''))) {
      return fixture;
    }
  }

  return KEYWORD_FIXTURES['business books'];
}
