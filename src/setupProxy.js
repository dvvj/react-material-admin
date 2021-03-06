const proxy = require("http-proxy-middleware");

module.exports = function(app) {
  app.use(
    "/api",
    proxy({
      target: "https://localhost:20443",
      changeOrigin: true,
      secure: false
    })
  );
  app.use(
    "/product",
    proxy({
      target: "https://localhost:20443",
      changeOrigin: true,
      secure: false
    })
  );
  app.use(
    "/proforg",
    proxy({
      target: "https://localhost:20443",
      changeOrigin: true,
      secure: false
    })
  );
  app.use(
    "/admin",
    proxy({
      target: "https://localhost:20443",
      changeOrigin: true,
      secure: false
    })
  );

};