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
    servings: v.optional(v.number()), // number of servings this recipe makes
    // NEW FIELDS FOR FAVORITES/RATINGS
    rating: v.optional(v.number()), // 1-5 stars (personal rating)
    isFavorite: v.optional(v.boolean()), // true if marked as favorite
    userId: v.string(),
    createdAt: v.number(), // timestamp
  })
    .index("by_user", ["userId"])
    .index("by_category", ["category"])
    .index("by_favorite", ["userId", "isFavorite"]) // NEW INDEX for filtering favorites
    .index("by_rating", ["userId", "rating"]), // NEW INDEX for sorting by rating
});