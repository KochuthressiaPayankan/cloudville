/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

module.exports = {
  output: "export",                       // static site, built into ./out
  basePath: isProd ? "/cloudville" : "",  // GitHub Pages serves the site at /cloudville/
  assetPrefix: isProd ? "/cloudville/" : "",
  images: { unoptimized: true },
};
