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
};