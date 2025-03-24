// This file contains mock data parsed from the RSS feeds provided

export interface Podcast {
  id: string
  title: string
  publisher: string
  artwork: string
  description: string
  categories: { main: string; sub: string[] }[]
  website: string
  language: string
  explicit: boolean
  episodeCount: number
  frequency: string
  lastUpdated: string
  feedUrl: string
}

export interface Episode {
  id: string
  title: string
  description: string
  publishDate: string
  duration: string
  durationSeconds: number
  podcastTitle: string
  podcastId: string
  artwork: string
  audioUrl: string
  isNew: boolean
  isBookmarked: boolean
  progress: number
}

// Sample data from the RSS feeds
export const podcasts: Podcast[] = [
  {
    id: "bootstrapped-founder",
    title: "The Bootstrapped Founder",
    publisher: "Arvid Kahl",
    artwork: "/placeholder.svg?height=400&width=400",
    description:
      "Arvid Kahl talks about starting businesses, finding audiences, and growing products. From bootstrapping a SaaS to $55k MRR to selling it for a life-changing amount of money, Arvid has learned a thing or two about building and selling bootstrapped businesses. He shares his learnings on this weekly podcast.",
    categories: [
      { main: "Business", sub: ["Entrepreneurship", "Startups"] },
      { main: "Education", sub: ["How To"] },
    ],
    website: "https://thebootstrappedfounder.com",
    language: "English",
    explicit: false,
    episodeCount: 187,
    frequency: "Weekly",
    lastUpdated: "June 23, 2023",
    feedUrl: "https://feeds.transistor.fm/bootstrapped-founder",
  },
  {
    id: "indie-hackers",
    title: "Indie Hackers",
    publisher: "Courtland Allen and Indie Hackers",
    artwork: "/placeholder.svg?height=400&width=400",
    description:
      "Indie Hackers is a podcast that shares the stories behind profitable online businesses and side projects. Your hosts are Courtland Allen and Channing Allen, who founded Indie Hackers in 2016 and sold it to Stripe the following year.",
    categories: [
      { main: "Business", sub: ["Entrepreneurship", "Startups"] },
      { main: "Technology", sub: ["Software Development"] },
    ],
    website: "https://www.indiehackers.com",
    language: "English",
    explicit: false,
    episodeCount: 215,
    frequency: "Weekly",
    lastUpdated: "June 15, 2023",
    feedUrl: "https://anchor.fm/s/f06c2370/podcast/rss",
  },
  {
    id: "my-first-million",
    title: "My First Million",
    publisher: "The Hustle & Shaan Puri and Sam Parr",
    artwork: "/placeholder.svg?height=400&width=400",
    description:
      "The podcast where Shaan Puri and Sam Parr discuss how companies made their first million, and then they try to come up with new business ideas that they think could make a million.",
    categories: [
      { main: "Business", sub: ["Entrepreneurship", "Investing"] },
      { main: "Technology", sub: ["Startups"] },
    ],
    website: "https://www.mfmpod.com",
    language: "English",
    explicit: true,
    episodeCount: 312,
    frequency: "Twice Weekly",
    lastUpdated: "June 22, 2023",
    feedUrl: "https://feeds.megaphone.fm/FRCH6787238462",
  },
  {
    id: "software-social",
    title: "Software Social",
    publisher: "Michele Hansen and Colleen Schnettger",
    artwork: "/placeholder.svg?height=400&width=400",
    description:
      "Two indie SaaS founders—one just getting off the ground, and one with an established profitable business—invite you to join their weekly chats about their businesses.",
    categories: [
      { main: "Business", sub: ["SaaS", "Software"] },
      { main: "Technology", sub: ["Startups"] },
    ],
    website: "https://softwaresocial.dev",
    language: "English",
    explicit: false,
    episodeCount: 178,
    frequency: "Weekly",
    lastUpdated: "June 20, 2023",
    feedUrl: "https://anchor.fm/s/f58d3330/podcast/rss",
  },
  {
    id: "startups-for-the-rest-of-us",
    title: "Startups For the Rest of Us",
    publisher: "Rob Walling and Mike Taber",
    artwork: "/placeholder.svg?height=400&width=400",
    description:
      "The podcast that helps developers, designers and entrepreneurs be awesome at launching software products.",
    categories: [
      { main: "Business", sub: ["Startups", "Software"] },
      { main: "Technology", sub: ["Entrepreneurship"] },
    ],
    website: "https://www.startupsfortherestofus.com",
    language: "English",
    explicit: false,
    episodeCount: 605,
    frequency: "Weekly",
    lastUpdated: "June 21, 2023",
    feedUrl: "https://anchor.fm/s/e9b477e4/podcast/rss",
  },
]

