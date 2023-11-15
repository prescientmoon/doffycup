import * as esbuild from "esbuild";
import { htmlPlugin } from "@craftamap/esbuild-plugin-html";
import * as fs from "fs";

const serve = process.env.ESBUILD_SERVE === "1";
const baseurl = process.env.ESBUILD_BASEURL || "";

console.log(`Building with baseurl ${baseurl}`);

const entryPoints = ["src/main.tsx"];

const ctx = await esbuild.context({
  entryPoints,
  minify: !serve,
  bundle: true,
  metafile: true,
  sourcemap: true,
  outdir: "dist",
  format: "esm",
  target: ["es2020"],
  assetNames: "assets/[name]",
  loader: { ".png": "file" },
  define: {
    "process.env.BASEURL": JSON.stringify(baseurl),
  },
  plugins: [
    htmlPlugin({
      files: [
        {
          entryPoints,
          filename: "index.html",
          favicon: "src/favicon.ico",
          htmlTemplate: "src/index.html",
          scriptLoading: "module",
        },
      ],
    }),
  ],
  publicPath: baseurl,
});

if (serve) {
  const { port, host } = await ctx.serve({ servedir: "dist" });
  console.log(`Serving on ${host}:${port}`);
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log(`Project bundled successfully`);
}
