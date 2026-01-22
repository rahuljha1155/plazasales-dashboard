import { Pricing } from "./pricing";

const seoPlans = [
  {
    name: "BASIC SEO",
    price: "34999",
    yearlyPrice: "377989",
    period: "per month",
    features: [
      {
        cat: "Website Analysis and Reviews",
        feature: [
          "✔️ 5 Short Tailed Keywords + 2 Long Tailed Keywords Max",
          "✔️ Keyword Research",
          "❌ Website and competitor Analysis",
          "❌ Content Duplicity Check",
          "❌ Initial Ranking Report",
        ],
      },
      {
        cat: "On-Page Optimization",
        feature: [
          "✔️ URL Structure",
          "❌ Content Optimization",
          "✔️ Semantic Tag Optimization",
          "✔️ Meta Tags and Title Creation",
          "✔️ Robots.txt",
          "✔️ Sitemap Creation",
          "✔️ Google Analytics + Google Search Console Setup and Optimization",
        ],
      },
      {
        cat: "Blogs + Article Writing",
        feature: [
          "✔️ Blogs Writing - 3",
          "✔️ Article Writing - 2",
        ],
      },
      {
        cat: "Local Optimization",
        feature: [
          "✔️ Google Map Integration on Website",
          "❌ Google Business Profile Setup and Optimization",
        ],
      },
      {
        cat: "Technical SEO",
        feature: [
          "✔️ Broken Links Fixing",
          "❌ Image Optimization",
          "❌ CSS and Scripts Optimization",
          "✔️ Website Speed Optimization",
        ],
      },
      {
        cat: "Off-Page Optimization",
        feature: [
          "❌ Q & A - 1",
          "✔️ Backlinks - 5",
          "❌ Social Media Management",
        ],
      },
      {
        cat: "AI Optimization",
        feature: [
          "❌ AIO",
          "❌ GEO",
        ],
      },
      {
        cat: "Report - Quarterly",
        feature: [
          "✔️ Keyword Ranking Report",
          "✔️ Google Analytics Report",
          "✔️ Acquired Links Report",
        ],
      },
      {
        cat: "Client Support",
        feature: [
          "✔️ Email",
          "✔️ Chat",
          "❌ Call",
        ],
      },
    ],
    description: "Perfect for small businesses starting their SEO journey",
    buttonText: "Contact Expert",
    href: "https://wa.link/qd4ev4",
    isPopular: false,
  },
  {
    name: "ADVANCED SEO",
    price: "54999",
    yearlyPrice: "593989",
    period: "per month",
    features: [
      {
        cat: "Website Analysis and Reviews",
        feature: [
          "✔️ 10 Short Tailed Keywords + 5 Long Tailed Keywords Max",
          "✔️ Keyword Research",
          "✔️ Website and competitor Analysis",
          "✔️ Content Duplicity Check",
          "✔️ Initial Ranking Report",
        ],
      },
      {
        cat: "On-Page Optimization",
        feature: [
          "✔️ URL Structure",
          "✔️ Content Optimization",
          "✔️ Semantic Tag Optimization",
          "✔️ Meta Tags and Title Creation",
          "✔️ Robots.txt",
          "✔️ Sitemap Creation",
          "✔️ Google Analytics + Google Search Console Setup and Optimization",
        ],
      },
      {
        cat: "Blogs + Article Writing",
        feature: [
          "✔️ Blogs Writing - 7",
          "✔️ Article Writing - 4",
        ],
      },
      {
        cat: "Local Optimization",
        feature: [
          "✔️ Google Map Integration on Website",
          "✔️ Google Business Profile Setup and Optimization",
        ],
      },
      {
        cat: "Technical SEO",
        feature: [
          "✔️ Broken Links Fixing",
          "✔️ Image Optimization",
          "✔️ CSS and Scripts Optimization",
          "✔️ Website Speed Optimization",
        ],
      },
      {
        cat: "Off-Page Optimization",
        feature: [
          "✔️ Q & A - 1",
          "✔️ Backlinks - 12",
          "✔️ Social Media Management (Basic)",
        ],
      },
      {
        cat: "AI Optimization",
        feature: [
          "❌ AIO",
          "✔️ GEO (Basic)",
        ],
      },
      {
        cat: "Report - Monthly",
        feature: [
          "✔️ Keyword Ranking Report",
          "✔️ Google Analytics Report",
          "✔️ Acquired Links Report",
        ],
      },
      {
        cat: "Client Support",
        feature: [
          "✔️ Email",
          "✔️ Chat",
          "✔️ Call",
        ],
      },
    ],
    description: "Great for growing businesses and competitive markets",
    buttonText: "Contact Expert",
    href: "https://wa.link/qd4ev4",
    isPopular: true,
  },
  {
    name: "PREMIUM SEO",
    price: "99999",
    yearlyPrice: "1079989",
    period: "per month",
    features: [
      {
        cat: "Website Analysis and Reviews",
        feature: [
          "✔️ 20 Short Tailed Keywords + 10 Long Tailed Keywords Max",
          "✔️ Keyword Research",
          "✔️ Website and competitor Analysis",
          "✔️ Content Duplicity Check",
          "✔️ Initial Ranking Report",
        ],
      },
      {
        cat: "On-Page Optimization",
        feature: [
          "✔️ URL Structure",
          "✔️ Content Optimization",
          "✔️ Semantic Tag Optimization",
          "✔️ Meta Tags and Title Creation",
          "✔️ Robots.txt",
          "✔️ Sitemap Creation",
          "✔️ Google Analytics + Google Search Console Setup and Optimization",
        ],
      },
      {
        cat: "Blogs + Article Writing",
        feature: [
          "✔️ Blogs Writing - 10",
          "✔️ Article Writing - 7",
        ],
      },
      {
        cat: "Local Optimization",
        feature: [
          "✔️ Google Map Integration on Website",
          "✔️ Google Business Profile Setup and Optimization",
        ],
      },
      {
        cat: "Technical SEO",
        feature: [
          "✔️ Broken Links Fixing",
          "✔️ Image Optimization",
          "✔️ CSS and Scripts Optimization",
          "✔️ Website Speed Optimization",
        ],
      },
      {
        cat: "Off-Page Optimization",
        feature: [
          "✔️ Q & A - 7",
          "✔️ Backlinks - 18",
          "✔️ Social Media Management (Advanced)",
        ],
      },
      {
        cat: "AI Optimization",
        feature: [
          "✔️ AIO",
          "✔️ GEO",
        ],
      },
      {
        cat: "Report - Monthly",
        feature: [
          "✔️ Keyword Ranking Report",
          "✔️ Google Analytics Report",
          "✔️ Acquired Links Report",
        ],
      },
      {
        cat: "Client Support",
        feature: [
          "✔️ Email",
          "✔️ Chat",
          "✔️ Call",
        ],
      },
    ],
    description: "Best for enterprises and highly competitive markets",
    buttonText: "Contact Expert",
    href: "https://wa.link/qd4ev4",
    isPopular: false,
  },
  {
    name: "CUSTOMIZED SEO + DIGITAL MARKETING",
    price: "129999",
    yearlyPrice: "1403989",
    period: "per month",
    features: [
      {
        cat: "Custom Solutions",
        feature: [
          "✔️ Fully Customized SEO Strategy",
          "✔️ Complete Digital Marketing Services",
          "✔️ Dedicated Team",
          "✔️ Priority Support 24/7",
        ],
      },
    ],
    description: "Tailored solutions for unique business needs",
    buttonText: "Contact: 9828058275",
    href: "tel:9828058275",
    isPopular: false,
    isCustom: true,
  },
];


export default function PageContentPage() {
  return (
    <div className="mx-auto min-h-screen">
      <Pricing plans={seoPlans} />
    </div>
  );
}
