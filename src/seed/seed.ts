import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Course } from "../models/Course.js";
import { Trainer } from "../models/Trainer.js";
import { Batch } from "../models/Batch.js";
import { Testimonial } from "../models/Testimonial.js";
import { BlogPost } from "../models/BlogPost.js";
import { Certificate } from "../models/Certificate.js";
import { AdminUser } from "../models/AdminUser.js";
import { SiteSettings } from "../models/SiteSettings.js";

const INSTITUTE = "Epixx AI Institute of Intelligence";
const CITY = "Jaipur";

// Rich demo content (WsCube-style catalog). Safe to re-run — upserts by slug/email.
await connectDB();

await AdminUser.updateOne(
  { email: "admin@epixx.ai" },
  {
    $setOnInsert: {
      name: "Epixx Admin",
      email: "admin@epixx.ai",
      passwordHash: await bcrypt.hash("Epixx@123", 10),
      role: "SuperAdmin",
      isActive: true,
    },
  },
  { upsert: true },
);

const trainerSeed = [
  {
    name: "Ananya Sharma", slug: "ananya-sharma",
    bio: `Senior full-stack mentor with 8 years of industry experience. Has trained 2000+ students in ${CITY} in MERN, Next.js and placement prep.`,
    expertise: ["MERN", "Next.js", "System Design"], experienceYears: 8,
  },
  {
    name: "Rahul Verma", slug: "rahul-verma",
    bio: "Performance marketer who has managed 2Cr+ in ad spend across Google and Meta. Teaches SEO, ads and analytics with live client projects.",
    expertise: ["SEO", "Google Ads", "Meta Ads", "Analytics"], experienceYears: 6,
  },
  {
    name: "Priya Meena", slug: "priya-meena",
    bio: "Data scientist with fintech experience. Teaches Python, SQL and ML with capstone projects and interview-focused mentoring.",
    expertise: ["Python", "SQL", "Machine Learning", "Power BI"], experienceYears: 7,
  },
  {
    name: "Amit Singh", slug: "amit-singh",
    bio: "Security analyst with SOC experience. Runs hands-on labs in networking, Linux and ethical hacking with certification guidance.",
    expertise: ["Networks", "Linux", "Ethical Hacking", "SOC"], experienceYears: 9,
  },
];
const trainerIds: Record<string, unknown> = {};
for (const t of trainerSeed) {
  const doc = await Trainer.findOneAndUpdate(
    { slug: t.slug },
    { $set: { ...t, status: "active" } },
    { upsert: true, new: true },
  );
  trainerIds[t.slug] = doc._id;
}

