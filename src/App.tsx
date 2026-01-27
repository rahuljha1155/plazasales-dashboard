import { toast, Toaster } from "sonner";
import "./App.css";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import DashboardPage from "./components/DashboardPage";
import ProfilePage from "./components/profile/page";
import BrandListPage from "./components/brands/BrandListPage";
import BrandCreatePage from "./components/brands/BrandCreatePage";
import BrandEditPage from "./components/brands/BrandEditPage";
import BrandViewPage from "./components/brands/BrandViewPage";
import DeletedBrandList from "./components/brands/DeletedBrandList";
import SubCategoryPage from "./components/category/categoryList";
import DeletedCategoryList from "./components/category/DeletedCategoryList";
import CategoryViewPage from "./components/category/CategoryViewPage";
import CategoryCreatePage from "./components/category/CategoryCreatePage";
import CategoryEditPage from "./components/category/CategoryEditPage";
import SubcategoryListPage from "./components/subcategory/SubcategoryListPage";
import SubcategoryCreatePage from "./components/subcategory/SubcategoryCreatePage";
import SubcategoryEditPage from "./components/subcategory/SubcategoryEditPage";
import SubcategoryViewPage from "./components/subcategory/SubcategoryViewPage";
import DeletedSubcategoryList from "./components/subcategory/DeletedSubcategoryList";
import Layout from "./layout/dashboard-layout";
import BlogPage from "./pages/blog/blogList";
import DeletedBlogsList from "./pages/blog/deletedBlogsList";
import BlogViewPage from "./pages/blog/blogView";
import MembersPage from "./pages/team-member/member";
import DeletedMemberList from "./components/member/DeletedMemberList";
import PageContentPage from "./pages/seoContent/page";
import DateAndPricingListPage from "./components/dateandpricing/DateAndPricingListPage";
import CertificatePage from "./pages/career/careerList";
import DeletedCareersList from "./pages/career/deletedCareersList";
import InfoPage from "./pages/usefulInfo/faqList";
import BookingPage from "./pages/inquiries/listInquiries";
import ApplicationListPage from "./pages/application/applicationList";
import DeletedApplicationList from "./pages/application/deletedApplications";
import DeletedInquiries from "./pages/inquiries/deletedInquiries";
import ViewInquiry from "./pages/inquiries/viewInquiry";
import CreateReply from "./pages/inquiries/createReply";
import CreateContactReply from "./pages/inbox/createReply";
import CreateCareerReply from "./pages/career/createReply";
import ReviewPage from "./pages/review/review";
import InboxListPage from "./components/inbox/InboxListPage";
import ContactDetailsPage from "./components/inbox/ContactDetailsPage";
import DeletedContactList from "./components/inbox/DeletedContactList";
import FaqListPage from "./components/faq/FaqListPage";
import PageContentViewPage from "./components/pageContent/view-page";
import BookingReply from "./components/booking/Booking-Reply";
import UserManagementPage from "./pages/user-management/user-management";
import ImageGallery from "./components/bloggallery/ImageGallery";
import PackageInfoListPage from "./components/essential-info/PackageInfoListPage";
import CustomBookingReply from "./components/custom-booking/Custom-Booking-Reply";
import HomeGalleryPage from "./pages/home-gallery/HomeGalleryPage";
import HomeGalleryCreate from "./pages/home-gallery/HomeGalleryCreate";
import HomeGalleryEdit from "./pages/home-gallery/HomeGalleryEdit";
import HomeGalleryView from "./pages/home-gallery/HomeGalleryView";
import Homefaq from "./pages/homefaq/homefaq";
import HomeTestimonialPage from "./pages/home-testimonial/home-testimonial";
import PrivateTripPage from "./pages/private-trip/private-trip";
import ProductsList from "./components/products/productsList";
import CreateProduct from "./components/products/createProduct";
import EditProduct from "./components/products/editProduct";
import ViewProduct from "./components/products/viewProduct";
import ProductGallery from "./components/products/productGallery";
import ProductSearchPage from "./components/products/ProductSearchPage";
import DeletedProductList from "./components/products/DeletedProductList";
import DeletedGalleryList from "./components/products/DeletedGalleryList";
import AnalyticsDashboard from "./components/analytics/AnalyticsDashboard";
import BrandPerformancePage from "./components/analytics/BrandPerformancePage";
import CategoryPerformancePage from "./components/analytics/CategoryPerformancePage";
import RecaptchaInitializer from "./components/RecaptchaInitializer";
import VideoList from "./components/video/VideoList";
import DeletedVideoList from "./components/video/DeletedVideoList";
import { DownloadCategoryList, CategoryContents, DeletedDownloadCategoryList } from "./components/download-category";
import CreateSeoMetadata from "./components/seo-metadata/CreateSeoMetadata";
import SeoListPage from "./components/seo-metadata/SeoListPage";
import SeoEditPage from "./components/seo-metadata/SeoEditPage";
import SeoViewPage from "./components/seo-metadata/SeoViewPage";
import SeoWholeSiteEditPage from "./components/seo-metadata/SeoWholeSiteEditPage";
import DeletedSeo from "./components/seo-metadata/DeletedSeo";
import SeoByEntity from "./components/seo-metadata/SeoByEntity";

