# Analytics Dashboard

A comprehensive analytics dashboard for visualizing brand, category, and SEO data with interactive charts and graphs.

## 📊 Features

### Brand Analytics
- **Overview Stats**: Total brands, authorized brands, and brands with certificates
- **Charts**:
  - Pie Chart: Distribution breakdown
  - Bar Chart: Statistics comparison
  - Horizontal Bar Chart: Top brands by products
  - Radar Chart: Multi-dimensional brand performance
  - Data Table: Complete brand listing

### Category Analytics
- **Overview Stats**: Total categories, subcategories, and products
- **Charts**:
  - Pie Chart: Categories distribution by brand
  - Composed Chart: Subcategories vs Products comparison
  - Bar Chart: Products per category
  - Area Chart: Category growth trend
  - Data Table: Complete category listing

### SEO Analytics
- **Overview Stats**: Total records, optimized, indexable, and canonical URLs
- **Charts**:
  - Radial Bar Chart: Optimization coverage percentage
  - Pie Charts: Optimization and indexability status
  - Bar Chart: Metrics comparison
  - Line Chart: SEO metrics trend
  - Health Summary Cards: Detailed breakdown

## 🚀 Usage

### Access the Dashboard
Navigate to `/dashboard/analytics` in your application.

### API Endpoints
The dashboard expects the following API endpoints:

1. **Brand Overview**
   ```
   GET /analytics/brand/overview
   Response: { totalBrands, authorizedBrands, withCertificates }
   ```

2. **Top Brands**
   ```
   GET /analytics/brand/top-brands
   Response: { brands: [{ id, name, slug, productCount, popularCount }] }
   ```

3. **Top Categories**
   ```
   GET /analytics/category/top-categories
   Response: { categories: [{ id, title, slug, brand, subcategoryCount, productCount }] }
   ```

4. **SEO Overview**
   ```
   GET /analytics/seo/overview
   Response: { totalRecords, optimized, indexable, canonicalSet, optimizationCoverage }
   ```

## 🎨 Components

### AnalyticsDashboard
Main component with tabbed navigation between Brand, Category, and SEO analytics.

### BrandAnalytics
Displays brand-related metrics and charts.

### CategoryAnalytics
Displays category-related metrics and charts.

### SEOAnalytics
Displays SEO performance metrics and charts.

## 📦 Dependencies

- **recharts**: For all chart visualizations
- **lucide-react**: For icons
- **@radix-ui**: For UI components (Card, Tabs, etc.)

## 🎯 Chart Types Used

1. **Pie Chart**: Distribution visualization
2. **Bar Chart**: Comparative analysis
3. **Line Chart**: Trend analysis
4. **Area Chart**: Cumulative metrics
5. **Radar Chart**: Multi-dimensional comparison
6. **Radial Bar Chart**: Percentage visualization
7. **Composed Chart**: Multiple metric types

## 🔧 Customization

### Color Schemes
Colors are defined at the component level and can be customized:
```tsx
const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F"];
```

### Chart Dimensions
Responsive containers are set to 300px height by default:
```tsx
<ResponsiveContainer width="100%" height={300}>
```

## 📱 Responsive Design

All charts and components are fully responsive with:
- Grid layouts that adapt to screen size
- Responsive chart containers
- Mobile-friendly tables with overflow scroll

## 🎭 Loading States

Each analytics component includes loading skeletons while data is being fetched.

## 🌟 Best Practices

1. **Performance**: Data is fetched once on component mount
2. **Error Handling**: Console errors for debugging
3. **Responsive**: All charts use ResponsiveContainer
4. **Accessibility**: Semantic HTML and proper ARIA labels
5. **Tooltips**: Interactive tooltips on all charts

## 📈 Extending

To add new analytics sections:

1. Create a new component in the `analytics` folder
2. Add API call to fetch data
3. Design charts using recharts
4. Add a new tab in `AnalyticsDashboard.tsx`

Example:
```tsx
<TabsTrigger value="products">Products</TabsTrigger>
<TabsContent value="products">
  <ProductAnalytics />
</TabsContent>
```
