import { Schema, model } from "mongoose";

// Singleton settings doc (enforced in service by fixed _id lookup).
const siteSettingsSchema = new Schema(
  {
    heroTitle: String,
    heroSubtitle: String,
    heroCta: String,
    brandName: String,
    logoUrl: String,
    stats: [{ label: String, value: Number, suffix: String }],
    partners: [String],
    contact: {
      phone: String,
      whatsapp: String,
      email: String,
    },
    branches: [{ name: String, address: String, mapUrl: String }],
    socials: { youtube: String, instagram: String, linkedin: String, facebook: String },
    gallery: [String],
  },
  { timestamps: true },
);

export const SiteSettings = model("SiteSettings", siteSettingsSchema);
