export type SocialLink = {
  id: "facebook" | "instagram";
  label: string;
  handle: string;
  href: string;
};

export type WhatsAppContact = {
  id: string;
  displayNumber: string;
  href: string;
};

export const SOCIAL_LINKS: SocialLink[] = [
  {
    id: "facebook",
    label: "Facebook",
    handle: "Official profile",
    href: "https://www.facebook.com/profile.php?id=61592890808867",
  },
  {
    id: "instagram",
    label: "Instagram",
    handle: "@mdismail90154",
    href: "https://www.instagram.com/mdismail90154?igsh=enQxOGY5a3EzZXh4",
  },
];

export const WHATSAPP_CONTACTS: WhatsAppContact[] = [
  {
    id: "whatsapp-8801863211541",
    displayNumber: "+880 1863 211541",
    href: "https://wa.me/8801863211541",
  },
  {
    id: "whatsapp-8801341926364",
    displayNumber: "+880 1341 926364",
    href: "https://wa.me/8801341926364",
  },
];