const courses = [
  {
    title: `Full Stack Web Development Course in ${CITY}`, slug: "full-stack-web-development-course",
    category: "Web Development", trainer: trainerIds["ananya-sharma"],
    shortDescription: `Job-oriented MERN + Next.js program at ${INSTITUTE} with live projects and placement support.`,
    description: "Start from HTML/CSS/JavaScript and grow into React, Next.js, Node, Express and MongoDB. Build 5 portfolio projects, learn Git and deployment, and finish with mock interviews and referrals.",
    syllabus: [
      { module: "Web Foundations", topics: ["HTML5 semantics", "CSS Flexbox & Grid", "Responsive design", "JavaScript ES6+"] },
      { module: "React & Next.js", topics: ["Components & hooks", "Routing & data fetching", "Server components", "SEO with Next.js"] },
      { module: "Backend & Deployment", topics: ["Node + Express APIs", "MongoDB & Mongoose", "Auth with JWT", "Deploy on Vercel/Render"] },
    ],
    duration: "6 months", fees: 65000, discountedFees: 45000, mode: "Hybrid", level: "Beginner",
    highlights: ["100% practical classes", "5 portfolio projects", "Placement assistance", "Free demo class"],
    faqs: [
      { q: "Do I need a coding background?", a: "No. We start from zero and build up to advanced Next.js." },
      { q: "Is placement support included?", a: "Yes — interview prep, mock interviews and referrals to hiring partners." },
    ],
    status: "published", order: 1,
    metaTitle: `Full Stack Web Development Course in ${CITY} | ${INSTITUTE}`,
    metaDescription: `Join the job-oriented Full Stack course in ${CITY}: MERN, Next.js, live projects, placement support. Book a free demo.`,
  },
  {
    title: `Digital Marketing Course in ${CITY}`, slug: "digital-marketing-course",
    category: "Digital Marketing", trainer: trainerIds["rahul-verma"],
    shortDescription: "SEO, ads, social, analytics with live client projects and freelancing guidance.",
    description: "Master SEO, Google Ads, Meta Ads, content marketing, email and analytics. Run guided live campaigns and build an agency-style portfolio plus a freelancing module.",
    syllabus: [
      { module: "SEO & Content", topics: ["Keyword research", "On-page & technical SEO", "Content strategy", "Search Console"] },
      { module: "Paid Ads", topics: ["Google Ads search & display", "Meta Ads funnels", "Budgets & bidding", "Landing pages"] },
      { module: "Analytics & Freelancing", topics: ["GA4 & reporting", "Client projects", "Getting freelance clients", "Interviews"] },
    ],
    duration: "4 months", fees: 40000, discountedFees: 28000, mode: "Online", level: "Beginner",
    highlights: ["Live ad budgets", "Agency-style projects", "Freelancing module", "Certification guidance"],
    faqs: [{ q: "Will I run real ads?", a: "Yes — guided live campaigns with mentor review." }],
    status: "published", order: 2,
    metaTitle: `Digital Marketing Course in ${CITY} | ${INSTITUTE}`,
    metaDescription: `Practical digital marketing course in ${CITY}: SEO, ads, analytics. Book a free demo.`,
  },
  {
    title: `Data Science Course in ${CITY}`, slug: "data-science-course",
    category: "Data Science", trainer: trainerIds["priya-meena"],
    shortDescription: "Python, ML, SQL, dashboards with portfolio projects and interview prep.",
    description: "Learn Python, SQL, pandas, visualization and machine learning. Finish with a capstone project, BI dashboards and structured interview preparation.",
    syllabus: [
      { module: "Python & SQL", topics: ["Python basics to pandas", "SQL joins & aggregations", "Data cleaning", "Visualization"] },
      { module: "Machine Learning", topics: ["Regression & classification", "Model evaluation", "Feature engineering", "Capstone project"] },
      { module: "BI & Careers", topics: ["Power BI dashboards", "Resume & portfolio", "Mock interviews", "Referrals"] },
    ],
    duration: "7 months", fees: 75000, discountedFees: 55000, mode: "Online", level: "Intermediate",
    highlights: ["Capstone project", "SQL + BI", "Interview prep", "Small batches"],
    faqs: [{ q: "Is maths required?", a: "Basic maths is enough; we teach statistics from scratch." }],
    status: "published", order: 3,
    metaTitle: `Data Science Course in ${CITY} | ${INSTITUTE}`,
    metaDescription: `Job-ready data science in ${CITY}: Python, ML, SQL. Book a free demo.`,
  },
  {
    title: `Cyber Security Course in ${CITY}`, slug: "cyber-security-course",
    category: "Cyber Security", trainer: trainerIds["amit-singh"],
    shortDescription: "Ethical hacking, networks, SOC skills with labs and certification guidance.",
    description: "Build foundations in networks and Linux, then move to security operations, vulnerability assessment and ethical hacking labs used in real SOC workflows.",
    syllabus: [
      { module: "Foundations", topics: ["Networking basics", "Linux command line", "How the web works", "Security mindset"] },
      { module: "Offense & Defense", topics: ["Vulnerability scanning", "Web app security", "SOC workflows", "Incident response basics"] },
      { module: "Career Track", topics: ["Certification roadmap", "Lab portfolio", "Mock interviews", "Referrals"] },
    ],
    duration: "6 months", fees: 70000, discountedFees: 52000, mode: "Offline", level: "Intermediate",
    highlights: ["Hands-on labs", "SOC workflows", "Certification guidance", "Mentor support"],
    faqs: [{ q: "Is it beginner friendly?", a: "Yes, with extra Linux and networking foundations." }],
    status: "published", order: 4,
    metaTitle: `Cyber Security Course in ${CITY} | ${INSTITUTE}`,
    metaDescription: `Practical cyber security course in ${CITY} with labs. Book a free demo.`,
  },
  {
    title: `UI/UX Design Course in ${CITY}`, slug: "ui-ux-design-course",
    category: "Design", trainer: trainerIds["ananya-sharma"],
    shortDescription: "Figma, design systems and portfolio projects with mentor reviews.",
    description: "Learn user research basics, wireframing, Figma mastery, design systems and prototyping. Graduate with 3 case studies and a portfolio review.",
    syllabus: [
      { module: "UX Basics", topics: ["User research", "Wireframes", "Information architecture"] },
      { module: "UI & Figma", topics: ["Figma mastery", "Design systems", "Prototyping", "Handoff"] },
    ],
    duration: "5 months", fees: 50000, discountedFees: 36000, mode: "Hybrid", level: "Beginner",
    highlights: ["Portfolio reviews", "3 case studies", "Figma mastery"],
    faqs: [{ q: "Do I need drawing skills?", a: "No — design is about process and practice, not drawing." }],
    status: "published", order: 5,
    metaTitle: `UI/UX Design Course in ${CITY} | ${INSTITUTE}`,
    metaDescription: `Practical UI/UX design course in ${CITY}: Figma, portfolio, reviews. Book a free demo.`,
  },
  {
    title: `AI & Machine Learning Course in ${CITY}`, slug: "ai-machine-learning-course",
    category: "AI & ML", trainer: trainerIds["priya-meena"],
    shortDescription: "ML foundations, LLMs and real projects with Python.",
    description: "From ML basics to working with large language models: prompt engineering, embeddings, RAG apps and deploying AI features in real products.",
    syllabus: [
      { module: "ML Foundations", topics: ["Python for ML", " scikit-learn", "Model evaluation"] },
      { module: "Applied AI", topics: ["LLM APIs", "RAG apps", "Deploying AI features"] },
    ],
    duration: "6 months", fees: 80000, discountedFees: 60000, mode: "Online", level: "Advanced",
    highlights: ["Build AI apps", "Capstone", "Career mentoring"],
    faqs: [{ q: "Do I need Python first?", a: "We include a Python bridge module at the start." }],
    status: "published", order: 6,
    metaTitle: `AI & Machine Learning Course in ${CITY} | ${INSTITUTE}`,
    metaDescription: `Applied AI & ML course in ${CITY}: LLMs, RAG, projects. Book a free demo.`,
  },
];
const courseIds: Record<string, unknown> = {};
for (const c of courses) {
  const doc = await Course.findOneAndUpdate({ slug: c.slug }, { $set: c }, { upsert: true, new: true });
  courseIds[c.slug] = doc._id;
}

