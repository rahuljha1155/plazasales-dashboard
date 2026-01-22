import { api } from "@/services/api";

// ================== USER ==================
export const userApi = {
  register: (data: object) => api.post("/users/register", data),
  login: (data: object) => api.post("/users/login", data),
  logout: () => api.get("/users/logout"),
  getCurrent: () => api.get("/users/current"),
};

// ================== BLOG ==================
export const blogApi = {
  create: (data: object) =>
    api.post("/blog/get-all-blogs", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (blogId: string, data: object) =>
    api.patch(`/blog/${blogId}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getOne: (blogId: string) => api.get(`/blog/get-blog/${blogId}`),
  getAllBlogs: (params?: { page?: number; limit?: number }) =>
    api.get("/blog/get-all-blogs", { params }).then((response) => {
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    }),
  getAllForCard: () => api.get("/blog/get-all-blogs/for-card"),
  delete: (blogId: string) => api.delete(`/blog/delete-blog/${blogId}`),
  deleteMany: (data: object) => api.post("/multiple-delete", data),
};

// ================== BOOKING ==================
export const bookingApi = {
  create: (data: {
    package: string;
    personalInfo: Array<{
      fullName: string;
      email: string;
      country: string;
      phoneNumber: string;
      gender?: string;
      dateOfBirth?: string;
      passportNumber?: string;
      passportExpiryDate?: string;
    }>;
    arrivalDate: string;
    departureDate: string;
    adults: number;
    children?: number;

    message?: string;
    termsAccepted?: boolean;
  }) => {
    return api.post("/booking", data);
  },

  getAll: () => api.get("/booking?populate=package"),

  getById: (id: string) => api.get(`/booking/${id}?populate=package`),

  updateStatus: (id: string, data: { status: string }) =>
    api.patch(`/booking/${id}/status`, data),

  update: (
    id: string,
    data: Partial<{
      package?: string;
      personalInfo?: Array<{
        fullName: string;
        email: string;
        country: string;
        phoneNumber: string;
        gender?: string;
        dateOfBirth?: string;
        passportNumber?: string;
        passportExpiryDate?: string;
      }>;
      arrivalDate?: string;
      departureDate?: string;
      adults?: number;
      children?: number;

      message?: string;
    }>
  ) => {
    return api.patch(`/booking/${id}`, data);
  },

  delete: (id: string) => api.delete(`/booking/${id}`),
};

// ================== CUSTOM BOOKING ==================

export const customBookingApi = {
  create: (data: {
    package: string;
    personalInfo: Array<{
      fullName: string;
      email: string;
      country: string;
      phoneNumber: string;
      gender?: string;
      dateOfBirth?: string;
      passportNumber?: string;
      passportExpiryDate?: string;
    }>;
    arrivalDate: string;
    departureDate: string;
    adults: number;
    children?: number;

    message?: string;
    termsAccepted?: boolean;
  }) => {
    return api.post("/custom-booking", data);
  },

  getAll: () => api.get("/custom-booking?populate=package"),

  getById: (id: string) => api.get(`/custom-booking/${id}?populate=package`),

  updateStatus: (id: string, data: { status: string }) =>
    api.patch(`/custom-booking/${id}/status`, data),

  update: (
    id: string,
    data: Partial<{
      package?: string;
      personalInfo?: Array<{
        fullName: string;
        email: string;
        country: string;
        phoneNumber: string;
        gender?: string;
        dateOfBirth?: string;
        passportNumber?: string;
        passportExpiryDate?: string;
      }>;
      arrivalDate?: string;
      departureDate?: string;
      adults?: number;
      children?: number;

      message?: string;
    }>
  ) => {
    return api.patch(`/custom-booking/${id}`, data);
  },

  delete: (id: string) => api.delete(`/custom-booking/${id}`),
};

// ================== ORDERS ==================
export const orderApi = {
  create: (data: object) => api.post("/orders", data),
  getAll: () => api.get("/orders"),
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, data: object) =>
    api.patch(`/orders/${id}/status`, data),
  delete: (id: string) => api.delete(`/orders/${id}`),
};

// ================== REVIEWS ==================
export const reviewApi = {
  create: (data: object) => api.post("/reviews", data),
  getAll: () => api.get("/reviews"),
  getById: (id: string) => api.get(`/reviews/${id}`),
  update: (id: string, data: object) => api.patch(`/reviews/${id}`, data),
  delete: (id: string) => api.delete(`/reviews/${id}`),
};

// ================== CHAT ==================
export const chatApi = {
  create: (data: object) => api.post("/chat", data),
  findUserChats: (userId: string) => api.get(`/chat/${userId}`),
  findChat: (firstId: string, secondId: string) =>
    api.get(`/chat/find/${firstId}/${secondId}`),
};

// ================== MESSAGES ==================
export const messageApi = {
  create: (data: object) => api.post("/messages", data),
  getForChat: (chatId: string) => api.get(`/messages/${chatId}`),
};

// ================== BLOG COMMENTS ==================
export const commentApi = {
  create: (blogId: string, data: object) =>
    api.post(`/comment/${blogId}`, data),
  getAll: () => api.get("/comment"),
  delete: (commentId: string) => api.delete(`/comment/${commentId}`),
};

// ================== BOOKMARK ==================
export const bookmarkApi = {
  create: (data: object) => api.post("/bookmark", data),
  getAll: () => api.get("/bookmark"),
  delete: (id: string) => api.delete(`/bookmark/${id}`),
};

// ================== FOLLOW ==================
export const followApi = {
  create: (data: object) => api.post("/follow", data),
  getFollowers: () => api.get("/follow"),
  delete: (id: string) => api.delete(`/follow/${id}`),
};

// ================== NOTIFICATION ==================
export const notificationApi = {
  getAll: () => api.get("/notification"),
  updateStatus: (id: string, data: object) =>
    api.patch(`/notification/${id}/status`, data),
  delete: (id: string) => api.delete(`/notification/${id}`),
};

// ================== certificate ==================
export const certificateApi = {
  getAll: () => api.get("/certificate"),
  create: (data: object) =>
    api.post("/certificate", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  update: (id: string, data: object) =>
    api.put(`/certificate/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  delete: (id: string) => api.delete(`/certificate/${id}`),
};

// ================== usefulInfo ==================

export const usefulInfoAPi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get("/useful-info", { params }).then((response) => {
      return {
        data: response.data.data || [],
        pagination: response.data.pagination || {
          total: 0,
          totalPages: 1,
          currentPage: params?.page || 1,
          itemsPerPage: params?.limit || 10,
        },
      };
    }),
  create: (data: object) => {

    return api.post("/useful-info", data);
  },
  update: (id: string, data: object) => {

    return api.put(`/useful-info/${id}`, data);
  },
  delete: (id: string) => api.delete(`/faq/delete-faq/${id}`),
};

export const homefaqApi = {
  getAll: () => api.get("/homefaq"),
  create: (data: object) => api.post("/homefaq", data),
  update: (id: string, data: object) => api.put(`/homefaq/${id}`, data),
  delete: (id: string) => api.delete(`/homefaq/${id}`),
};

export const pageApi = {
  create: (data: FormData) =>
    api.post("/pages", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (pageId: string, data: FormData) =>
    api.patch(`/pages/${pageId}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getOne: (pageId: string) => api.get(`/pages/${pageId}`),
  getBySlug: (slug: string) => api.get(`/pages/slug/${slug}`),
  getAll: () => api.get("/pages"),
  delete: (pageId: string) => api.delete(`/pages/${pageId}`),
};

export const teamMemberApi = {
  // GET all members - new endpoint
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get("/team/get-all-members", { params }),

  // POST create member
  create: (data: FormData | object) =>
    api.post("/team/create-member", data, {
      headers: {
        // allow either JSON or multipart; keep header only when FormData is used by caller
        // if caller passes FormData, axios will set correct boundary automatically
      } as any,
    }),

  // GET member by id
  getOne: (memberId: string) => api.get(`/team/get-member/${memberId}`),

  // PUT update member
  update: (memberId: string, data: FormData | object) =>
    api.put(`/team/update-member/${memberId}`, data, {
      headers: {
        // same note as create
      } as any,
    }),

  // DELETE member
  delete: (memberId: string) => api.delete(`/team/delete-member/${memberId}`),

  // DELETE bulk members
  deleteBulk: (memberIds: string[]) =>
    api.delete("/team/delete-members/" + memberIds.join(',')),

  // keep sort order endpoint (unchanged) in case app uses it
  updateSortOrder: (data: { members: { id: string; sortOrder: number }[] }) =>
    api.put("/updatesortorder", data),
};

export const videoReviewApi = {
  getAll: () => api.get("/video"),
  getAllByPackageId: (id: string) => api.get(`/video/package/${id}`),
  create: (data: FormData) =>
    api.post("/video", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getOne: (memberId: string) => api.get(`/video/${memberId}`),
  update: (memberId: string, data: FormData) =>
    api.put(`/video/${memberId}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (memberId: string) => api.delete(`/video/${memberId}`),
};

// ================== PRODUCTS ==================
export const productApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get("/products", { params }).then((response) => {
      return {
        data: response.data.data || [],
        pagination: response.data.pagination || {
          total: 0,
          totalPages: 1,
          currentPage: params?.page || 1,
          itemsPerPage: params?.limit || 10,
        },
      };
    }),
  getOne: (productId: string) => api.get(`/products/${productId}`),
  create: (data: FormData) =>
    api.post("/products", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (productId: string, data: FormData) =>
    api.put(`/products/${productId}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (productId: string) => api.delete(`/products/${productId}`),
};

// ================== BRANDS ==================
export const brandApi = {
  getAll: () => api.get("/brands"),
  getOne: (brandId: string) => api.get(`/brands/${brandId}`),
  create: (data: FormData) =>
    api.post("/brands", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (brandId: string, data: FormData) =>
    api.put(`/brands/${brandId}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (brandId: string) => api.delete(`/brands/${brandId}`),
};

// ================== GALLERY ==================
export const galleryApi = {
  getAll: () => api.get("/gallery/get-all-galleries"),
  getOne: (galleryId: string) => api.get(`/gallery/get-gallery/${galleryId}`),
  create: (data: FormData) =>
    api.post("/gallery/create-gallery", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (galleryId: string, data: FormData) =>
    api.put(`/gallery/update-gallery/${galleryId}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (galleryId: string) =>
    api.delete(`/gallery/delete-gallery/${galleryId}`),
};

// ================== ANALYTICS ==================
export const analyticsApi = {
  getRecentUserAnalytics: () => api.get("/analytics/user/recent"),
};