// Product SEO
import ProductSeoList from "./components/seo-metadata/product/ProductSeoList";
import ProductSeoCreate from "./components/seo-metadata/product/ProductSeoCreate";
import ProductSeoEdit from "./components/seo-metadata/product/ProductSeoEdit";
import ProductSeoView from "./components/seo-metadata/product/ProductSeoView";

// Blog SEO
import BlogSeoList from "./components/seo-metadata/blog/BlogSeoList";
import BlogSeoCreate from "./components/seo-metadata/blog/BlogSeoCreate";
import BlogSeoEdit from "./components/seo-metadata/blog/BlogSeoEdit";
import BlogSeoView from "./components/seo-metadata/blog/BlogSeoView";

// Brand SEO
import BrandSeoList from "./components/seo-metadata/brand/BrandSeoList";
import BrandSeoCreate from "./components/seo-metadata/brand/BrandSeoCreate";
import BrandSeoEdit from "./components/seo-metadata/brand/BrandSeoEdit";
import BrandSeoView from "./components/seo-metadata/brand/BrandSeoView";

// Category SEO
import CategorySeoList from "./components/seo-metadata/category/CategorySeoList";
import CategorySeoCreate from "./components/seo-metadata/category/CategorySeoCreate";
import CategorySeoEdit from "./components/seo-metadata/category/CategorySeoEdit";
import CategorySeoView from "./components/seo-metadata/category/CategorySeoView";

// Subcategory SEO
import SubcategorySeoList from "./components/seo-metadata/subcategory/SubcategorySeoList";
import SubcategorySeoCreate from "./components/seo-metadata/subcategory/SubcategorySeoCreate";
import SubcategorySeoEdit from "./components/seo-metadata/subcategory/SubcategorySeoEdit";
import SubcategorySeoView from "./components/seo-metadata/subcategory/SubcategorySeoView";
import {
  AdsList,
  AdsCreateModal,
  AdsEditModal,
  AdsViewPage,
  DeletedAdsList,
  ProductAdsPage,
  CategoryAdsPage,
  SubcategoryAdsPage,
  BrandAdsPage,
} from "./components/ads";
import ProductSharablePage from "./components/sharable/ProductSharablePage";
import AllSharablesPage from "./components/sharable/AllSharablesPage";
import SharableCreateModal from "./components/sharable/SharableCreateModal";
import SharableEditModal from "./components/sharable/SharableEditModal";
import SharableViewPage from "./components/sharable/SharableViewPage";
import DeletedSharableList from "./components/sharable/DeletedSharableList";
import { DeletedProductDownloadList } from "./components/product-download";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import ALLSITESEO from "./components/seo-metadata/site-seo-create";
import ReviewList from "./components/reviews/ReviewList";
import DeletedReviewList from "./components/reviews/DeletedReviewList";

