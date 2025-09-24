// Build script for production
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Clean dist folder
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true });
}
fs.mkdirSync('dist', { recursive: true });

// Copy static files
const copyDir = (src, dest) => {
  if (!fs.existsSync(src)) return;
  
  fs.mkdirSync(dest, { recursive: true });
  const files = fs.readdirSync(src);
  
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    if (fs.lstatSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
};

// Copy static assets
['images', 'data', 'partials'].forEach(dir => {
  copyDir(dir, `dist/${dir}`);
});

// Copy HTML files
['index.html', 'products.html', 'product.html', 'about.html', 'contact.html', 'manifest.json', 'robots.txt', 'sitemap.xml', 'sw.js'].forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, `dist/${file}`);
  }
});

// Bundle and minify CSS
esbuild.build({
  entryPoints: ['assets/css/style.css'],
  bundle: true,
  minify: true,
  outfile: 'dist/assets/css/style.css',
});

// Bundle and minify JS
esbuild.build({
  entryPoints: ['assets/js/site.js', 'assets/js/header.js', 'assets/js/footer.js'],
  bundle: true,
  minify: true,
  format: 'esm',
  outdir: 'dist/assets/js',
});

console.log('Build complete! Files copied to dist/');