// Sample episodes for each podcast
export const podcastEpisodes: Record<string, Episode[]> = {
  "bootstrapped-founder": [
    {
      id: "bf-episode-1",
      title: "Finding Your Audience Before Building Your Product",
      description:
        "In this episode, I talk about the importance of finding your audience before building your product. I share strategies for audience research, engagement, and validation that can save you months of wasted development time.",
      publishDate: "June 23, 2023",
      duration: "32:45",
      durationSeconds: 1965,
      podcastTitle: "The Bootstrapped Founder",
      podcastId: "bootstrapped-founder",
      artwork: "/placeholder.svg?height=400&width=400",
      audioUrl: "https://example.com/episode1.mp3",
      isNew: true,
      isBookmarked: false,
      progress: 0,
    },
    {
      id: "bf-episode-2",
      title: "Pricing Strategies for Bootstrapped SaaS",
      description:
        "Pricing is one of the most important decisions you'll make for your business. In this episode, I discuss different pricing models, how to test them, and how to increase your prices without losing customers.",
      publishDate: "June 16, 2023",
      duration: "41:12",
      durationSeconds: 2472,
      podcastTitle: "The Bootstrapped Founder",
      podcastId: "bootstrapped-founder",
      artwork: "/placeholder.svg?height=400&width=400",
      audioUrl: "https://example.com/episode2.mp3",
      isNew: true,
      isBookmarked: true,
      progress: 0,
    },
    {
      id: "bf-episode-3",
      title: "Building in Public: Benefits and Strategies",
      description:
        "Building in public has become a popular approach for indie hackers. I discuss the benefits of transparency, how to share your journey effectively, and how to handle criticism and feedback.",
      publishDate: "June 9, 2023",
      duration: "36:28",
      durationSeconds: 2188,
      podcastTitle: "The Bootstrapped Founder",
      podcastId: "bootstrapped-founder",
      artwork: "/placeholder.svg?height=400&width=400",
      audioUrl: "https://example.com/episode3.mp3",
      isNew: false,
      isBookmarked: false,
      progress: 45,
    },
    {
      id: "bf-episode-4",
      title: "From Side Project to Full-Time Business",
      description:
        "Making the transition from a side project to a full-time business is challenging. I share my experience and provide a framework for knowing when and how to make the leap.",
      publishDate: "June 2, 2023",
      duration: "38:54",
      durationSeconds: 2334,
      podcastTitle: "The Bootstrapped Founder",
      podcastId: "bootstrapped-founder",
      artwork: "/placeholder.svg?height=400&width=400",
      audioUrl: "https://example.com/episode4.mp3",
      isNew: false,
      isBookmarked: false,
      progress: 0,
    },
    {
      id: "bf-episode-5",
      title: "Customer Support as a Competitive Advantage",
      description:
        "Great customer support can be a significant competitive advantage for bootstrapped businesses. I discuss how to provide exceptional support without burning out, and how to use customer interactions to improve your product.",
      publishDate: "May 26, 2023",
      duration: "34:17",
      durationSeconds: 2057,
      podcastTitle: "The Bootstrapped Founder",
      podcastId: "bootstrapped-founder",
      artwork: "/placeholder.svg?height=400&width=400",
      audioUrl: "https://example.com/episode5.mp3",
      isNew: false,
      isBookmarked: true,
      progress: 78,
    },
  ],
  "indie-hackers": [
    {
      id: "ih-episode-1",
      title: "#215 – Growing to $8M/Year by Building for Developers with Adam Wathan of Tailwind CSS",
      description:
        "Adam Wathan is the creator of Tailwind CSS, a utility-first CSS framework that's taken the web development world by storm. In this episode, Adam shares how he grew Tailwind from a side project to an $8M/year business.",
      publishDate: "June 15, 2023",
      duration: "1:12:34",
      durationSeconds: 4354,
      podcastTitle: "Indie Hackers",
      podcastId: "indie-hackers",
      artwork: "/placeholder.svg?height=400&width=400",
      audioUrl: "https://example.com/ih-episode1.mp3",
      isNew: true,
      isBookmarked: false,
      progress: 0,
    },
    {
      id: "ih-episode-2",
      title: "#214 – Building a $100K/Month Business as a Solo Founder with Dru Riley of Trends.vc",
      description:
        "Dru Riley is the founder of Trends.vc, a research platform that helps entrepreneurs discover new business opportunities. In this episode, Dru shares how he built a $100K/month business as a solo founder.",
      publishDate: "June 1, 2023",
      duration: "58:42",
      durationSeconds: 3522,
      podcastTitle: "Indie Hackers",
      podcastId: "indie-hackers",
      artwork: "/placeholder.svg?height=400&width=400",
      audioUrl: "https://example.com/ih-episode2.mp3",
      isNew: false,
      isBookmarked: true,
      progress: 0,
    },
    {
      id: "ih-episode-3",
      title: "#213 – From Idea to $10K MRR in 6 Months with Marie Poulin of Notion Mastery",
      description:
        "Marie Poulin is the founder of Notion Mastery, a course and community that helps people get the most out of Notion. In this episode, Marie shares how she went from idea to $10K MRR in just 6 months.",
      publishDate: "May 15, 2023",
      duration: "1:04:18",
      durationSeconds: 3858,
      podcastTitle: "Indie Hackers",
      podcastId: "indie-hackers",
      artwork: "/placeholder.svg?height=400&width=400",
      audioUrl: "https://example.com/ih-episode3.mp3",
      isNew: false,
      isBookmarked: false,
      progress: 23,
    },
    {
      id: "ih-episode-4",
      title: "#212 – Growing to $1M ARR Without Raising Money with Corey Haines of Swipewell",
      description:
        "Corey Haines is the founder of Swipewell, a tool that helps marketers save and organize marketing examples. In this episode, Corey shares how he grew his business to $1M ARR without raising any outside funding.",
      publishDate: "May 1, 2023",
      duration: "1:10:05",
      durationSeconds: 4205,
      podcastTitle: "Indie Hackers",
      podcastId: "indie-hackers",
      artwork: "/placeholder.svg?height=400&width=400",
      audioUrl: "https://example.com/ih-episode4.mp3",
      isNew: false,
      isBookmarked: false,
      progress: 0,
    },
    {
      id: "ih-episode-5",
      title: "#211 – Bootstrapping a $15M/Year Business with Sahil Lavingia of Gumroad",
      description:
        "Sahil Lavingia is the founder and CEO of Gumroad, a platform that helps creators sell their products directly to their audience. In this episode, Sahil shares how he bootstrapped Gumroad to $15M in annual revenue.",
      publishDate: "April 15, 2023",
      duration: "1:25:47",
      durationSeconds: 5147,
      podcastTitle: "Indie Hackers",
      podcastId: "indie-hackers",
      artwork: "/placeholder.svg?height=400&width=400",
      audioUrl: "https://example.com/ih-episode5.mp3",
      isNew: false,
      isBookmarked: true,
      progress: 67,
    },
  ],
  "my-first-million": [
    {
      id: "mfm-episode-1",
      title: "The Future of AI & Our Top Business Ideas in the Space",
      description:
        "Shaan and Sam discuss the rapid advancements in AI technology and share their top business ideas for entrepreneurs looking to capitalize on this growing trend.",
      publishDate: "June 22, 2023",
      duration: "53:21",
      durationSeconds: 3201,
      podcastTitle: "My First Million",
      podcastId: "my-first-million",
      artwork: "/placeholder.svg?height=400&width=400",
      audioUrl: "https://example.com/mfm-episode1.mp3",
      isNew: true,
      isBookmarked: false,
      progress: 0,
    },
    {
      id: "mfm-episode-2",
      title: "How to Build a Newsletter Empire with Sam Parr",
      description:
        "Sam shares his experience building The Hustle, a newsletter that grew to over 1.5 million subscribers before being acquired by HubSpot for a reported $27 million.",
      publishDate: "June 20, 2023",
      duration: "48:15",
      durationSeconds: 2895,
      podcastTitle: "My First Million",
      podcastId: "my-first-million",
      artwork: "/placeholder.svg?height=400&width=400",
      audioUrl: "https://example.com/mfm-episode2.mp3",
      isNew: true,
      isBookmarked: false,
      progress: 0,
    },
    {
      id: "mfm-episode-3",
      title: "5 Business Ideas We Would Start Today",
      description:
        "Shaan and Sam brainstorm five business ideas they would start today if they were beginning from scratch, including detailed breakdowns of the market opportunity and execution strategy.",
      publishDate: "June 15, 2023",
      duration: "57:42",
      durationSeconds: 3462,
      podcastTitle: "My First Million",
      podcastId: "my-first-million",
      artwork: "/placeholder.svg?height=400&width=400",
      audioUrl: "https://example.com/mfm-episode3.mp3",
      isNew: false,
      isBookmarked: true,
      progress: 0,
    },
    {
      id: "mfm-episode-4",
      title: "How to Validate a Business Idea in 24 Hours",
      description:
        "The hosts share their framework for quickly validating business ideas, including techniques for market research, customer interviews, and minimum viable product development.",
      publishDate: "June 13, 2023",
      duration: "51:08",
      durationSeconds: 3068,
      podcastTitle: "My First Million",
      podcastId: "my-first-million",
      artwork: "/placeholder.svg?height=400&width=400",
      audioUrl: "https://example.com/mfm-episode4.mp3",
      isNew: false,
      isBookmarked: false,
      progress: 34,
    },
    {
      id: "mfm-episode-5",
      title: "The Art of the Side Hustle: From $0 to $10K/Month",
      description:
        "Shaan and Sam discuss strategies for building profitable side hustles that can generate significant income without requiring you to quit your day job.",
      publishDate: "June 8, 2023",
      duration: "49:37",
      durationSeconds: 2977,
      podcastTitle: "My First Million",
      podcastId: "my-first-million",
      artwork: "/placeholder.svg?height=400&width=400",
      audioUrl: "https://example.com/mfm-episode5.mp3",
      isNew: false,
      isBookmarked: false,
      progress: 0,
    },
  ],
  "software-social": [
    {
      id: "ss-episode-1",
      title: "Balancing Product Development with Customer Acquisition",
      description:
        "Michele and Colleen discuss the challenges of balancing product development with customer acquisition efforts, sharing their experiences and strategies for finding the right balance.",
      publishDate: "June 20, 2023",
      duration: "42:18",
      durationSeconds: 2538,
      podcastTitle: "Software Social",
      podcastId: "software-social",
      artwork: "/placeholder.svg?height=400&width=400",
      audioUrl: "https://example.com/ss-episode1.mp3",
      isNew: true,
      isBookmarked: false,
      progress: 0,
    },
    {
      id: "ss-episode-2",
      title: "Pricing Models for SaaS Products",
      description:
        "The hosts explore different pricing models for SaaS products, discussing the pros and cons of various approaches and sharing their experiences with pricing their own products.",
      publishDate: "June 13, 2023",
      duration: "38:45",
      durationSeconds: 2325,
      podcastTitle: "Software Social",
      podcastId: "software-social",
      artwork: "/placeholder.svg?height=400&width=400",
      audioUrl: "https://example.com/ss-episode2.mp3",
      isNew: false,
      isBookmarked: true,
      progress: 0,
    },
    {
      id: "ss-episode-3",
      title: "Marketing Strategies for Bootstrapped Founders",
      description:
        "Michele and Colleen share effective marketing strategies for bootstrapped founders with limited time and resources, focusing on high-impact activities that drive customer acquisition.",
      publishDate: "June 6, 2023",
      duration: "45:32",
      durationSeconds: 2732,
      podcastTitle: "Software Social",
      podcastId: "software-social",
      artwork: "/placeholder.svg?height=400&width=400",
      audioUrl: "https://example.com/ss-episode3.mp3",
      isNew: false,
      isBookmarked: false,
      progress: 0,
    },
    {
      id: "ss-episode-4",
      title: "Building a Product Roadmap as a Solo Founder",
      description:
        "The hosts discuss approaches to building and maintaining a product roadmap as a solo founder, balancing customer requests with strategic product vision.",
      publishDate: "May 30, 2023",
      duration: "40:17",
      durationSeconds: 2417,
      podcastTitle: "Software Social",
      podcastId: "software-social",
      artwork: "/placeholder.svg?height=400&width=400",
      audioUrl: "https://example.com/ss-episode4.mp3",
      isNew: false,
      isBookmarked: false,
      progress: 56,
    },
    {
      id: "ss-episode-5",
      title: "Customer Support Strategies for Small SaaS Companies",
      description:
        "Michele and Colleen share their approaches to providing excellent customer support as small SaaS companies with limited resources, discussing tools, processes, and mindset.",
      publishDate: "May 23, 2023",
      duration: "43:51",
      durationSeconds: 2631,
      podcastTitle: "Software Social",
      podcastId: "software-social",
      artwork: "/placeholder.svg?height=400&width=400",
      audioUrl: "https://example.com/ss-episode5.mp3",
      isNew: false,
      isBookmarked: true,
      progress: 0,
    },
  ],
  "startups-for-the-rest-of-us": [
    {
      id: "sftrou-episode-1",
      title: "Episode 605: Bootstrapping vs. Funding with Rob Walling",
      description:
        "Rob discusses the pros and cons of bootstrapping versus seeking funding for your startup, drawing on his experience as both a bootstrapped founder and an investor.",
      publishDate: "June 21, 2023",
      duration: "47:23",
      durationSeconds: 2843,
      podcastTitle: "Startups For the Rest of Us",
      podcastId: "startups-for-the-rest-of-us",
      artwork: "/placeholder.svg?height=400&width=400",
      audioUrl: "https://example.com/sftrou-episode1.mp3",
      isNew: true,
      isBookmarked: false,
      progress: 0,
    },
    {
      id: "sftrou-episode-2",
      title: "Episode 604: Finding Your First 100 Customers",
      description:
        "Rob shares strategies for acquiring your first 100 customers, focusing on tactics that work for bootstrapped founders with limited marketing budgets.",
      publishDate: "June 14, 2023",
      duration: "45:12",
      durationSeconds: 2712,
      podcastTitle: "Startups For the Rest of Us",
      podcastId: "startups-for-the-rest-of-us",
      artwork: "/placeholder.svg?height=400&width=400",
      audioUrl: "https://example.com/sftrou-episode2.mp3",
      isNew: false,
      isBookmarked: true,
      progress: 0,
    },
    {
      id: "sftrou-episode-3",
      title: "Episode 603: Building a Sustainable Business vs. Chasing Growth",
      description:
        "Rob discusses the differences between building a sustainable, profitable business and chasing growth at all costs, sharing insights from his experience with both approaches.",
      publishDate: "June 7, 2023",
      duration: "49:37",
      durationSeconds: 2977,
      podcastTitle: "Startups For the Rest of Us",
      podcastId: "startups-for-the-rest-of-us",
      artwork: "/placeholder.svg?height=400&width=400",
      audioUrl: "https://example.com/sftrou-episode3.mp3",
      isNew: false,
      isBookmarked: false,
      progress: 0,
    },
    {
      id: "sftrou-episode-4",
      title: "Episode 602: The Power of Niching Down",
      description:
        "Rob explores the benefits of focusing on a specific niche for your product, sharing examples of successful companies that started with a narrow focus and expanded over time.",
      publishDate: "May 31, 2023",
      duration: "43:18",
      durationSeconds: 2598,
      podcastTitle: "Startups For the Rest of Us",
      podcastId: "startups-for-the-rest-of-us",
      artwork: "/placeholder.svg?height=400&width=400",
      audioUrl: "https://example.com/sftrou-episode4.mp3",
      isNew: false,
      isBookmarked: false,
      progress: 89,
    },
    {
      id: "sftrou-episode-5",
      title: "Episode 601: Building a Product People Want to Pay For",
      description:
        "Rob discusses strategies for building products that people are willing to pay for, focusing on solving real problems and creating genuine value for customers.",
      publishDate: "May 24, 2023",
      duration: "46:52",
      durationSeconds: 2812,
      podcastTitle: "Startups For the Rest of Us",
      podcastId: "startups-for-the-rest-of-us",
      artwork: "/placeholder.svg?height=400&width=400",
      audioUrl: "https://example.com/sftrou-episode5.mp3",
      isNew: false,
      isBookmarked: true,
      progress: 0,
    },
  ],
}

// Helper function to get a podcast by ID
export function getPodcastById(id: string): Podcast | undefined {
  return podcasts.find((podcast) => podcast.id === id)
}

// Helper function to get episodes for a podcast
export function getEpisodesByPodcastId(podcastId: string): Episode[] {
  return podcastEpisodes[podcastId] || []
}

// Helper function to get an episode by ID
export function getEpisodeById(id: string): Episode | undefined {
  for (const episodes of Object.values(podcastEpisodes)) {
    const episode = episodes.find((ep) => ep.id === id)
    if (episode) return episode
  }
  return undefined
}

// Helper function to get all episodes (for search, etc.)
export function getAllEpisodes(): Episode[] {
  return Object.values(podcastEpisodes).flat()
}

