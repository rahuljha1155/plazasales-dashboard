import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BrandAnalytics from "./BrandAnalytics";
import CategoryAnalytics from "./CategoryAnalytics";
import SEOAnalytics from "./SEOAnalytics";
import NewsletterAnalytics from "./NewsletterAnalytics";
import AdsAnalytics from "./AdsAnalytics";
import TechnologyAnalytics from "./TechnologyAnalytics";
import { Building2, FolderTree, Search, TrendingUp, Mail, MonitorPlay, Cpu } from "lucide-react";

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("brands");

  return (
    <div className="container mx-auto mt-8 space-y-6">

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 ">
        <TabsList className="grid  grid-cols-6 h-full rounded-full w-fit  ">
          <TabsTrigger value="brands" className="flex items-center gap-2 data-[state=active]:bg-primary w-fit px-4  cursor-pointer data-[state=active]:text-white py-2 rounded-full">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Brands</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2 data-[state=active]:bg-primary w-fit px-4 cursor-pointer data-[state=active]:text-white py-2 rounded-full">
            <FolderTree className="h-4 w-4" />
            <span className="hidden sm:inline">Categories</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2 data-[state=active]:bg-primary w-fit px-4 cursor-pointer data-[state=active]:text-white py-2 rounded-full">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">SEO Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="newsletter" className="flex items-center gap-2 data-[state=active]:bg-primary w-fit px-4 cursor-pointer data-[state=active]:text-white py-2 rounded-full">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Newsletter</span>
          </TabsTrigger>
          <TabsTrigger value="ads" className="flex items-center gap-2 data-[state=active]:bg-primary w-fit px-4 cursor-pointer data-[state=active]:text-white py-2 rounded-full">
            <MonitorPlay className="h-4 w-4" />
            <span className="hidden sm:inline">Ads Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="technology" className="flex items-center gap-2 data-[state=active]:bg-primary w-fit px-4 cursor-pointer data-[state=active]:text-white py-2 rounded-full">
            <Cpu className="h-4 w-4" />
            <span className="hidden sm:inline">Technology</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="brands" className="space-y-4">
          <BrandAnalytics />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <CategoryAnalytics />
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <SEOAnalytics />
        </TabsContent>

        <TabsContent value="newsletter" className="space-y-4">
          <NewsletterAnalytics />
        </TabsContent>

        <TabsContent value="ads" className="space-y-4">
          <AdsAnalytics />
        </TabsContent>

        <TabsContent value="technology" className="space-y-4">
          <TechnologyAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
