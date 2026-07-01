import {
  reactRouter
} from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import {
  defineConfig
} from "vite";

export default defineConfig({
  optimizeDeps: {
    include: [
      "@mt-kit/request-axios",
      "@mt-kit/utils"
    ]
  },
  plugins: [
    tailwindcss(),
    reactRouter()
  ],
  resolve: {
    tsconfigPaths: true
  },
  ssr: {
    noExternal: [
      "@mt-kit/request-axios",
      "@mt-kit/utils"
    ]
  }
});
