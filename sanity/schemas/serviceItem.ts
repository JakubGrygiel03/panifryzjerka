import { defineArrayMember, defineField, defineType } from "sanity";

const hairLengths = [
  { title: "Krótkie", value: "short" },
  { title: "Średnie", value: "medium" },
  { title: "Długie", value: "long" },
  { title: "Bardzo długie", value: "very_long" },
];

export const serviceItem = defineType({
  name: "serviceItem",
  title: "Usługa",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nazwa",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "category",
      title: "Kategoria",
      type: "string",
      options: {
        list: [
          "Koloryzacja & #szycieSiwizny",
          "Strzyżenie & Modelowanie",
          "Afroloki",
          "Pielęgnacja",
          "Paznokcie & Rzęsy",
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "highlight",
      title: "Wyróżnij (#szycieSiwizny)",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "bookingGroupId",
      title: "Identyfikator grupy w rezerwacji",
      type: "string",
      description: "Zostaw identyfikator z katalogu silnika, np. szycie-siwizny.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "staffIds",
      title: "Identyfikatory stylistek",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      description: "UUID stylistek z Supabase, które wykonują tę usługę.",
    }),
    defineField({
      name: "variants",
      title: "Warianty długości i ceny",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "hairLength",
              title: "Długość włosów",
              type: "string",
              options: { list: hairLengths },
            }),
            defineField({
              name: "label",
              title: "Etykieta",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "durationMinutes",
              title: "Czas trwania (min)",
              type: "number",
              validation: (rule) => rule.required().min(5).max(720),
            }),
            defineField({
              name: "priceCents",
              title: "Cena (grosze)",
              type: "number",
              validation: (rule) => rule.required().min(0),
            }),
            defineField({
              name: "bufferMinutes",
              title: "Bufor sanitarny (min)",
              type: "number",
              initialValue: 15,
              validation: (rule) => rule.required().min(0).max(180),
            }),
            defineField({
              name: "bookingServiceId",
              title: "UUID wariantu w Supabase",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "durationMinutes" },
            prepare({ title, subtitle }) {
              return { title, subtitle: subtitle ? `${subtitle} min` : "" };
            },
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "category" },
  },
});
