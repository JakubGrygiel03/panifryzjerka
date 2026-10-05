import { defineArrayMember, defineField, defineType } from "sanity";

export const salonSettings = defineType({
  name: "salonSettings",
  title: "Ustawienia salonu",
  type: "document",
  fields: [
    defineField({
      name: "phone",
      title: "Telefon",
      type: "string",
      initialValue: "880-606-454",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "address",
      title: "Adres",
      type: "string",
      initialValue: "ul. Skarpowa 24",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "city",
      title: "Miasto",
      type: "string",
      initialValue: "Gdańsk",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "postalCode",
      title: "Kod pocztowy",
      type: "string",
      initialValue: "80-145",
    }),
    defineField({
      name: "mapsUrl",
      title: "Link do Google Maps",
      type: "url",
    }),
    defineField({
      name: "noticeEnabled",
      title: "Pokaż pasek ogłoszenia / urlopu",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "noticeText",
      title: "Treść paska",
      type: "string",
      description: "Np. Przerwa urlopowa w dniach 10–18.08.",
      hidden: ({ document }) => document?.noticeEnabled !== true,
    }),
    defineField({
      name: "openingHours",
      title: "Godziny otwarcia",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "day", title: "Dzień", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "hours", title: "Godziny", type: "string", validation: (rule) => rule.required() }),
          ],
        }),
      ],
    }),
    defineField({ name: "googleRating", title: "Ocena Google", type: "number" }),
    defineField({ name: "googleReviewCount", title: "Liczba opinii", type: "number" }),
    defineField({ name: "googleReviewsUrl", title: "Link do opinii", type: "url" }),
  ],
});
