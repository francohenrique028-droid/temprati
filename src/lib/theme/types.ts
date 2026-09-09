export type ThemeColors = {
  primary: string;
  primaryForeground: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  secondary: string;
  border: string;
  footerBg: string;
  footerText: string;
};

export type ThemeTypography = {
  fontFamily: string;
  baseSize: number;
  headingWeight: number;
  letterCase: "lowercase" | "none" | "uppercase";
};

export type ThemeHeader = {
  logoText: string;
  logoImage: string;
  sticky: boolean;
  showSearch: boolean;
  showFavorites: boolean;
  showAccount: boolean;
  showCart: boolean;
  announcements: string[];
};

export type ThemeCommerce = {
  announcement: string;
  announcementEnabled: boolean;
  announcementBg: string;
  announcementText: string;
  freeShippingMinimum: number;
  pixDiscount: number;
};

export type ThemeBanner = {
  desktopImage: string;
  mobileImage: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  buttonHref: string;
  visible: boolean;
};

export type ThemeProducts = {
  columnsDesktop: number;
  columnsMobile: number;
  showPrice: boolean;
  showInstallments: boolean;
  showBuyButton: boolean;
  showBadgeSale: boolean;
  showBadgeNew: boolean;
};

export type ThemeCategorySection = {
  title: string;
  titleColor: string;
  items: string[];
};

export type ThemeFooter = {
  copyright: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  aboutText: string;
};

export type ThemeConfig = {
  colors: ThemeColors;
  typography: ThemeTypography;
  header: ThemeHeader;
  commerce: ThemeCommerce;
  banner: ThemeBanner;
  products: ThemeProducts;
  categorySection: ThemeCategorySection;
  footer: ThemeFooter;
};

export const defaultTheme: ThemeConfig = {
  colors: {
    primary: "hsl(335 75% 82%)",
    primaryForeground: "#1F1F1F",
    background: "#FFFFFF",
    foreground: "#1F1F1F",
    muted: "#F5F5F5",
    mutedForeground: "#707070",
    secondary: "hsl(335 70% 96%)",
    border: "#ECE8E1",
    footerBg: "#111111",
    footerText: "#E5E5E5",
  },
  typography: {
    fontFamily: "Plus Jakarta Sans",
    baseSize: 16,
    headingWeight: 600,
    letterCase: "lowercase",
  },
  header: {
    logoText: "",
    logoImage: "",
    sticky: true,
    showSearch: true,
    showFavorites: true,
    showAccount: true,
    showCart: true,
    announcements: [],
  },
  commerce: {
    announcement: "",
    announcementEnabled: false,
    announcementBg: "",
    announcementText: "",
    freeShippingMinimum: 0,
    pixDiscount: 0,
  },
  banner: {
    desktopImage: "",
    mobileImage: "",
    title: "",
    subtitle: "",
    buttonLabel: "",
    buttonHref: "",
    visible: true,
  },
  products: {
    columnsDesktop: 4,
    columnsMobile: 2,
    showPrice: true,
    showInstallments: true,
    showBuyButton: true,
    showBadgeSale: true,
    showBadgeNew: true,
  },
  categorySection: {
    title: "",
    titleColor: "",
    items: [],
  },
  footer: {
    copyright: "",
    whatsapp: "",
    instagram: "",
    facebook: "",
    aboutText: "",
  },
};

export const THEME_MESSAGE = "temprati:theme:update";
export const THEME_READY = "temprati:theme:ready";
export const THEME_SELECT = "temprati:theme:select";
