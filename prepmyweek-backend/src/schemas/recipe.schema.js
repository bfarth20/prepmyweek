import { z } from "zod";

const validCourses = ["BREAKFAST", "LUNCH", "DINNER", "SNACK_SIDE"];

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
    .number({
      required_error: "Prep time is required and can be zero",
      invalid_type_error: "Prep time must be a number",
    })
    .min(0, "Prep time cannot be negative"),

  cookTime: z
    .number({
      required_error: "Cook time is required and can be zero",
      invalid_type_error: "Cook time must be a number",
    })
    .min(0, "Cook time cannot be negative"),
  servings: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === null || val === undefined || val === "") return undefined;
      return Number(val);
    })
    .superRefine((val, ctx) => {
      if (val === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Servings is a required field",
        });
        return;
      }
      if (typeof val !== "number" || isNaN(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Servings must be a number",
        });
        return;
      }
      if (val <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Servings must be a positive number",
        });
      }
    }),
  course: z
    .preprocess(
      (val) => {
        if (val === undefined || val === null || val === "") {
          return undefined; // trigger required error later
        }
        return val;
      },
      z.enum(validCourses, {
        errorMap: () => ({
          message: `Course must be one of: ${validCourses.join(", ")}`,
        }),
      })
    )
    .refine((val) => val !== undefined, {
      message: "Course is a required field",
    }),
  storeIds: z.array(z.number().int()).optional(),
  ingredients: z
    .array(ingredientSchema, {
      required_error: "Ingredients are required",
    })
    .optional(),
  imageUrl: z.string().optional(),
  isVegetarian: z.boolean().optional(),
});
