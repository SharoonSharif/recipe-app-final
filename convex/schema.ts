import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  recipes: defineTable({
    name: v.string(),
    ingredients: v.array(v.string()),
    instructions: v.string(),
    prepTime: v.number(), // in minutes
    category: v.string(),
    userId: v.string(), // we'll use this later for authentication
    createdAt: v.number(), // timestamp
  })
    .index("by_user", ["userId"])
    .index("by_category", ["category"]),
});