// Upcoming batches with realistic seat pressure.
const day = 86400000;
const now = Date.now();
const batchSeed = [
  { course: "full-stack-web-development-course", offset: 7, timing: "Morning 8–10 AM", mode: "Hybrid", totalSeats: 30, seatsFilled: 26, status: "filling-fast" },
  { course: "full-stack-web-development-course", offset: 21, timing: "Evening 6–8 PM", mode: "Online", totalSeats: 30, seatsFilled: 10, status: "upcoming" },
  { course: "digital-marketing-course", offset: 5, timing: "Morning 10–12 PM", mode: "Online", totalSeats: 25, seatsFilled: 12, status: "upcoming" },
  { course: "data-science-course", offset: 10, timing: "Weekend 11 AM–2 PM", mode: "Online", totalSeats: 30, seatsFilled: 27, status: "filling-fast" },
  { course: "cyber-security-course", offset: 14, timing: "Evening 5–7 PM", mode: "Offline", totalSeats: 20, seatsFilled: 8, status: "upcoming" },
  { course: "ui-ux-design-course", offset: 12, timing: "Evening 6–8 PM", mode: "Hybrid", totalSeats: 25, seatsFilled: 9, status: "upcoming" },
];
for (const [i, b] of batchSeed.entries()) {
  await Batch.findOneAndUpdate(
    { course: courseIds[b.course], timing: b.timing },
    {
      $set: {
        course: courseIds[b.course],
        startDate: new Date(now + b.offset * day),
        mode: b.mode,
        timing: b.timing,
        totalSeats: b.totalSeats,
        seatsFilled: b.seatsFilled,
        status: b.status,
      },
    },
    { upsert: true },
  );
  void i;
}

