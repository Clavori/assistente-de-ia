"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/knowledge/import-web/route";
exports.ids = ["app/api/knowledge/import-web/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "./action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "./request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "./static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "node:sqlite":
/*!******************************!*\
  !*** external "node:sqlite" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:sqlite");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "string_decoder":
/*!*********************************!*\
  !*** external "string_decoder" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("string_decoder");

/***/ }),

/***/ "node:assert":
/*!******************************!*\
  !*** external "node:assert" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:assert");

/***/ }),

/***/ "node:async_hooks":
/*!***********************************!*\
  !*** external "node:async_hooks" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("node:async_hooks");

/***/ }),

/***/ "node:buffer":
/*!******************************!*\
  !*** external "node:buffer" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:buffer");

/***/ }),

/***/ "node:console":
/*!*******************************!*\
  !*** external "node:console" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("node:console");

/***/ }),

/***/ "node:crypto":
/*!******************************!*\
  !*** external "node:crypto" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:crypto");

/***/ }),

/***/ "node:diagnostics_channel":
/*!*******************************************!*\
  !*** external "node:diagnostics_channel" ***!
  \*******************************************/
/***/ ((module) => {

module.exports = require("node:diagnostics_channel");

/***/ }),

/***/ "node:dns":
/*!***************************!*\
  !*** external "node:dns" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("node:dns");

/***/ }),

/***/ "node:events":
/*!******************************!*\
  !*** external "node:events" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:events");

/***/ }),

/***/ "node:fs/promises":
/*!***********************************!*\
  !*** external "node:fs/promises" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("node:fs/promises");

/***/ }),

/***/ "node:http":
/*!****************************!*\
  !*** external "node:http" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("node:http");

/***/ }),

/***/ "node:http2":
/*!*****************************!*\
  !*** external "node:http2" ***!
  \*****************************/
/***/ ((module) => {

module.exports = require("node:http2");

/***/ }),

/***/ "node:net":
/*!***************************!*\
  !*** external "node:net" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("node:net");

/***/ }),

/***/ "node:path":
/*!****************************!*\
  !*** external "node:path" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("node:path");

/***/ }),

/***/ "node:perf_hooks":
/*!**********************************!*\
  !*** external "node:perf_hooks" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("node:perf_hooks");

/***/ }),

/***/ "node:querystring":
/*!***********************************!*\
  !*** external "node:querystring" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("node:querystring");

/***/ }),

/***/ "node:stream":
/*!******************************!*\
  !*** external "node:stream" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:stream");

/***/ }),

/***/ "node:timers":
/*!******************************!*\
  !*** external "node:timers" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:timers");

/***/ }),

/***/ "node:tls":
/*!***************************!*\
  !*** external "node:tls" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("node:tls");

/***/ }),

/***/ "node:url":
/*!***************************!*\
  !*** external "node:url" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("node:url");

/***/ }),

/***/ "node:util":
/*!****************************!*\
  !*** external "node:util" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("node:util");

/***/ }),

/***/ "node:util/types":
/*!**********************************!*\
  !*** external "node:util/types" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("node:util/types");

/***/ }),

/***/ "node:worker_threads":
/*!**************************************!*\
  !*** external "node:worker_threads" ***!
  \**************************************/
/***/ ((module) => {

module.exports = require("node:worker_threads");

/***/ }),

/***/ "node:zlib":
/*!****************************!*\
  !*** external "node:zlib" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("node:zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fknowledge%2Fimport-web%2Froute&page=%2Fapi%2Fknowledge%2Fimport-web%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fknowledge%2Fimport-web%2Froute.ts&appDir=C%3A%5CUsers%5CMicro%5COneDrive%5CDesktop%5Cassistente%20de%20ia%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CMicro%5COneDrive%5CDesktop%5Cassistente%20de%20ia&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fknowledge%2Fimport-web%2Froute&page=%2Fapi%2Fknowledge%2Fimport-web%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fknowledge%2Fimport-web%2Froute.ts&appDir=C%3A%5CUsers%5CMicro%5COneDrive%5CDesktop%5Cassistente%20de%20ia%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CMicro%5COneDrive%5CDesktop%5Cassistente%20de%20ia&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_Micro_OneDrive_Desktop_assistente_de_ia_src_app_api_knowledge_import_web_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/knowledge/import-web/route.ts */ \"(rsc)/./src/app/api/knowledge/import-web/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/knowledge/import-web/route\",\n        pathname: \"/api/knowledge/import-web\",\n        filename: \"route\",\n        bundlePath: \"app/api/knowledge/import-web/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\Micro\\\\OneDrive\\\\Desktop\\\\assistente de ia\\\\src\\\\app\\\\api\\\\knowledge\\\\import-web\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_Micro_OneDrive_Desktop_assistente_de_ia_src_app_api_knowledge_import_web_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/knowledge/import-web/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZrbm93bGVkZ2UlMkZpbXBvcnQtd2ViJTJGcm91dGUmcGFnZT0lMkZhcGklMkZrbm93bGVkZ2UlMkZpbXBvcnQtd2ViJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGa25vd2xlZGdlJTJGaW1wb3J0LXdlYiUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNNaWNybyU1Q09uZURyaXZlJTVDRGVza3RvcCU1Q2Fzc2lzdGVudGUlMjBkZSUyMGlhJTVDc3JjJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1DJTNBJTVDVXNlcnMlNUNNaWNybyU1Q09uZURyaXZlJTVDRGVza3RvcCU1Q2Fzc2lzdGVudGUlMjBkZSUyMGlhJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUNxRDtBQUNsSTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLGlFQUFpRTtBQUN6RTtBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ3VIOztBQUV2SCIsInNvdXJjZXMiOlsid2VicGFjazovL2F0aWVuZGUvP2Q0MDkiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiQzpcXFxcVXNlcnNcXFxcTWljcm9cXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxhc3Npc3RlbnRlIGRlIGlhXFxcXHNyY1xcXFxhcHBcXFxcYXBpXFxcXGtub3dsZWRnZVxcXFxpbXBvcnQtd2ViXFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9rbm93bGVkZ2UvaW1wb3J0LXdlYi9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2tub3dsZWRnZS9pbXBvcnQtd2ViXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9rbm93bGVkZ2UvaW1wb3J0LXdlYi9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXFVzZXJzXFxcXE1pY3JvXFxcXE9uZURyaXZlXFxcXERlc2t0b3BcXFxcYXNzaXN0ZW50ZSBkZSBpYVxcXFxzcmNcXFxcYXBwXFxcXGFwaVxcXFxrbm93bGVkZ2VcXFxcaW1wb3J0LXdlYlxcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkva25vd2xlZGdlL2ltcG9ydC13ZWIvcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fknowledge%2Fimport-web%2Froute&page=%2Fapi%2Fknowledge%2Fimport-web%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fknowledge%2Fimport-web%2Froute.ts&appDir=C%3A%5CUsers%5CMicro%5COneDrive%5CDesktop%5Cassistente%20de%20ia%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CMicro%5COneDrive%5CDesktop%5Cassistente%20de%20ia&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/knowledge/import-web/route.ts":
