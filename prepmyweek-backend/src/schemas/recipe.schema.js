import { z } from "zod";

const validCourses = ["BREAKFAST", "LUNCH", "DINNER"];

const ingredientSchema = z.object({
  name: z.string().min(2, "Ingredient name must be at least 2 characters"),
  quantity: z.number().positive("Quantity must be a positive number"),
  unit: z.string().optional(),
  storeSection: z.string().optional(),
  isOptional: z.boolean().optional(),
  preparation: z.string().nullable().optional(),
});

export const createRecipeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z
    .string()
    .max(1000, "Description must be under 1000 characters")
    .optional(),
  instructions: z.string().min(5, "Instructions must be at least 5 characters"),
  prepTime: z
    .number()
    .min(0, "Prep time must be a non-negative number")
    .optional(),
  cookTime: z
    .number()
    .min(0, "Cook time must be a non-negative number")
    .optional(),
  servings: z
    .number()
    .positive("Servings must be a positive number")
    .optional(),
  course: z
    .enum(validCourses, {
      errorMap: () => ({
        message: `Course must be one of: ${validCourses.join(", ")}`,
      }),
    })
    .optional(),
  storeIds: z.array(z.number().int()).optional(),
  ingredients: z
    .array(ingredientSchema, {
      required_error: "Ingredients are required",
    })
    .optional(),
  imageUrl: z.string().optional(),
});