const testimonials = [
  { studentName: "Rohit Saini", course: "full-stack-web-development-course", rating: 5, quote: "Trainers explain every concept with live code. I built 4 projects and got placed within 2 months.", placedAt: "Placed as Frontend Developer", featured: true, approved: true },
  { studentName: "Neha Jain", course: "digital-marketing-course", rating: 5, quote: "We ran real ad campaigns in class. I started freelancing before the course even ended.", placedAt: "Working as Performance Marketer", featured: true, approved: true },
  { studentName: "Arjun Choudhary", course: "data-science-course", rating: 5, quote: "The capstone project and mock interviews made all the difference in my job hunt.", placedAt: "Placed as Data Analyst", featured: true, approved: true },
  { studentName: "Simran Kaur", course: "cyber-security-course", rating: 4, quote: "Labs are excellent. The SOC workflows module is exactly what interviewers asked about.", placedAt: "Placed as SOC Analyst", featured: false, approved: true },
  { studentName: "Karan Singh", course: "full-stack-web-development-course", rating: 5, quote: "Small batch, personal attention, honest guidance. Best decision for my career switch.", placedAt: "Placed as MERN Developer", featured: false, approved: true },
  { studentName: "Pooja Sharma", course: "ui-ux-design-course", rating: 5, quote: "Portfolio reviews were brutally honest and incredibly useful. I cracked my first design role.", placedAt: "Placed as UI Designer", featured: false, approved: true },
];
for (const t of testimonials) {
  await Testimonial.updateOne(
    { studentName: t.studentName },
    { $set: { ...t, course: courseIds[t.course] } },
    { upsert: true },
  );
}

