import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      "src/components/diagnostic/RecommendationPanel.tsx",
      "src/components/ui/DecisionSpine.tsx",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXAttribute[name.name='className'] Literal[value=/\\b(?:text|bg|border)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|pink)-\\d{2,3}(?:\\/\\d+)?\\b/]",
          message:
            "Use semantic color tokens (status-*, text-intent-*, axis-*, panel-*, cta-primary) instead of direct color utilities.",
        },
        {
          selector:
            "JSXAttribute[name.name='className'] TemplateLiteral > TemplateElement[value.raw=/\\b(?:text|bg|border)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|pink)-\\d{2,3}(?:\\/\\d+)?\\b/]",
          message:
            "Use semantic color tokens (status-*, text-intent-*, axis-*, panel-*, cta-primary) instead of direct color utilities.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