// Technology
import {
  TechnologyList,
  TechnologyCreate,
  TechnologyEdit,
  TechnologyView,
  DeletedTechnologyList,
} from "./components/technology";
import NewsletterList from "./pages/newsletter/newsletterList";
import DeletedNewsletterList from "./pages/newsletter/deletedNewsletterList";
import { useUserStore } from "./store/userStore";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {

  return (
    <>
      <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || ""}>
        <RecaptchaInitializer />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />


            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Layout />}>
                <Route index element={<DashboardPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="analytics" element={<AnalyticsDashboard />} />
                <Route path="reviews" element={<ReviewList />} />
                <Route path="reviews/deleted" element={<DeletedReviewList />} />
                <Route path="analytics/brand/:brandId" element={<BrandPerformancePage />} />
                <Route path="analytics/category/:categoryId" element={<CategoryPerformancePage />} />

                {/* Brand Routes */}
                <Route path="brands" element={<BrandListPage />} />
                <Route path="brands/create" element={<BrandCreatePage />} />
                <Route path="brands/edit/:slug" element={<BrandEditPage />} />
                <Route path="brands/view/:slug" element={<BrandViewPage />} />
                <Route path="deleted-brands" element={<DeletedBrandList />} />
                <Route path="deleted-categories" element={<DeletedCategoryList />} />
                <Route path="category/:id" element={<SubCategoryPage />} />
                <Route path="category/:id/create" element={<CategoryCreatePage />} />
                <Route path="category/:id/edit/:categorySlug" element={<CategoryEditPage />} />
                <Route path="category/:id/view/:categorySlug" element={<CategoryViewPage />} />

                {/* Subcategory Routes */}
                <Route path="category/:brandSlug/subcategory/:categorySlug" element={<SubcategoryListPage />} />
                <Route path="category/:brandSlug/subcategory/:categorySlug/create" element={<SubcategoryCreatePage />} />
                <Route path="category/:brandSlug/subcategory/:categorySlug/edit/:subcategorySlug" element={<SubcategoryEditPage />} />
                <Route path="category/:brandSlug/subcategory/:categorySlug/view/:subcategorySlug" element={<SubcategoryViewPage />} />
                <Route path="deleted-subcategories" element={<DeletedSubcategoryList />} />

                {/* Product Routes */}
                <Route path="category/:cid/subcategory/:id/products/:pid" element={<ProductsList />} />
                <Route path="category/:cid/subcategory/:id/products/:pid/edit/:eid" element={<EditProduct />} />
                <Route path="category/:cid/subcategory/:id/products/:pid/view/:vid" element={<ViewProduct />} />
                <Route path="category/:cid/subcategory/:id/products/:pid/create/:vid" element={<CreateProduct />} />
                <Route path="products/search" element={<ProductSearchPage />} />
                <Route path="products/view/:id" element={<ViewProduct />} />
                <Route path="deleted-products" element={<DeletedProductList />} />
                <Route path="products/create" element={<CreateProduct />} />
                <Route path="products/gallery/deleted" element={<DeletedGalleryList />} />
                <Route path="products/gallery/:id" element={<ProductGallery />} />
                <Route path="products/video/:id" element={<VideoList />} />
                <Route path="deleted-videos" element={<DeletedVideoList />} />
                <Route path="products/downloads/:id" element={<DownloadCategoryList />} />
                <Route path="category/:brandSlug/subcategory/:categorySlug/:subcategorySlug/products/create" element={<CreateProduct />} />
                <Route path="category/:brandSlug/subcategory/:categorySlug/:subcategorySlug/products/edit/:id" element={<EditProduct />} />
                <Route path="download-category/:categoryId/contents/:pid" element={<CategoryContents />} />
                <Route path="download-categories/deleted" element={<DeletedDownloadCategoryList />} />
                <Route path="product-downloads/deleted" element={<DeletedProductDownloadList />} />
                <Route path="seo-metadata" element={<SeoListPage />} />
                <Route path="seo-metadata/create" element={<CreateSeoMetadata />} />
                <Route path="seo-metadata/create/whole-site" element={<ALLSITESEO />} />
                <Route path="seo-metadata/edit/:id" element={<SeoEditPage />} />
                <Route path="seo-metadata/view/:id" element={<SeoViewPage />} />
                <Route path="seo-metadata/whole-site/edit/:id" element={<SeoWholeSiteEditPage />} />
                <Route path="deleted-seo" element={<DeletedSeo />} />

                {/* Brand SEO Routes */}
                <Route path="brands/:entityId/seo" element={<BrandSeoList />} />
                <Route path="brands/:entityId/seo/create" element={<BrandSeoCreate />} />
                <Route path="brands/:entityId/seo/edit/:id" element={<BrandSeoEdit />} />
                <Route path="brands/:entityId/seo/view/:id" element={<BrandSeoView />} />

                {/* Category SEO Routes */}
                <Route path="categories/:entityId/seo" element={<CategorySeoList />} />
                <Route path="categories/:entityId/seo/create" element={<CategorySeoCreate />} />
                <Route path="categories/:entityId/seo/edit/:id" element={<CategorySeoEdit />} />
                <Route path="categories/:entityId/seo/view/:id" element={<CategorySeoView />} />

                {/* Subcategory SEO Routes */}
                <Route path="subcategories/:entityId/seo" element={<SubcategorySeoList />} />
                <Route path="subcategories/:entityId/seo/create" element={<SubcategorySeoCreate />} />
                <Route path="subcategories/:entityId/seo/edit/:id" element={<SubcategorySeoEdit />} />
                <Route path="subcategories/:entityId/seo/view/:id" element={<SubcategorySeoView />} />

                <Route path="products/:entityId/seo" element={<ProductSeoList />} />
                <Route path="products/:entityId/seo/create" element={<ProductSeoCreate />} />
                <Route path="products/:entityId/seo/edit/:id" element={<ProductSeoEdit />} />
                <Route path="products/:entityId/seo/view/:id" element={<ProductSeoView />} />

                {/* Blog SEO Routes */}
                <Route path="blogs/:entityId/seo" element={<BlogSeoList />} />
                <Route path="blogs/:entityId/seo/create" element={<BlogSeoCreate />} />
                <Route path="blogs/:entityId/seo/edit/:id" element={<BlogSeoEdit />} />
                <Route path="blogs/:entityId/seo/view/:id" element={<BlogSeoView />} />

                {/* Ads Routes */}
                <Route path="ads" element={<AdsList />} />
                <Route path="ads/create" element={<AdsCreateModal />} />
                <Route path="ads/edit/:id" element={<AdsEditModal />} />
                <Route path="ads/view/:id" element={<AdsViewPage />} />
                <Route path="ads/deleted" element={<DeletedAdsList />} />

                {/* Entity-specific Ads Routes */}
                <Route path="products/:productId/ads" element={<ProductAdsPage />} />
                <Route path="brands/:brandId/ads" element={<BrandAdsPage />} />
                <Route path="categories/:categoryId/ads" element={<CategoryAdsPage />} />
                <Route path="subcategories/:subcategoryId/ads" element={<SubcategoryAdsPage />} />

                {/* Sharable Routes */}
                <Route path="sharable" element={<AllSharablesPage />} />
                <Route path="sharable/deleted" element={<DeletedSharableList />} />
                <Route path="products/:productId/sharable" element={<ProductSharablePage />} />
                <Route path="products/:productId/sharable/deleted" element={<DeletedSharableList />} />

                {/* Booking Routes */}
                <Route path="bookings" element={<BookingPage />} />
                <Route path="bookings/reply/:id" element={<BookingReply />} />
                <Route path="custom-bookings/reply/:id" element={<CustomBookingReply />} />

                {/* Inquiry Routes */}
                <Route path="inquiries" element={<BookingPage />} />
                <Route path="inquiries/deleted" element={<DeletedInquiries />} />
                <Route path="inquiries/:id" element={<ViewInquiry />} />
                <Route path="inquiries/:id/reply" element={<CreateReply />} />

                {/* Product Detail Routes (with ID) */}
                <Route path="dateandpricing/:id" element={<DateAndPricingListPage />} />
                <Route path="package-info/:id" element={<PackageInfoListPage />} />
                <Route path="faq/:id" element={<FaqListPage />} />

                {/* Content Management Routes */}
                <Route path="blogs" element={<BlogPage />} />
                <Route path="deleted-blogs" element={<DeletedBlogsList />} />
                <Route path="blog/:blogId" element={<BlogViewPage />} />
                <Route path="blog-gallery" element={<ImageGallery />} />
                <Route path="career" element={<CertificatePage />} />
                <Route path="deleted-careers" element={<DeletedCareersList />} />
                <Route path="useful-info" element={<InfoPage />} />
                <Route path="team-members" element={<MembersPage />} />
                <Route path="team-member/deleted" element={<DeletedMemberList />} />

                <Route path="deleted-members" element={<DeletedMemberList />} />
                <Route path="page-content" element={<PageContentPage />} />
                <Route path="pages/:id" element={<PageContentViewPage />} />

                {/* Application Routes */}
                <Route path="applications" element={<ApplicationListPage />} />
                <Route path="applications/:id/reply" element={<CreateCareerReply />} />
                <Route path="deleted-applications" element={<DeletedApplicationList />} />

                <Route path="home-gallery" element={<HomeGalleryPage />} />
                <Route path="home-gallery/create" element={<HomeGalleryCreate />} />
                <Route path="home-gallery/edit/:id" element={<HomeGalleryEdit />} />
                <Route path="home-gallery/view/:id" element={<HomeGalleryView />} />
                <Route path="home-testimonial" element={<HomeTestimonialPage />} />
                <Route path="homefaq" element={<Homefaq />} />

                {/* Technology Routes */}
                <Route path="technology" element={<TechnologyList />} />
                <Route path="technology/create" element={<TechnologyCreate />} />
                <Route path="technology/edit/:id" element={<TechnologyEdit />} />
                <Route path="technology/view/:id" element={<TechnologyView />} />
                <Route path="technology/deleted" element={<DeletedTechnologyList />} />

                {/* Other Routes */}
                <Route path="private-trips" element={<PrivateTripPage />} />
                <Route path="old-reviews" element={<ReviewPage />} />
                <Route path="inbox" element={<InboxListPage />} />
                <Route path="inbox/:id" element={<ContactDetailsPage />} />
                <Route path="inbox/:id/reply" element={<CreateContactReply />} />
                <Route path="deleted-contacts" element={<DeletedContactList />} />
                <Route path="user-management" element={<UserManagementPage />} />
                <Route path="newsletter" element={<NewsletterList />} />
                <Route path="newsletter/deleted" element={<DeletedNewsletterList />} />
              </Route>
            </Route>
          </Routes>
          <Toaster />
        </BrowserRouter>
      </GoogleReCaptchaProvider>
    </>
  );
}

export default App;
