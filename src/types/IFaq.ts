export interface IFaqResponse {
  status: number;
  message: string;
  data: {
    faqs: IFAQ[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IFaqData {
  faqs: IFAQ[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IFAQ {
  id: string
  createdAt: string
  updatedAt: string
  sortOrder: number,
  isDeleted: boolean,
  title: string,
  description: {
    content: string
  },
  isActive: boolean
}

export interface IFaqDescription {
  content: string;
}



interface FAQDescriptionContent {
  content: string;
  steps1?: never;
}

interface FAQDescriptionSteps {
  content?: never;
  steps1: string[];
}

type FAQDescription = FAQDescriptionContent | FAQDescriptionSteps;



interface IFAQResponse {
  status: number;
  message: string;
  data: {
    faqs: IFAQ[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}