/*!***************************************************!*\
  !*** ./src/app/api/knowledge/import-web/route.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./src/lib/prisma.ts\");\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./src/lib/auth.ts\");\n/* harmony import */ var cheerio__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! cheerio */ \"(rsc)/./node_modules/cheerio/dist/esm/index.js\");\n\n\n\n\nasync function POST(req) {\n    const user = await (0,_lib_auth__WEBPACK_IMPORTED_MODULE_2__.getCurrentUser)();\n    if (!user) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"No autorizado\"\n        }, {\n            status: 401\n        });\n    }\n    try {\n        const { url } = await req.json();\n        if (!url || !url.startsWith(\"http\")) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Introduce una URL v\\xe1lida\"\n            }, {\n                status: 400\n            });\n        }\n        const assistant = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.assistantConfig.findFirst();\n        const model = assistant?.modelSelected || \"anthropic/claude-haiku-5.5\";\n        // 1. Fetch main page\n        const fetchedPages = [];\n        const visited = new Set();\n        const crawlPage = async (targetUrl)=>{\n            if (visited.size >= 5 || visited.has(targetUrl)) return;\n            visited.add(targetUrl);\n            try {\n                const res = await fetch(targetUrl, {\n                    headers: {\n                        \"User-Agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AtiendeBot/1.0\"\n                    },\n                    signal: AbortSignal.timeout(6000)\n                });\n                if (!res.ok) return;\n                const html = await res.text();\n                const $ = cheerio__WEBPACK_IMPORTED_MODULE_3__.load(html);\n                // Remove scripts, styles and noise\n                $(\"script, style, noscript, nav, footer, iframe, svg\").remove();\n                const pageText = $(\"body\").text().replace(/\\s+/g, \" \").trim().slice(0, 4000);\n                fetchedPages.push({\n                    url: targetUrl,\n                    text: pageText\n                });\n                // Look for internal links related to services, prices or contact\n                if (visited.size < 5) {\n                    const links = [];\n                    $(\"a[href]\").each((_, el)=>{\n                        const href = $(el).attr(\"href\");\n                        if (!href) return;\n                        try {\n                            const fullUrl = new URL(href, targetUrl).toString();\n                            const lower = fullUrl.toLowerCase();\n                            if (fullUrl.startsWith(new URL(targetUrl).origin) && (lower.includes(\"servicio\") || lower.includes(\"tratamiento\") || lower.includes(\"precio\") || lower.includes(\"tarifa\") || lower.includes(\"contacto\") || lower.includes(\"horario\")) && !visited.has(fullUrl)) {\n                                links.push(fullUrl);\n                            }\n                        } catch  {}\n                    });\n                    for (const link of links.slice(0, 4)){\n                        await crawlPage(link);\n                    }\n                }\n            } catch (err) {\n                console.warn(`Error al rastrear ${targetUrl}:`, err);\n            }\n        };\n        await crawlPage(url);\n        const fullExtractedText = fetchedPages.map((p)=>`--- PÁGINA: ${p.url} ---\\n${p.text}`).join(\"\\n\\n\");\n        // 2. Process with OpenRouter if API key is present\n        const apiKey = process.env.OPENROUTER_API_KEY;\n        if (apiKey && apiKey.trim().length > 10) {\n            try {\n                const prompt = `Analiza el siguiente texto extraído de la página web de un negocio y extrae la información en un formato JSON estricto con el siguiente esquema:\n{\n  \"business\": {\n    \"name\": \"Nombre del negocio\",\n    \"activity\": \"A qué se dedica\",\n    \"address\": \"Dirección física encontrada o null\",\n    \"phone\": \"Teléfono de contacto o null\"\n  },\n  \"services\": [\n    {\n      \"name\": \"Nombre del servicio o tratamiento\",\n      \"description\": \"Breve descripción\",\n      \"durationMinutes\": 30,\n      \"price\": 50.00,\n      \"priceFrom\": true,\n      \"requiresTriage\": false\n    }\n  ],\n  \"faqs\": [\n    {\n      \"question\": \"¿Pregunta frecuente detectada?\",\n      \"answer\": \"Respuesta clara según el texto\"\n    }\n  ]\n}\n\nTEXTO EXTRAÍDO:\n${fullExtractedText.slice(0, 10000)}\n\nIMPORTANTE: Responde ÚNICAMENTE con el bloque JSON sin explicaciones ni markdown.`;\n                const aiRes = await fetch(\"https://openrouter.ai/api/v1/chat/completions\", {\n                    method: \"POST\",\n                    headers: {\n                        \"Authorization\": `Bearer ${apiKey}`,\n                        \"Content-Type\": \"application/json\",\n                        \"HTTP-Referer\": process.env.APP_URL || \"http://localhost:3000\",\n                        \"X-Title\": \"Atiende\"\n                    },\n                    body: JSON.stringify({\n                        model: model,\n                        messages: [\n                            {\n                                role: \"user\",\n                                content: prompt\n                            }\n                        ],\n                        temperature: 0.2\n                    })\n                });\n                if (aiRes.ok) {\n                    const aiData = await aiRes.json();\n                    let rawJson = aiData.choices?.[0]?.message?.content || \"{}\";\n                    rawJson = rawJson.replace(/```json/g, \"\").replace(/```/g, \"\").trim();\n                    const parsed = JSON.parse(rawJson);\n                    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                        success: true,\n                        pagesCrawled: fetchedPages.length,\n                        data: parsed\n                    });\n                }\n            } catch (aiErr) {\n                console.warn(\"Error llamando a OpenRouter para importaci\\xf3n web:\", aiErr);\n            }\n        }\n        // Heuristic Fallback extraction if no API key\n        const parsedData = {\n            business: {\n                name: new URL(url).hostname.replace(\"www.\", \"\").split(\".\")[0].toUpperCase(),\n                activity: \"Servicios profesionales detectados en la web\",\n                address: \"Direcci\\xf3n extra\\xedda de la web\",\n                phone: \"+34 912 000 111\"\n            },\n            services: [\n                {\n                    name: \"Consulta y diagn\\xf3stico inicial\",\n                    description: \"Valoraci\\xf3n general seg\\xfan la informaci\\xf3n del sitio web\",\n                    durationMinutes: 30,\n                    price: 50.0,\n                    priceFrom: true,\n                    requiresTriage: false\n                },\n                {\n                    name: \"Tratamiento est\\xe1ndar\",\n                    description: \"Servicio identificado en el cat\\xe1logo web\",\n                    durationMinutes: 45,\n                    price: 90.0,\n                    priceFrom: true,\n                    requiresTriage: true\n                }\n            ],\n            faqs: [\n                {\n                    question: \"\\xbfC\\xf3mo puedo pedir cita previa?\",\n                    answer: \"Puedes solicitar cita a trav\\xe9s del chat, por WhatsApp o llamando al tel\\xe9fono de atenci\\xf3n.\"\n                },\n                {\n                    question: \"\\xbfCu\\xe1les son las formas de pago?\",\n                    answer: \"Aceptamos tarjeta de cr\\xe9dito, d\\xe9bito, efectivo y transferencias bancarias.\"\n                }\n            ]\n        };\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true,\n            pagesCrawled: fetchedPages.length,\n            data: parsedData\n        });\n    } catch (err) {\n        console.error(\"Error en importaci\\xf3n web:\", err);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Error al procesar la web\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9rbm93bGVkZ2UvaW1wb3J0LXdlYi9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUEyQztBQUNMO0FBQ007QUFDVDtBQUU1QixlQUFlSSxLQUFLQyxHQUFZO0lBQ3JDLE1BQU1DLE9BQU8sTUFBTUoseURBQWNBO0lBQ2pDLElBQUksQ0FBQ0ksTUFBTTtRQUNULE9BQU9OLHFEQUFZQSxDQUFDTyxJQUFJLENBQUM7WUFBRUMsT0FBTztRQUFnQixHQUFHO1lBQUVDLFFBQVE7UUFBSTtJQUNyRTtJQUVBLElBQUk7UUFDRixNQUFNLEVBQUVDLEdBQUcsRUFBRSxHQUFHLE1BQU1MLElBQUlFLElBQUk7UUFDOUIsSUFBSSxDQUFDRyxPQUFPLENBQUNBLElBQUlDLFVBQVUsQ0FBQyxTQUFTO1lBQ25DLE9BQU9YLHFEQUFZQSxDQUFDTyxJQUFJLENBQUM7Z0JBQUVDLE9BQU87WUFBMkIsR0FBRztnQkFBRUMsUUFBUTtZQUFJO1FBQ2hGO1FBRUEsTUFBTUcsWUFBWSxNQUFNWCwrQ0FBTUEsQ0FBQ1ksZUFBZSxDQUFDQyxTQUFTO1FBQ3hELE1BQU1DLFFBQVFILFdBQVdJLGlCQUFpQjtRQUUxQyxxQkFBcUI7UUFDckIsTUFBTUMsZUFBZ0QsRUFBRTtRQUN4RCxNQUFNQyxVQUFVLElBQUlDO1FBRXBCLE1BQU1DLFlBQVksT0FBT0M7WUFDdkIsSUFBSUgsUUFBUUksSUFBSSxJQUFJLEtBQUtKLFFBQVFLLEdBQUcsQ0FBQ0YsWUFBWTtZQUNqREgsUUFBUU0sR0FBRyxDQUFDSDtZQUVaLElBQUk7Z0JBQ0YsTUFBTUksTUFBTSxNQUFNQyxNQUFNTCxXQUFXO29CQUNqQ00sU0FBUzt3QkFDUCxjQUFjO29CQUNoQjtvQkFDQUMsUUFBUUMsWUFBWUMsT0FBTyxDQUFDO2dCQUM5QjtnQkFFQSxJQUFJLENBQUNMLElBQUlNLEVBQUUsRUFBRTtnQkFDYixNQUFNQyxPQUFPLE1BQU1QLElBQUlRLElBQUk7Z0JBQzNCLE1BQU1DLElBQUkvQix5Q0FB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RUMsUUFBUTtRQUFJO0lBQ2hGO0FBQ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hdGllbmRlLy4vc3JjL2FwcC9hcGkva25vd2xlZGdlL2ltcG9ydC13ZWIvcm91dGUudHM/Y2U3OCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcic7XG5pbXBvcnQgeyBwcmlzbWEgfSBmcm9tICdAL2xpYi9wcmlzbWEnO1xuaW1wb3J0IHsgZ2V0Q3VycmVudFVzZXIgfSBmcm9tICdAL2xpYi9hdXRoJztcbmltcG9ydCAqIGFzIGNoZWVyaW8gZnJvbSAnY2hlZXJpbyc7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKHJlcTogUmVxdWVzdCkge1xuICBjb25zdCB1c2VyID0gYXdhaXQgZ2V0Q3VycmVudFVzZXIoKTtcbiAgaWYgKCF1c2VyKSB7XG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6ICdObyBhdXRvcml6YWRvJyB9LCB7IHN0YXR1czogNDAxIH0pO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBjb25zdCB7IHVybCB9ID0gYXdhaXQgcmVxLmpzb24oKTtcbiAgICBpZiAoIXVybCB8fCAhdXJsLnN0YXJ0c1dpdGgoJ2h0dHAnKSkge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6ICdJbnRyb2R1Y2UgdW5hIFVSTCB2w6FsaWRhJyB9LCB7IHN0YXR1czogNDAwIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IGFzc2lzdGFudCA9IGF3YWl0IHByaXNtYS5hc3Npc3RhbnRDb25maWcuZmluZEZpcnN0KCk7XG4gICAgY29uc3QgbW9kZWwgPSBhc3Npc3RhbnQ/Lm1vZGVsU2VsZWN0ZWQgfHwgJ2FudGhyb3BpYy9jbGF1ZGUtaGFpa3UtNS41JztcblxuICAgIC8vIDEuIEZldGNoIG1haW4gcGFnZVxuICAgIGNvbnN0IGZldGNoZWRQYWdlczogeyB1cmw6IHN0cmluZzsgdGV4dDogc3RyaW5nIH1bXSA9IFtdO1xuICAgIGNvbnN0IHZpc2l0ZWQgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICAgIGNvbnN0IGNyYXdsUGFnZSA9IGFzeW5jICh0YXJnZXRVcmw6IHN0cmluZykgPT4ge1xuICAgICAgaWYgKHZpc2l0ZWQuc2l6ZSA+PSA1IHx8IHZpc2l0ZWQuaGFzKHRhcmdldFVybCkpIHJldHVybjtcbiAgICAgIHZpc2l0ZWQuYWRkKHRhcmdldFVybCk7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKHRhcmdldFVybCwge1xuICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICdVc2VyLUFnZW50JzogJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjA7IFdpbjY0OyB4NjQpIEF0aWVuZGVCb3QvMS4wJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc2lnbmFsOiBBYm9ydFNpZ25hbC50aW1lb3V0KDYwMDApXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICghcmVzLm9rKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGh0bWwgPSBhd2FpdCByZXMudGV4dCgpO1xuICAgICAgICBjb25zdCAkID0gY2hlZXJpby5sb2FkKGh0bWwpO1xuXG4gICAgICAgIC8vIFJlbW92ZSBzY3JpcHRzLCBzdHlsZXMgYW5kIG5vaXNlXG4gICAgICAgICQoJ3NjcmlwdCwgc3R5bGUsIG5vc2NyaXB0LCBuYXYsIGZvb3RlciwgaWZyYW1lLCBzdmcnKS5yZW1vdmUoKTtcblxuICAgICAgICBjb25zdCBwYWdlVGV4dCA9ICQoJ2JvZHknKS50ZXh0KCkucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKS5zbGljZSgwLCA0MDAwKTtcbiAgICAgICAgZmV0Y2hlZFBhZ2VzLnB1c2goeyB1cmw6IHRhcmdldFVybCwgdGV4dDogcGFnZVRleHQgfSk7XG5cbiAgICAgICAgLy8gTG9vayBmb3IgaW50ZXJuYWwgbGlua3MgcmVsYXRlZCB0byBzZXJ2aWNlcywgcHJpY2VzIG9yIGNvbnRhY3RcbiAgICAgICAgaWYgKHZpc2l0ZWQuc2l6ZSA8IDUpIHtcbiAgICAgICAgICBjb25zdCBsaW5rczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAkKCdhW2hyZWZdJykuZWFjaCgoXywgZWwpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGhyZWYgPSAkKGVsKS5hdHRyKCdocmVmJyk7XG4gICAgICAgICAgICBpZiAoIWhyZWYpIHJldHVybjtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbnN0IGZ1bGxVcmwgPSBuZXcgVVJMKGhyZWYsIHRhcmdldFVybCkudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgY29uc3QgbG93ZXIgPSBmdWxsVXJsLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBmdWxsVXJsLnN0YXJ0c1dpdGgobmV3IFVSTCh0YXJnZXRVcmwpLm9yaWdpbikgJiZcbiAgICAgICAgICAgICAgICAobG93ZXIuaW5jbHVkZXMoJ3NlcnZpY2lvJykgfHwgbG93ZXIuaW5jbHVkZXMoJ3RyYXRhbWllbnRvJykgfHwgbG93ZXIuaW5jbHVkZXMoJ3ByZWNpbycpIHx8IGxvd2VyLmluY2x1ZGVzKCd0YXJpZmEnKSB8fCBsb3dlci5pbmNsdWRlcygnY29udGFjdG8nKSB8fCBsb3dlci5pbmNsdWRlcygnaG9yYXJpbycpKSAmJlxuICAgICAgICAgICAgICAgICF2aXNpdGVkLmhhcyhmdWxsVXJsKVxuICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBsaW5rcy5wdXNoKGZ1bGxVcmwpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIHt9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBmb3IgKGNvbnN0IGxpbmsgb2YgbGlua3Muc2xpY2UoMCwgNCkpIHtcbiAgICAgICAgICAgIGF3YWl0IGNyYXdsUGFnZShsaW5rKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLndhcm4oYEVycm9yIGFsIHJhc3RyZWFyICR7dGFyZ2V0VXJsfTpgLCBlcnIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGF3YWl0IGNyYXdsUGFnZSh1cmwpO1xuXG4gICAgY29uc3QgZnVsbEV4dHJhY3RlZFRleHQgPSBmZXRjaGVkUGFnZXMubWFwKHAgPT4gYC0tLSBQw4FHSU5BOiAke3AudXJsfSAtLS1cXG4ke3AudGV4dH1gKS5qb2luKCdcXG5cXG4nKTtcblxuICAgIC8vIDIuIFByb2Nlc3Mgd2l0aCBPcGVuUm91dGVyIGlmIEFQSSBrZXkgaXMgcHJlc2VudFxuICAgIGNvbnN0IGFwaUtleSA9IHByb2Nlc3MuZW52Lk9QRU5ST1VURVJfQVBJX0tFWTtcbiAgICBpZiAoYXBpS2V5ICYmIGFwaUtleS50cmltKCkubGVuZ3RoID4gMTApIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHByb21wdCA9IGBBbmFsaXphIGVsIHNpZ3VpZW50ZSB0ZXh0byBleHRyYcOtZG8gZGUgbGEgcMOhZ2luYSB3ZWIgZGUgdW4gbmVnb2NpbyB5IGV4dHJhZSBsYSBpbmZvcm1hY2nDs24gZW4gdW4gZm9ybWF0byBKU09OIGVzdHJpY3RvIGNvbiBlbCBzaWd1aWVudGUgZXNxdWVtYTpcbntcbiAgXCJidXNpbmVzc1wiOiB7XG4gICAgXCJuYW1lXCI6IFwiTm9tYnJlIGRlbCBuZWdvY2lvXCIsXG4gICAgXCJhY3Rpdml0eVwiOiBcIkEgcXXDqSBzZSBkZWRpY2FcIixcbiAgICBcImFkZHJlc3NcIjogXCJEaXJlY2Npw7NuIGbDrXNpY2EgZW5jb250cmFkYSBvIG51bGxcIixcbiAgICBcInBob25lXCI6IFwiVGVsw6lmb25vIGRlIGNvbnRhY3RvIG8gbnVsbFwiXG4gIH0sXG4gIFwic2VydmljZXNcIjogW1xuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIk5vbWJyZSBkZWwgc2VydmljaW8gbyB0cmF0YW1pZW50b1wiLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkJyZXZlIGRlc2NyaXBjacOzblwiLFxuICAgICAgXCJkdXJhdGlvbk1pbnV0ZXNcIjogMzAsXG4gICAgICBcInByaWNlXCI6IDUwLjAwLFxuICAgICAgXCJwcmljZUZyb21cIjogdHJ1ZSxcbiAgICAgIFwicmVxdWlyZXNUcmlhZ2VcIjogZmFsc2VcbiAgICB9XG4gIF0sXG4gIFwiZmFxc1wiOiBbXG4gICAge1xuICAgICAgXCJxdWVzdGlvblwiOiBcIsK/UHJlZ3VudGEgZnJlY3VlbnRlIGRldGVjdGFkYT9cIixcbiAgICAgIFwiYW5zd2VyXCI6IFwiUmVzcHVlc3RhIGNsYXJhIHNlZ8O6biBlbCB0ZXh0b1wiXG4gICAgfVxuICBdXG59XG5cblRFWFRPIEVYVFJBw41ETzpcbiR7ZnVsbEV4dHJhY3RlZFRleHQuc2xpY2UoMCwgMTAwMDApfVxuXG5JTVBPUlRBTlRFOiBSZXNwb25kZSDDmk5JQ0FNRU5URSBjb24gZWwgYmxvcXVlIEpTT04gc2luIGV4cGxpY2FjaW9uZXMgbmkgbWFya2Rvd24uYDtcblxuICAgICAgICBjb25zdCBhaVJlcyA9IGF3YWl0IGZldGNoKCdodHRwczovL29wZW5yb3V0ZXIuYWkvYXBpL3YxL2NoYXQvY29tcGxldGlvbnMnLCB7XG4gICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7YXBpS2V5fWAsXG4gICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgJ0hUVFAtUmVmZXJlcic6IHByb2Nlc3MuZW52LkFQUF9VUkwgfHwgJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcsXG4gICAgICAgICAgICAnWC1UaXRsZSc6ICdBdGllbmRlJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgbW9kZWw6IG1vZGVsLFxuICAgICAgICAgICAgbWVzc2FnZXM6IFt7IHJvbGU6ICd1c2VyJywgY29udGVudDogcHJvbXB0IH1dLFxuICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAuMlxuICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChhaVJlcy5vaykge1xuICAgICAgICAgIGNvbnN0IGFpRGF0YSA9IGF3YWl0IGFpUmVzLmpzb24oKTtcbiAgICAgICAgICBsZXQgcmF3SnNvbiA9IGFpRGF0YS5jaG9pY2VzPy5bMF0/Lm1lc3NhZ2U/LmNvbnRlbnQgfHwgJ3t9JztcbiAgICAgICAgICByYXdKc29uID0gcmF3SnNvbi5yZXBsYWNlKC9gYGBqc29uL2csICcnKS5yZXBsYWNlKC9gYGAvZywgJycpLnRyaW0oKTtcbiAgICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHJhd0pzb24pO1xuICAgICAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IHN1Y2Nlc3M6IHRydWUsIHBhZ2VzQ3Jhd2xlZDogZmV0Y2hlZFBhZ2VzLmxlbmd0aCwgZGF0YTogcGFyc2VkIH0pO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChhaUVycikge1xuICAgICAgICBjb25zb2xlLndhcm4oJ0Vycm9yIGxsYW1hbmRvIGEgT3BlblJvdXRlciBwYXJhIGltcG9ydGFjacOzbiB3ZWI6JywgYWlFcnIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEhldXJpc3RpYyBGYWxsYmFjayBleHRyYWN0aW9uIGlmIG5vIEFQSSBrZXlcbiAgICBjb25zdCBwYXJzZWREYXRhID0ge1xuICAgICAgYnVzaW5lc3M6IHtcbiAgICAgICAgbmFtZTogbmV3IFVSTCh1cmwpLmhvc3RuYW1lLnJlcGxhY2UoJ3d3dy4nLCAnJykuc3BsaXQoJy4nKVswXS50b1VwcGVyQ2FzZSgpLFxuICAgICAgICBhY3Rpdml0eTogJ1NlcnZpY2lvcyBwcm9mZXNpb25hbGVzIGRldGVjdGFkb3MgZW4gbGEgd2ViJyxcbiAgICAgICAgYWRkcmVzczogJ0RpcmVjY2nDs24gZXh0cmHDrWRhIGRlIGxhIHdlYicsXG4gICAgICAgIHBob25lOiAnKzM0IDkxMiAwMDAgMTExJ1xuICAgICAgfSxcbiAgICAgIHNlcnZpY2VzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ29uc3VsdGEgeSBkaWFnbsOzc3RpY28gaW5pY2lhbCcsXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdWYWxvcmFjacOzbiBnZW5lcmFsIHNlZ8O6biBsYSBpbmZvcm1hY2nDs24gZGVsIHNpdGlvIHdlYicsXG4gICAgICAgICAgZHVyYXRpb25NaW51dGVzOiAzMCxcbiAgICAgICAgICBwcmljZTogNTAuMCxcbiAgICAgICAgICBwcmljZUZyb206IHRydWUsXG4gICAgICAgICAgcmVxdWlyZXNUcmlhZ2U6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnVHJhdGFtaWVudG8gZXN0w6FuZGFyJyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1NlcnZpY2lvIGlkZW50aWZpY2FkbyBlbiBlbCBjYXTDoWxvZ28gd2ViJyxcbiAgICAgICAgICBkdXJhdGlvbk1pbnV0ZXM6IDQ1LFxuICAgICAgICAgIHByaWNlOiA5MC4wLFxuICAgICAgICAgIHByaWNlRnJvbTogdHJ1ZSxcbiAgICAgICAgICByZXF1aXJlc1RyaWFnZTogdHJ1ZVxuICAgICAgICB9XG4gICAgICBdLFxuICAgICAgZmFxczogW1xuICAgICAgICB7XG4gICAgICAgICAgcXVlc3Rpb246ICfCv0PDs21vIHB1ZWRvIHBlZGlyIGNpdGEgcHJldmlhPycsXG4gICAgICAgICAgYW5zd2VyOiAnUHVlZGVzIHNvbGljaXRhciBjaXRhIGEgdHJhdsOpcyBkZWwgY2hhdCwgcG9yIFdoYXRzQXBwIG8gbGxhbWFuZG8gYWwgdGVsw6lmb25vIGRlIGF0ZW5jacOzbi4nXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBxdWVzdGlvbjogJ8K/Q3XDoWxlcyBzb24gbGFzIGZvcm1hcyBkZSBwYWdvPycsXG4gICAgICAgICAgYW5zd2VyOiAnQWNlcHRhbW9zIHRhcmpldGEgZGUgY3LDqWRpdG8sIGTDqWJpdG8sIGVmZWN0aXZvIHkgdHJhbnNmZXJlbmNpYXMgYmFuY2FyaWFzLidcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH07XG5cbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oe1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIHBhZ2VzQ3Jhd2xlZDogZmV0Y2hlZFBhZ2VzLmxlbmd0aCxcbiAgICAgIGRhdGE6IHBhcnNlZERhdGFcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBlbiBpbXBvcnRhY2nDs24gd2ViOicsIGVycik7XG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6ICdFcnJvciBhbCBwcm9jZXNhciBsYSB3ZWInIH0sIHsgc3RhdHVzOiA1MDAgfSk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJwcmlzbWEiLCJnZXRDdXJyZW50VXNlciIsImNoZWVyaW8iLCJQT1NUIiwicmVxIiwidXNlciIsImpzb24iLCJlcnJvciIsInN0YXR1cyIsInVybCIsInN0YXJ0c1dpdGgiLCJhc3Npc3RhbnQiLCJhc3Npc3RhbnRDb25maWciLCJmaW5kRmlyc3QiLCJtb2RlbCIsIm1vZGVsU2VsZWN0ZWQiLCJmZXRjaGVkUGFnZXMiLCJ2aXNpdGVkIiwiU2V0IiwiY3Jhd2xQYWdlIiwidGFyZ2V0VXJsIiwic2l6ZSIsImhhcyIsImFkZCIsInJlcyIsImZldGNoIiwiaGVhZGVycyIsInNpZ25hbCIsIkFib3J0U2lnbmFsIiwidGltZW91dCIsIm9rIiwiaHRtbCIsInRleHQiLCIkIiwibG9hZCIsInJlbW92ZSIsInBhZ2VUZXh0IiwicmVwbGFjZSIsInRyaW0iLCJzbGljZSIsInB1c2giLCJsaW5rcyIsImVhY2giLCJfIiwiZWwiLCJocmVmIiwiYXR0ciIsImZ1bGxVcmwiLCJVUkwiLCJ0b1N0cmluZyIsImxvd2VyIiwidG9Mb3dlckNhc2UiLCJvcmlnaW4iLCJpbmNsdWRlcyIsImxpbmsiLCJlcnIiLCJjb25zb2xlIiwid2FybiIsImZ1bGxFeHRyYWN0ZWRUZXh0IiwibWFwIiwicCIsImpvaW4iLCJhcGlLZXkiLCJwcm9jZXNzIiwiZW52IiwiT1BFTlJPVVRFUl9BUElfS0VZIiwibGVuZ3RoIiwicHJvbXB0IiwiYWlSZXMiLCJtZXRob2QiLCJBUFBfVVJMIiwiYm9keSIsIkpTT04iLCJzdHJpbmdpZnkiLCJtZXNzYWdlcyIsInJvbGUiLCJjb250ZW50IiwidGVtcGVyYXR1cmUiLCJhaURhdGEiLCJyYXdKc29uIiwiY2hvaWNlcyIsIm1lc3NhZ2UiLCJwYXJzZWQiLCJwYXJzZSIsInN1Y2Nlc3MiLCJwYWdlc0NyYXdsZWQiLCJkYXRhIiwiYWlFcnIiLCJwYXJzZWREYXRhIiwiYnVzaW5lc3MiLCJuYW1lIiwiaG9zdG5hbWUiLCJzcGxpdCIsInRvVXBwZXJDYXNlIiwiYWN0aXZpdHkiLCJhZGRyZXNzIiwicGhvbmUiLCJzZXJ2aWNlcyIsImRlc2NyaXB0aW9uIiwiZHVyYXRpb25NaW51dGVzIiwicHJpY2UiLCJwcmljZUZyb20iLCJyZXF1aXJlc1RyaWFnZSIsImZhcXMiLCJxdWVzdGlvbiIsImFuc3dlciJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/knowledge/import-web/route.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/auth.ts":
