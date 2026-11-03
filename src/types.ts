export interface Location {
  /** "accounts/{a}/locations/{l}" */
  id: string;
  title: string;
  address?: string;
  website?: string;
}

export interface Review {
  /** Full review resource name, "accounts/{a}/locations/{l}/reviews/{r}" */
  id: string;
  reviewer: string;
  rating?: number;
  comment?: string;
  createTime?: string;
  reply?: string;
}

export interface PostInput {
  summary: string;
  /** Local file paths or public https URLs. */
  photos?: string[];
  callToAction?: {
    actionType: "BOOK" | "ORDER" | "SHOP" | "LEARN_MORE" | "SIGN_UP" | "CALL";
    url?: string;
  };
}
