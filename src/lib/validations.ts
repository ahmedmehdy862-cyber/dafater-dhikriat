import { z } from "zod";

export const memorySchema = z.object({
  name: z
    .string()
    .min(2, "الاسم لازم يكون حرفين على الأقل")
    .max(100, "الاسم طويل أوي"),
  university: z.string().max(200, "اسم الجامعة طويل").optional().or(z.literal("")),
  message: z
    .string()
    .min(10, "الرسالة لازم يكون فيها 10 أحرف على الأقل")
    .max(500, "الرسالة مش ممكن تتجاوز 500 حرف"),
  consent_to_publish: z.boolean().refine((val) => val === true, {
    message: "لازم توافق على عرض رسالتك",
  }),
});

export type MemoryInput = z.infer<typeof memorySchema>;

export const loginSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صحيح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const statusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "hidden"]),
});

export type StatusUpdate = z.infer<typeof statusSchema>;
