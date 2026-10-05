import { defineArrayMember, defineField, defineType } from "sanity";

export const teamMember = defineType({
  name: "teamMember",
  title: "Osoba w zespole",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Imię", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "role", title: "Rola", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "bio", title: "Krótki opis", type: "text", rows: 3 }),
    defineField({
      name: "specialties",
      title: "Specjalizacje",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({ name: "photo", title: "Zdjęcie", type: "image", options: { hotspot: true } }),
    defineField({ name: "order", title: "Kolejność", type: "number", initialValue: 0 }),
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "photo" },
  },
});
