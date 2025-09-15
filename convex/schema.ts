import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  recipes: defineTable({
    name: v.string(),
    ingredients: v.array(v.object({
      name: v.string(),
      amount: v.string(), // "2", "1/2", "1.5"
      unit: v.string(),   // "cups", "tbsp", "lbs", "pieces"
    })),
    instructions: v.string(),
    prepTime: v.number(), // in minutes
    category: v.string(),
    userId: v.string(),
    createdAt: v.number(), // timestamp
  })
    .index("by_user", ["userId"])
    .index("by_category", ["category"]),
});
