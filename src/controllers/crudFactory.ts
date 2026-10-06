import type { Request, Response } from "express";
import type { Model } from "mongoose";
import { asyncHandler, ok } from "../utils/asyncHandler.js";
import { logActivity } from "../utils/activity.js";

interface CrudOptions {
  slugField?: string; // e.g. "slug" enables GET /slug/:slug
  searchFields?: string[];
  defaultSort?: string;
  populate?: string | string[];
  resource?: string; // label used in the activity log
  extraFilters?: string[]; // exact-match query params, e.g. ["course","status"]
}

// Generic list-paginate-filter-sort + getById/getBySlug + create/update/delete.
// Keeps Course/Trainer/BlogPost/Testimonial controllers thin by configuration.
export function crudFactory<T>(model: Model<T>, opts: CrudOptions = {}) {
  const list = asyncHandler(async (req: Request, res: Response) => {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 12)));
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const filter: Record<string, unknown> = { ...(req.query.filter as object ?? {}) };

    if (typeof req.query.status === "string") filter.status = req.query.status;
    if (typeof req.query.category === "string") filter.category = req.query.category;
    for (const k of opts.extraFilters ?? []) {
      if (typeof req.query[k] === "string" && req.query[k] !== "") filter[k] = req.query[k];
    }
    if (opts.searchFields && q) {
      filter.$or = opts.searchFields.map((f) => ({ [f]: { $regex: q, $options: "i" } }));
    }
    const sort = typeof req.query.sort === "string" ? req.query.sort : (opts.defaultSort ?? "-createdAt");
    const [items, total] = await Promise.all([
      model
        .find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate(opts.populate as never)
        .lean(),
      model.countDocuments(filter),
    ]);
    ok(res, { items, total, page, pages: Math.ceil(total / limit) }, "List fetched");
  });

  const getById = asyncHandler(async (req: Request, res: Response) => {
    const doc = await model.findById(req.params.id).populate(opts.populate as never).lean();
    if (!doc) { res.status(404).json({ success: false, data: null, message: "Not found" }); return; }
    ok(res, doc, "Fetched");
  });

  const getBySlug = asyncHandler(async (req: Request, res: Response) => {
    if (!opts.slugField) { res.status(404).json({ success: false, data: null, message: "No slug route" }); return; }
    const doc = await model
      .findOne({ [opts.slugField]: req.params.slug })
      .populate(opts.populate as never)
      .lean();
    if (!doc) { res.status(404).json({ success: false, data: null, message: "Not found" }); return; }
    ok(res, doc, "Fetched");
  });

  const create = asyncHandler(async (req: Request, res: Response) => {
    const doc = await model.create(req.body);
    if (opts.resource) logActivity(req, "Created", opts.resource, doc as never);
    ok(res, doc, "Created", 201);
  });

  const update = asyncHandler(async (req: Request, res: Response) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) { res.status(404).json({ success: false, data: null, message: "Not found" }); return; }
    if (opts.resource) logActivity(req, "Updated", opts.resource, doc as never);
    ok(res, doc, "Updated");
  });

  const remove = asyncHandler(async (req: Request, res: Response) => {
    const doc = await model.findByIdAndDelete(req.params.id);
    if (!doc) { res.status(404).json({ success: false, data: null, message: "Not found" }); return; }
    if (opts.resource) logActivity(req, "Deleted", opts.resource, doc as never);
    ok(res, null, "Deleted");
  });

  return { list, getById, getBySlug, create, update, remove };
}
