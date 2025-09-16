import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all recipes for a user with optional filtering
export const getRecipes = query({
  args: { 
    userId: v.string(),
    favoritesOnly: v.optional(v.boolean()),
    sortBy: v.optional(v.string()) // "rating", "name", "newest"
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("recipes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    // Filter by favorites if requested
    if (args.favoritesOnly) {
      query = ctx.db
        .query("recipes")
        .withIndex("by_favorite", (q) => 
          q.eq("userId", args.userId).eq("isFavorite", true)
        );
    }

    let recipes = await query.collect();

    // Sort recipes based on sortBy parameter
    if (args.sortBy === "rating") {
      recipes.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (args.sortBy === "name") {
      recipes.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Default: sort by newest first
      recipes.sort((a, b) => b.createdAt - a.createdAt);
    }

    return recipes;
  },
});

// Get a single recipe by ID (for sharing) - NO PRIVACY CHECK
export const getPublicRecipe = query({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    const recipe = await ctx.db.get(args.id);
    
    // Return recipe if it exists (no privacy check)
    if (!recipe) {
      return null;
    }
    
    return recipe;
  },
});

// Create a new recipe
export const createRecipe = mutation({
  args: {
    name: v.string(),
    ingredients: v.array(v.object({
      name: v.string(),
      amount: v.string(),
      unit: v.string(),
    })),
    instructions: v.string(),
    prepTime: v.number(),
    category: v.string(),
    servings: v.optional(v.number()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("recipes", {
      ...args,
      createdAt: Date.now(),
      rating: undefined,
      isFavorite: false,
    });
  },
});

// Update an existing recipe
export const updateRecipe = mutation({
  args: {
    id: v.id("recipes"),
    name: v.string(),
    ingredients: v.array(v.object({
      name: v.string(),
      amount: v.string(),
      unit: v.string(),
    })),
    instructions: v.string(),
    prepTime: v.number(),
    category: v.string(),
    servings: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    return await ctx.db.patch(id, updateData);
  },
});

// Update recipe rating
export const updateRecipeRating = mutation({
  args: {
    id: v.id("recipes"),
    rating: v.optional(v.number()) // 1-5 or undefined to remove rating
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, { rating: args.rating });
  },
});

// Toggle recipe favorite status
export const toggleRecipeFavorite = mutation({
  args: {
    id: v.id("recipes"),
    isFavorite: v.boolean()
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, { isFavorite: args.isFavorite });
  },
});

// Delete a recipe
export const deleteRecipe = mutation({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});
