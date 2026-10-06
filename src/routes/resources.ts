import { Router } from "express";
import { courseSchema, batchSchema, testimonialSchema, blogPostSchema } from "../shared/index.js";
import { Course } from "../models/Course.js";
import { Trainer } from "../models/Trainer.js";
import { Batch } from "../models/Batch.js";
import { Testimonial } from "../models/Testimonial.js";
import { BlogPost } from "../models/BlogPost.js";
import { Certificate } from "../models/Certificate.js";
import { SiteSettings } from "../models/SiteSettings.js";
import { crudFactory } from "../controllers/crudFactory.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler, ok } from "../utils/asyncHandler.js";

const editor = requireRole("SuperAdmin", "ContentManager");

function resource<T>(router: Router, path: string, factory: ReturnType<typeof crudFactory<T>>, schema?: Parameters<typeof validate>[0]) {
  router.get(`/${path}`, factory.list);
  if (factory.getBySlug) router.get(`/${path}/slug/:slug`, factory.getBySlug);
  router.get(`/${path}/:id`, factory.getById);
  if (schema) {
    router.post(`/${path}`, requireAuth, editor, validate(schema), factory.create);
    router.patch(`/${path}/:id`, requireAuth, editor, factory.update);
    router.delete(`/${path}/:id`, requireAuth, editor, factory.remove);
  } else {
    router.post(`/${path}`, requireAuth, editor, factory.create);
    router.patch(`/${path}/:id`, requireAuth, editor, factory.update);
    router.delete(`/${path}/:id`, requireAuth, editor, factory.remove);
  }
}

export const apiRouter = Router();

resource(apiRouter, "courses", crudFactory(Course, { slugField: "slug", searchFields: ["title", "category"], defaultSort: "order", populate: "trainer", resource: "Course" }), courseSchema);
resource(apiRouter, "trainers", crudFactory(Trainer, { slugField: "slug", searchFields: ["name", "expertise"], resource: "Trainer" }));
resource(apiRouter, "batches", crudFactory(Batch, { defaultSort: "startDate", populate: ["course", "trainer"], resource: "Batch", extraFilters: ["course", "status"] }), batchSchema);
resource(apiRouter, "testimonials", crudFactory(Testimonial, { defaultSort: "-createdAt", populate: "course", resource: "Testimonial", extraFilters: ["approved", "featured"] }), testimonialSchema);
resource(apiRouter, "posts", crudFactory(BlogPost, { slugField: "slug", searchFields: ["title", "category", "tags"], resource: "BlogPost" }), blogPostSchema);

// Certificates: public verify by ID, admin CRUD.
const certCrud = crudFactory(Certificate, { defaultSort: "-issueDate", populate: "course", resource: "Certificate" });
apiRouter.get("/certificates/verify/:certificateId", asyncHandler(async (req, res) => {
  const doc = await Certificate.findOne({ certificateId: req.params.certificateId }).populate("course").lean();
  if (!doc) { res.status(404).json({ success: false, data: null, message: "Certificate not found" }); return; }
  ok(res, doc, "Certificate verified");
}));
apiRouter.get("/certificates", requireAuth, certCrud.list);
apiRouter.post("/certificates", requireAuth, editor, certCrud.create);
apiRouter.patch("/certificates/:id", requireAuth, editor, certCrud.update);
apiRouter.delete("/certificates/:id", requireAuth, editor, certCrud.remove);

// Site settings singleton.
apiRouter.get("/settings", asyncHandler(async (_req, res) => {
  const doc = await SiteSettings.findOne().lean();
  ok(res, doc, "Settings fetched");
}));
apiRouter.put("/settings", requireAuth, editor, asyncHandler(async (req, res) => {
  const doc = await SiteSettings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
  ok(res, doc, "Settings saved");
}));
