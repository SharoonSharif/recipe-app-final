import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all recipes for a user
export const getRecipes = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("recipes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Create a new recipe
export const createRecipe = mutation({
  args: {
    name: v.string(),
    ingredients: v.array(v.string()),
    instructions: v.string(),
    prepTime: v.number(),
    category: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("recipes", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Delete a recipe
export const deleteRecipe = mutation({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});
