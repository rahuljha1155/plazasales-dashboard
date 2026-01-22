import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getPageData } from "@/services/pagesData";
import { Loader } from "lucide-react";

const EventPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["page", id],
    queryFn: () => getPageData(id!),
    enabled: !!id,
  });

  if (isLoading) return <PageLoader />;
  if (isError || !data) return <PageError />;

  const {
    title,
    subTitle,
    image,
    description,
    subDescription,
    slug,
    status,
    publishDate,
    metaTitle,
    metaDescription,
    metaKeywords,
  } = data.data;

  return (
    <div className="min-h-screen ">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800  rounded-[2px] overflow-hidden border border-gray-200 dark:border-gray-700 transition-all ">
          {/* Hero Section */}
          <HeroSection image={image} title={title} subTitle={subTitle} />

          {/* Content Section */}
          <div className="p-8 space-y-8">
            <ContentBlock
              description={description}
              subDescription={subDescription}
            />

            <InfoGrid slug={slug} status={status} publishDate={publishDate} />

            <SeoSection
              metaTitle={metaTitle}
              metaDescription={metaDescription}
              metaKeywords={metaKeywords}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
    <Loader className="h-12 w-12 animate-spin text-indigo-600 dark:text-indigo-400" />
  </div>
);

const PageError = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
    <div className="text-center p-6 max-w-md bg-white dark:bg-gray-800 rounded-sm shadow-lg">
      <h2 className="text-red-600 dark:text-red-400 text-2xl font-bold mb-2">
        Oops!
      </h2>
      <p className="text-gray-600 dark:text-gray-300">
        Something went wrong while loading the page. Please try again later.
      </p>
    </div>
  </div>
);

const HeroSection = ({
  image,
  title,
  subTitle,
}: {
  image: string | undefined;
  title: string;
  subTitle?: string;
}) => (
  <div className="relative h-80 md:h-96 w-full group">
    <img
      src={image || ""}
      alt={title}
      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex flex-col items-center justify-end pb-12 text-center px-6">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
        {title}
      </h1>
      {subTitle && (
        <p className="text-lg mt-4 text-gray-200 max-w-3xl leading-relaxed">
          {subTitle}
        </p>
      )}
    </div>
  </div>
);

const ContentBlock = ({
  description,
  subDescription,
}: {
  description?: string;
  subDescription?: string;
}) => (
  <>
    {description && (
      <p className="text-lg md:text-xl font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
        {description}
      </p>
    )}

    {subDescription && (
      <p className="text-gray-600 dark:text-gray-400 text-base leading-loose">
        {subDescription}
      </p>
    )}
  </>
);

const InfoGrid = ({
  slug,
  status,
  publishDate,
}: {
  slug: string;
  status: string;
  publishDate: string;
}) => (
  <div className="grid md:grid-cols-3 gap-6 pt-6">
    <InfoCard label="Slug" value={slug} icon="🔗" />
    <InfoCard
      label="Status"
      value={status}
      icon="🟢"
      className="text-green-600 dark:text-green-400"
    />
    <InfoCard
      label="Publish Date"
      value={new Date(publishDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
      icon="📅"
    />
  </div>
);

const SeoSection = ({
  metaTitle,
  metaDescription,
  metaKeywords,
}: {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
}) => (
  <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
      <span>🔍</span> SEO Information
    </h3>
    <div className="space-y-4 text-sm">
      {metaTitle && (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-sm">
          <strong className="block text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">
            Meta Title
          </strong>
          <p className="text-gray-800 dark:text-gray-200">{metaTitle}</p>
        </div>
      )}

      {metaDescription && (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-sm">
          <strong className="block text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">
            Meta Description
          </strong>
          <p className="text-gray-800 dark:text-gray-200">{metaDescription}</p>
        </div>
      )}

      {metaKeywords?.length && (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-sm">
          <strong className="block text-xs uppercase text-gray-500 dark:text-gray-400 mb-2">
            Meta Keywords
          </strong>
          <div className="flex flex-wrap gap-2">
            {metaKeywords.map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100 px-3 py-1 rounded-full text-xs font-medium"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

const InfoCard = ({
  label,
  value,
  icon,
  className = "",
}: {
  label: string;
  value: string;
  icon?: string;
  className?: string;
}) => (
  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
    <div className="flex items-center gap-3 mb-2">
      {icon && <span className="text-lg">{icon}</span>}
      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </h4>
    </div>
    <p className={`text-base font-medium ${className}`}>{value}</p>
  </div>
);

export default EventPage;