const posts = [
  {
    title: "SEO Tips for Beginners: Rank Your First Website", slug: "seo-tips-for-beginners",
    author: "Epixx Faculty", category: "Digital Marketing", tags: ["seo", "beginners", "marketing"],
    excerpt: "Long-tail keywords, internal linking and Core Web Vitals explained simply.",
    body: "Start with search intent, target long-tail keywords, link courses to posts, compress images, and measure everything in Search Console.\nConsistency beats tricks: publish helpful content every week and fix technical issues as they appear.",
    readTime: 6, status: "published",
    metaTitle: `SEO Tips for Beginners | ${INSTITUTE}`,
    metaDescription: "Beginner SEO guide: keywords, internal links, Core Web Vitals.",
  },
  {
    title: "MERN vs Next.js: What Should You Learn First?", slug: "mern-vs-nextjs-what-to-learn-first",
    author: "Ananya Sharma", category: "Web Development", tags: ["mern", "nextjs", "career"],
    excerpt: "A practical roadmap for beginners choosing their first full-stack path.",
    body: "Learn JavaScript deeply first. Then React, then Next.js for SEO and performance, then Node and MongoDB for the backend.\nEmployers hire for projects: build and deploy real apps, not tutorial clones.",
    readTime: 7, status: "published",
    metaTitle: `MERN vs Next.js: What to Learn First | ${INSTITUTE}`,
    metaDescription: "Practical roadmap: JavaScript → React → Next.js → Node/MongoDB.",
  },
  {
    title: "How to Get Your First Data Analyst Job", slug: "how-to-get-first-data-analyst-job",
    author: "Priya Meena", category: "Data Science", tags: ["data", "career", "sql"],
    excerpt: "SQL, one BI tool, one capstone project, and interview prep — that is the formula.",
    body: "Master SQL joins and aggregations, build dashboards in Power BI, and complete one end-to-end capstone.\nPractice explaining your project decisions out loud — that is what interviews test.",
    readTime: 5, status: "published",
    metaTitle: `How to Get Your First Data Analyst Job | ${INSTITUTE}`,
    metaDescription: "The formula: SQL + BI + capstone + interview prep.",
  },
  {
    title: "Is Cyber Security a Good Career in India?", slug: "is-cyber-security-good-career-india",
    author: "Amit Singh", category: "Cyber Security", tags: ["security", "career"],
    excerpt: "Demand, salaries, certifications and how beginners can enter SOC roles.",
    body: "Demand for SOC analysts keeps growing. Start with networks and Linux, practice in labs, and follow a certification roadmap.\nDocument your lab work — a practical portfolio matters more than certificates alone.",
    readTime: 6, status: "published",
    metaTitle: `Is Cyber Security a Good Career in India? | ${INSTITUTE}`,
    metaDescription: "Demand, salaries, certifications and SOC entry roadmap.",
  },
];
for (const p of posts) {
  await BlogPost.updateOne(
    { slug: p.slug },
    { $set: { ...p, publishDate: new Date(), coverImage: "" } },
    { upsert: true },
  );
}

await Certificate.updateOne(
  { certificateId: "EPIXX-2026-0001" },
  {
    $set: {
      certificateId: "EPIXX-2026-0001",
      studentName: "Rohit Saini",
      course: courseIds["full-stack-web-development-course"],
      issueDate: new Date(),
      grade: "A",
    },
  },
  { upsert: true },
);

await SiteSettings.updateOne(
  {},
  {
    $set: {
      heroTitle: `Learn job-ready skills in ${CITY}`,
      heroSubtitle: `Practical courses at ${INSTITUTE} with mentors, live projects and placement support.`,
      heroCta: "Book a free demo class",
      brandName: "Epixx AI",
      logoUrl: "/logo.svg",
      stats: [
        { label: "Students trained", value: 12000, suffix: "+" },
        { label: "Hiring partners", value: 150, suffix: "+" },
        { label: "Avg. rating", value: 4.8, suffix: "/5" },
      ],
      partners: ["TCS", "Infosys", "Wipro", "HCLTech", "Zeta", "Local startups"],
      contact: { phone: "+91-9829012345", whatsapp: "919829012345", email: "hello@epixx.ai" },
      branches: [
        { name: `${CITY} Center`, address: `Malviya Nagar, ${CITY}`, mapUrl: "" },
        { name: "Vaishali Center", address: `Vaishali Nagar, ${CITY}`, mapUrl: "" },
      ],
      socials: { youtube: "", instagram: "", linkedin: "", facebook: "" },
      gallery: [
        "https://picsum.photos/seed/epixx-class1/800/600",
        "https://picsum.photos/seed/epixx-class2/800/600",
        "https://picsum.photos/seed/epixx-event1/800/600",
        "https://picsum.photos/seed/epixx-campus1/800/600",
        "https://picsum.photos/seed/epixx-class3/800/600",
        "https://picsum.photos/seed/epixx-event2/800/600",
      ],
    },
  },
  { upsert: true },
);

console.log("Seed done: admin@epixx.ai / Epixx@123");
await mongoose.disconnect();