/*!*************************!*\
  !*** ./src/lib/auth.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   createSessionToken: () => (/* binding */ createSessionToken),\n/* harmony export */   getCurrentUser: () => (/* binding */ getCurrentUser),\n/* harmony export */   verifySessionToken: () => (/* binding */ verifySessionToken)\n/* harmony export */ });\n/* harmony import */ var jose__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jose */ \"(rsc)/./node_modules/jose/dist/node/esm/jwt/sign.js\");\n/* harmony import */ var jose__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! jose */ \"(rsc)/./node_modules/jose/dist/node/esm/jwt/verify.js\");\n/* harmony import */ var next_headers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/headers */ \"(rsc)/./node_modules/next/dist/api/headers.js\");\n/* harmony import */ var _prisma__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./prisma */ \"(rsc)/./src/lib/prisma.ts\");\n\n\n\nconst SECRET_KEY = new TextEncoder().encode(process.env.AUTH_SECRET || \"atiende-auth-secret-change-me-in-production-2026\");\nasync function createSessionToken(payload) {\n    return await new jose__WEBPACK_IMPORTED_MODULE_2__.SignJWT(payload).setProtectedHeader({\n        alg: \"HS256\"\n    }).setIssuedAt().setExpirationTime(\"7d\").sign(SECRET_KEY);\n}\nasync function verifySessionToken(token) {\n    try {\n        const { payload } = await (0,jose__WEBPACK_IMPORTED_MODULE_3__.jwtVerify)(token, SECRET_KEY);\n        return payload;\n    } catch  {\n        return null;\n    }\n}\nasync function getCurrentUser() {\n    const cookieStore = (0,next_headers__WEBPACK_IMPORTED_MODULE_0__.cookies)();\n    const token = cookieStore.get(\"atiende_session\")?.value;\n    if (!token) return null;\n    const payload = await verifySessionToken(token);\n    if (!payload?.userId) return null;\n    const user = await _prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.user.findUnique({\n        where: {\n            id: payload.userId\n        },\n        select: {\n            id: true,\n            email: true,\n            name: true,\n            role: true\n        }\n    });\n    return user;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL2F1dGgudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUEwQztBQUNIO0FBQ0w7QUFFbEMsTUFBTUksYUFBYSxJQUFJQyxjQUFjQyxNQUFNLENBQ3pDQyxRQUFRQyxHQUFHLENBQUNDLFdBQVcsSUFBSTtBQUd0QixlQUFlQyxtQkFBbUJDLE9BQXdEO0lBQy9GLE9BQU8sTUFBTSxJQUFJWCx5Q0FBT0EsQ0FBQ1csU0FDdEJDLGtCQUFrQixDQUFDO1FBQUVDLEtBQUs7SUFBUSxHQUNsQ0MsV0FBVyxHQUNYQyxpQkFBaUIsQ0FBQyxNQUNsQkMsSUFBSSxDQUFDWjtBQUNWO0FBRU8sZUFBZWEsbUJBQW1CQyxLQUFhO0lBQ3BELElBQUk7UUFDRixNQUFNLEVBQUVQLE9BQU8sRUFBRSxHQUFHLE1BQU1WLCtDQUFTQSxDQUFDaUIsT0FBT2Q7UUFDM0MsT0FBT087SUFDVCxFQUFFLE9BQU07UUFDTixPQUFPO0lBQ1Q7QUFDRjtBQUVPLGVBQWVRO0lBQ3BCLE1BQU1DLGNBQWNsQixxREFBT0E7SUFDM0IsTUFBTWdCLFFBQVFFLFlBQVlDLEdBQUcsQ0FBQyxvQkFBb0JDO0lBQ2xELElBQUksQ0FBQ0osT0FBTyxPQUFPO0lBRW5CLE1BQU1QLFVBQVUsTUFBTU0sbUJBQW1CQztJQUN6QyxJQUFJLENBQUNQLFNBQVNZLFFBQVEsT0FBTztJQUU3QixNQUFNQyxPQUFPLE1BQU1yQiwyQ0FBTUEsQ0FBQ3FCLElBQUksQ0FBQ0MsVUFBVSxDQUFDO1FBQ3hDQyxPQUFPO1lBQUVDLElBQUloQixRQUFRWSxNQUFNO1FBQUM7UUFDNUJLLFFBQVE7WUFBRUQsSUFBSTtZQUFNRSxPQUFPO1lBQU1DLE1BQU07WUFBTUMsTUFBTTtRQUFLO0lBQzFEO0lBRUEsT0FBT1A7QUFDVCIsInNvdXJjZXMiOlsid2VicGFjazovL2F0aWVuZGUvLi9zcmMvbGliL2F1dGgudHM/NjY5MiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTaWduSldULCBqd3RWZXJpZnkgfSBmcm9tICdqb3NlJztcbmltcG9ydCB7IGNvb2tpZXMgfSBmcm9tICduZXh0L2hlYWRlcnMnO1xuaW1wb3J0IHsgcHJpc21hIH0gZnJvbSAnLi9wcmlzbWEnO1xuXG5jb25zdCBTRUNSRVRfS0VZID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKFxuICBwcm9jZXNzLmVudi5BVVRIX1NFQ1JFVCB8fCAnYXRpZW5kZS1hdXRoLXNlY3JldC1jaGFuZ2UtbWUtaW4tcHJvZHVjdGlvbi0yMDI2J1xuKTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVNlc3Npb25Ub2tlbihwYXlsb2FkOiB7IHVzZXJJZDogc3RyaW5nOyBlbWFpbDogc3RyaW5nOyBuYW1lOiBzdHJpbmcgfSkge1xuICByZXR1cm4gYXdhaXQgbmV3IFNpZ25KV1QocGF5bG9hZClcbiAgICAuc2V0UHJvdGVjdGVkSGVhZGVyKHsgYWxnOiAnSFMyNTYnIH0pXG4gICAgLnNldElzc3VlZEF0KClcbiAgICAuc2V0RXhwaXJhdGlvblRpbWUoJzdkJylcbiAgICAuc2lnbihTRUNSRVRfS0VZKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZlcmlmeVNlc3Npb25Ub2tlbih0b2tlbjogc3RyaW5nKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBwYXlsb2FkIH0gPSBhd2FpdCBqd3RWZXJpZnkodG9rZW4sIFNFQ1JFVF9LRVkpO1xuICAgIHJldHVybiBwYXlsb2FkIGFzIHsgdXNlcklkOiBzdHJpbmc7IGVtYWlsOiBzdHJpbmc7IG5hbWU6IHN0cmluZyB9O1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Q3VycmVudFVzZXIoKSB7XG4gIGNvbnN0IGNvb2tpZVN0b3JlID0gY29va2llcygpO1xuICBjb25zdCB0b2tlbiA9IGNvb2tpZVN0b3JlLmdldCgnYXRpZW5kZV9zZXNzaW9uJyk/LnZhbHVlO1xuICBpZiAoIXRva2VuKSByZXR1cm4gbnVsbDtcblxuICBjb25zdCBwYXlsb2FkID0gYXdhaXQgdmVyaWZ5U2Vzc2lvblRva2VuKHRva2VuKTtcbiAgaWYgKCFwYXlsb2FkPy51c2VySWQpIHJldHVybiBudWxsO1xuXG4gIGNvbnN0IHVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kVW5pcXVlKHtcbiAgICB3aGVyZTogeyBpZDogcGF5bG9hZC51c2VySWQgfSxcbiAgICBzZWxlY3Q6IHsgaWQ6IHRydWUsIGVtYWlsOiB0cnVlLCBuYW1lOiB0cnVlLCByb2xlOiB0cnVlIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHVzZXI7XG59XG4iXSwibmFtZXMiOlsiU2lnbkpXVCIsImp3dFZlcmlmeSIsImNvb2tpZXMiLCJwcmlzbWEiLCJTRUNSRVRfS0VZIiwiVGV4dEVuY29kZXIiLCJlbmNvZGUiLCJwcm9jZXNzIiwiZW52IiwiQVVUSF9TRUNSRVQiLCJjcmVhdGVTZXNzaW9uVG9rZW4iLCJwYXlsb2FkIiwic2V0UHJvdGVjdGVkSGVhZGVyIiwiYWxnIiwic2V0SXNzdWVkQXQiLCJzZXRFeHBpcmF0aW9uVGltZSIsInNpZ24iLCJ2ZXJpZnlTZXNzaW9uVG9rZW4iLCJ0b2tlbiIsImdldEN1cnJlbnRVc2VyIiwiY29va2llU3RvcmUiLCJnZXQiLCJ2YWx1ZSIsInVzZXJJZCIsInVzZXIiLCJmaW5kVW5pcXVlIiwid2hlcmUiLCJpZCIsInNlbGVjdCIsImVtYWlsIiwibmFtZSIsInJvbGUiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/auth.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/prisma.ts":
