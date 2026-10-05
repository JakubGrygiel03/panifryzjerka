import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemas";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "panifryzjerka";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  name: "panifryzjerka",
  title: "PaniFryzjerka",
  projectId,
  dataset,
  basePath: "/admin",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("PaniFryzjerka")
          .items([
            S.listItem()
              .title("Ustawienia salonu")
              .child(S.document().schemaType("salonSettings").documentId("salonSettings")),
            S.documentTypeListItem("serviceItem").title("Cennik"),
            S.documentTypeListItem("transformation").title("Metamorfozy"),
            S.documentTypeListItem("teamMember").title("Zespół"),
          ]),
    }),
  ],
  schema: { types: schemaTypes },
});
