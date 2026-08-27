import type { LucideIcon } from "lucide-react";
import {
  BadgeDollarSign,
  BarChart3,
  BookOpenCheck,
  CircleHelp,
  ClipboardCheck,
  CreditCard,
  FileText,
  Gem,
  History,
  LayoutDashboard,
  LifeBuoy,
  LockKeyhole,
  MessageSquareMore,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trophy,
  UserRound,
  UsersRound,
} from "lucide-react";

export type NavigationItem = {
  label: string;
  path: string;
  icon?: LucideIcon;
};

export const PUBLIC_NAV_ITEMS: NavigationItem[] = [
  { label: "Home", path: "/" },
  { label: "Free Tips", path: "/free-tips" },
  { label: "Results", path: "/results" },
  { label: "Performance", path: "/performance" },
  { label: "VIP", path: "/vip" },
  { label: "About", path: "/about" },
  { label: "FAQ", path: "/faq" },
  { label: "Contact", path: "/contact" },
];

export const FOOTER_NAV_ITEMS: NavigationItem[] = [
  { label: "Terms", path: "/terms" },
  { label: "Privacy", path: "/privacy" },
  { label: "Responsible Use", path: "/responsible-use" },
];

export const MEMBER_NAV_ITEMS: NavigationItem[] = [
  { label: "Overview", path: "/account", icon: LayoutDashboard },
  { label: "Free Predictions", path: "/account/free-predictions", icon: Sparkles },
  { label: "Paid Predictions", path: "/account/paid-predictions", icon: LockKeyhole },
  { label: "VIP Membership", path: "/account/membership", icon: Gem },
  { label: "Payment History", path: "/account/payment-history", icon: CreditCard },
  { label: "Prediction History", path: "/account/prediction-history", icon: History },
  { label: "Profile", path: "/account/profile", icon: UserRound },
  { label: "Security", path: "/account/security", icon: ShieldCheck },
  { label: "Support", path: "/account/support", icon: LifeBuoy },
];

export const ADMIN_NAV_ITEMS: NavigationItem[] = [
  { label: "Admin Overview", path: "/admin", icon: LayoutDashboard },
  { label: "Users", path: "/admin/users", icon: UsersRound },
  { label: "Predictions", path: "/admin/predictions", icon: BookOpenCheck },
  { label: "Results", path: "/admin/results", icon: Trophy },
  { label: "Memberships", path: "/admin/memberships", icon: Gem },
  { label: "Payments", path: "/admin/payments", icon: BadgeDollarSign },
  { label: "Site Content", path: "/admin/site-content", icon: SlidersHorizontal },
  { label: "Support", path: "/admin/support", icon: MessageSquareMore },
];

export function getNavigationLabel(items: NavigationItem[], pathname: string, fallback: string) {
  return items.find((item) => item.path === pathname)?.label ?? fallback;
}

export function getAccountSection(pathname: string) {
  return pathname.replace("/account", "").replace(/^\//, "") || "overview";
}

export function getAdminSection(pathname: string) {
  return pathname.replace("/admin", "").replace(/^\//, "") || "overview";
}

export const PUBLIC_PAGE_KEYS = [
  "free-tips",
  "results",
  "performance",
  "vip",
  "about",
  "faq",
  "contact",
  "terms",
  "privacy",
  "responsible-use",
] as const;

export type PublicPageKey = (typeof PUBLIC_PAGE_KEYS)[number];