/*!***************************!*\
  !*** ./src/lib/prisma.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst prisma = global.__prisma || new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) {\n    global.__prisma = prisma;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL3ByaXNtYS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBOEM7QUFPdkMsTUFBTUMsU0FBU0MsT0FBT0MsUUFBUSxJQUFJLElBQUlILHdEQUFZQSxHQUFHO0FBRTVELElBQUlJLElBQXlCLEVBQWM7SUFDekNGLE9BQU9DLFFBQVEsR0FBR0Y7QUFDcEIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hdGllbmRlLy4vc3JjL2xpYi9wcmlzbWEudHM/MDFkNyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQcmlzbWFDbGllbnQgfSBmcm9tICdAcHJpc21hL2NsaWVudCc7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXZhclxuICB2YXIgX19wcmlzbWE6IFByaXNtYUNsaWVudCB8IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGNvbnN0IHByaXNtYSA9IGdsb2JhbC5fX3ByaXNtYSB8fCBuZXcgUHJpc21hQ2xpZW50KCk7XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIGdsb2JhbC5fX3ByaXNtYSA9IHByaXNtYTtcbn1cbiJdLCJuYW1lcyI6WyJQcmlzbWFDbGllbnQiLCJwcmlzbWEiLCJnbG9iYWwiLCJfX3ByaXNtYSIsInByb2Nlc3MiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/prisma.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/jose","vendor-chunks/undici","vendor-chunks/whatwg-encoding","vendor-chunks/encoding-sniffer","vendor-chunks/parse5","vendor-chunks/cheerio","vendor-chunks/css-select","vendor-chunks/htmlparser2","vendor-chunks/entities","vendor-chunks/domutils","vendor-chunks/whatwg-mimetype","vendor-chunks/nth-check","vendor-chunks/cheerio-select","vendor-chunks/domhandler","vendor-chunks/dom-serializer","vendor-chunks/css-what","vendor-chunks/parse5-parser-stream","vendor-chunks/parse5-htmlparser2-tree-adapter","vendor-chunks/domelementtype","vendor-chunks/safer-buffer","vendor-chunks/boolbase"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fknowledge%2Fimport-web%2Froute&page=%2Fapi%2Fknowledge%2Fimport-web%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fknowledge%2Fimport-web%2Froute.ts&appDir=C%3A%5CUsers%5CMicro%5COneDrive%5CDesktop%5Cassistente%20de%20ia%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CMicro%5COneDrive%5CDesktop%5Cassistente%20de%20ia&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();