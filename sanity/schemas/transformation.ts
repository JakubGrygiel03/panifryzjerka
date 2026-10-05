import { defineField, defineType } from "sanity";

export const transformation = defineType({
  name: "transformation",
  title: "Metamorfoza",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "before",
      title: "Zdjęcie przed",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "after",
      title: "Zdjęcie po",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Kategoria",
      type: "string",
      options: {
        list: ["#szycieSiwizny", "Koloryzacja", "Strzyżenie", "Afroloki", "Paznokcie", "Rzęsy"],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tag",
      title: "Tag",
      type: "string",
      description: "Krótki podpis, np. #szycieSiwizny.",
      validation: (rule) => rule.required().max(40),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "tag", media: "after" },
  },
});
