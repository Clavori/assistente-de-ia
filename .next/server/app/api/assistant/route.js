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
exports.id = "app/api/assistant/route";
exports.ids = ["app/api/assistant/route"];
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

/***/ "node:buffer":
/*!******************************!*\
  !*** external "node:buffer" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:buffer");

/***/ }),

/***/ "node:crypto":
/*!******************************!*\
  !*** external "node:crypto" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:crypto");

/***/ }),

/***/ "node:util":
/*!****************************!*\
  !*** external "node:util" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("node:util");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fassistant%2Froute&page=%2Fapi%2Fassistant%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fassistant%2Froute.ts&appDir=C%3A%5CUsers%5CMicro%5COneDrive%5CDesktop%5Cassistente%20de%20ia%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CMicro%5COneDrive%5CDesktop%5Cassistente%20de%20ia&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fassistant%2Froute&page=%2Fapi%2Fassistant%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fassistant%2Froute.ts&appDir=C%3A%5CUsers%5CMicro%5COneDrive%5CDesktop%5Cassistente%20de%20ia%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CMicro%5COneDrive%5CDesktop%5Cassistente%20de%20ia&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_Micro_OneDrive_Desktop_assistente_de_ia_src_app_api_assistant_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/assistant/route.ts */ \"(rsc)/./src/app/api/assistant/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/assistant/route\",\n        pathname: \"/api/assistant\",\n        filename: \"route\",\n        bundlePath: \"app/api/assistant/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\Micro\\\\OneDrive\\\\Desktop\\\\assistente de ia\\\\src\\\\app\\\\api\\\\assistant\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_Micro_OneDrive_Desktop_assistente_de_ia_src_app_api_assistant_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/assistant/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhc3Npc3RhbnQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmFzc2lzdGFudCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmFzc2lzdGFudCUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNNaWNybyU1Q09uZURyaXZlJTVDRGVza3RvcCU1Q2Fzc2lzdGVudGUlMjBkZSUyMGlhJTVDc3JjJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1DJTNBJTVDVXNlcnMlNUNNaWNybyU1Q09uZURyaXZlJTVDRGVza3RvcCU1Q2Fzc2lzdGVudGUlMjBkZSUyMGlhJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUN5QztBQUN0SDtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLGlFQUFpRTtBQUN6RTtBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ3VIOztBQUV2SCIsInNvdXJjZXMiOlsid2VicGFjazovL2F0aWVuZGUvPzI1ZWQiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiQzpcXFxcVXNlcnNcXFxcTWljcm9cXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxhc3Npc3RlbnRlIGRlIGlhXFxcXHNyY1xcXFxhcHBcXFxcYXBpXFxcXGFzc2lzdGFudFxcXFxyb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvYXNzaXN0YW50L3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvYXNzaXN0YW50XCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9hc3Npc3RhbnQvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCJDOlxcXFxVc2Vyc1xcXFxNaWNyb1xcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXGFzc2lzdGVudGUgZGUgaWFcXFxcc3JjXFxcXGFwcFxcXFxhcGlcXFxcYXNzaXN0YW50XFxcXHJvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9hc3Npc3RhbnQvcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fassistant%2Froute&page=%2Fapi%2Fassistant%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fassistant%2Froute.ts&appDir=C%3A%5CUsers%5CMicro%5COneDrive%5CDesktop%5Cassistente%20de%20ia%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CMicro%5COneDrive%5CDesktop%5Cassistente%20de%20ia&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/assistant/route.ts":
/*!****************************************!*\
  !*** ./src/app/api/assistant/route.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   PUT: () => (/* binding */ PUT)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./src/lib/prisma.ts\");\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./src/lib/auth.ts\");\n\n\n\nasync function GET() {\n    const user = await (0,_lib_auth__WEBPACK_IMPORTED_MODULE_2__.getCurrentUser)();\n    if (!user) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"No autorizado\"\n        }, {\n            status: 401\n        });\n    }\n    const assistant = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.assistantConfig.findFirst();\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        assistant\n    });\n}\nasync function PUT(req) {\n    const user = await (0,_lib_auth__WEBPACK_IMPORTED_MODULE_2__.getCurrentUser)();\n    if (!user) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"No autorizado\"\n        }, {\n            status: 401\n        });\n    }\n    const data = await req.json();\n    const assistant = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.assistantConfig.findFirst();\n    if (!assistant) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Asistente no encontrado\"\n        }, {\n            status: 404\n        });\n    }\n    const updated = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.assistantConfig.update({\n        where: {\n            id: assistant.id\n        },\n        data: {\n            name: data.name ?? assistant.name,\n            avatar: data.avatar ?? assistant.avatar,\n            tone: data.tone ?? assistant.tone,\n            welcomeMessage: data.welcomeMessage ?? assistant.welcomeMessage,\n            instructions: data.instructions ?? assistant.instructions,\n            neverDoRules: data.neverDoRules ?? assistant.neverDoRules,\n            escalateTriggers: data.escalateTriggers ?? assistant.escalateTriggers,\n            active: data.active !== undefined ? data.active : assistant.active,\n            modelSelected: data.modelSelected ?? assistant.modelSelected,\n            safeMode: data.safeMode !== undefined ? data.safeMode : assistant.safeMode\n        }\n    });\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        success: true,\n        assistant: updated\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9hc3Npc3RhbnQvcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBMkM7QUFDTDtBQUNNO0FBRXJDLGVBQWVHO0lBQ3BCLE1BQU1DLE9BQU8sTUFBTUYseURBQWNBO0lBQ2pDLElBQUksQ0FBQ0UsTUFBTTtRQUNULE9BQU9KLHFEQUFZQSxDQUFDSyxJQUFJLENBQUM7WUFBRUMsT0FBTztRQUFnQixHQUFHO1lBQUVDLFFBQVE7UUFBSTtJQUNyRTtJQUVBLE1BQU1DLFlBQVksTUFBTVAsK0NBQU1BLENBQUNRLGVBQWUsQ0FBQ0MsU0FBUztJQUN4RCxPQUFPVixxREFBWUEsQ0FBQ0ssSUFBSSxDQUFDO1FBQUVHO0lBQVU7QUFDdkM7QUFFTyxlQUFlRyxJQUFJQyxHQUFZO0lBQ3BDLE1BQU1SLE9BQU8sTUFBTUYseURBQWNBO0lBQ2pDLElBQUksQ0FBQ0UsTUFBTTtRQUNULE9BQU9KLHFEQUFZQSxDQUFDSyxJQUFJLENBQUM7WUFBRUMsT0FBTztRQUFnQixHQUFHO1lBQUVDLFFBQVE7UUFBSTtJQUNyRTtJQUVBLE1BQU1NLE9BQU8sTUFBTUQsSUFBSVAsSUFBSTtJQUMzQixNQUFNRyxZQUFZLE1BQU1QLCtDQUFNQSxDQUFDUSxlQUFlLENBQUNDLFNBQVM7SUFDeEQsSUFBSSxDQUFDRixXQUFXO1FBQ2QsT0FBT1IscURBQVlBLENBQUNLLElBQUksQ0FBQztZQUFFQyxPQUFPO1FBQTBCLEdBQUc7WUFBRUMsUUFBUTtRQUFJO0lBQy9FO0lBRUEsTUFBTU8sVUFBVSxNQUFNYiwrQ0FBTUEsQ0FBQ1EsZUFBZSxDQUFDTSxNQUFNLENBQUM7UUFDbERDLE9BQU87WUFBRUMsSUFBSVQsVUFBVVMsRUFBRTtRQUFDO1FBQzFCSixNQUFNO1lBQ0pLLE1BQU1MLEtBQUtLLElBQUksSUFBSVYsVUFBVVUsSUFBSTtZQUNqQ0MsUUFBUU4sS0FBS00sTUFBTSxJQUFJWCxVQUFVVyxNQUFNO1lBQ3ZDQyxNQUFNUCxLQUFLTyxJQUFJLElBQUlaLFVBQVVZLElBQUk7WUFDakNDLGdCQUFnQlIsS0FBS1EsY0FBYyxJQUFJYixVQUFVYSxjQUFjO1lBQy9EQyxjQUFjVCxLQUFLUyxZQUFZLElBQUlkLFVBQVVjLFlBQVk7WUFDekRDLGNBQWNWLEtBQUtVLFlBQVksSUFBSWYsVUFBVWUsWUFBWTtZQUN6REMsa0JBQWtCWCxLQUFLVyxnQkFBZ0IsSUFBSWhCLFVBQVVnQixnQkFBZ0I7WUFDckVDLFFBQVFaLEtBQUtZLE1BQU0sS0FBS0MsWUFBWWIsS0FBS1ksTUFBTSxHQUFHakIsVUFBVWlCLE1BQU07WUFDbEVFLGVBQWVkLEtBQUtjLGFBQWEsSUFBSW5CLFVBQVVtQixhQUFhO1lBQzVEQyxVQUFVZixLQUFLZSxRQUFRLEtBQUtGLFlBQVliLEtBQUtlLFFBQVEsR0FBR3BCLFVBQVVvQixRQUFRO1FBQzVFO0lBQ0Y7SUFFQSxPQUFPNUIscURBQVlBLENBQUNLLElBQUksQ0FBQztRQUFFd0IsU0FBUztRQUFNckIsV0FBV007SUFBUTtBQUMvRCIsInNvdXJjZXMiOlsid2VicGFjazovL2F0aWVuZGUvLi9zcmMvYXBwL2FwaS9hc3Npc3RhbnQvcm91dGUudHM/ZWI1MyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcic7XG5pbXBvcnQgeyBwcmlzbWEgfSBmcm9tICdAL2xpYi9wcmlzbWEnO1xuaW1wb3J0IHsgZ2V0Q3VycmVudFVzZXIgfSBmcm9tICdAL2xpYi9hdXRoJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdFVCgpIHtcbiAgY29uc3QgdXNlciA9IGF3YWl0IGdldEN1cnJlbnRVc2VyKCk7XG4gIGlmICghdXNlcikge1xuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnTm8gYXV0b3JpemFkbycgfSwgeyBzdGF0dXM6IDQwMSB9KTtcbiAgfVxuXG4gIGNvbnN0IGFzc2lzdGFudCA9IGF3YWl0IHByaXNtYS5hc3Npc3RhbnRDb25maWcuZmluZEZpcnN0KCk7XG4gIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGFzc2lzdGFudCB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBVVChyZXE6IFJlcXVlc3QpIHtcbiAgY29uc3QgdXNlciA9IGF3YWl0IGdldEN1cnJlbnRVc2VyKCk7XG4gIGlmICghdXNlcikge1xuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnTm8gYXV0b3JpemFkbycgfSwgeyBzdGF0dXM6IDQwMSB9KTtcbiAgfVxuXG4gIGNvbnN0IGRhdGEgPSBhd2FpdCByZXEuanNvbigpO1xuICBjb25zdCBhc3Npc3RhbnQgPSBhd2FpdCBwcmlzbWEuYXNzaXN0YW50Q29uZmlnLmZpbmRGaXJzdCgpO1xuICBpZiAoIWFzc2lzdGFudCkge1xuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnQXNpc3RlbnRlIG5vIGVuY29udHJhZG8nIH0sIHsgc3RhdHVzOiA0MDQgfSk7XG4gIH1cblxuICBjb25zdCB1cGRhdGVkID0gYXdhaXQgcHJpc21hLmFzc2lzdGFudENvbmZpZy51cGRhdGUoe1xuICAgIHdoZXJlOiB7IGlkOiBhc3Npc3RhbnQuaWQgfSxcbiAgICBkYXRhOiB7XG4gICAgICBuYW1lOiBkYXRhLm5hbWUgPz8gYXNzaXN0YW50Lm5hbWUsXG4gICAgICBhdmF0YXI6IGRhdGEuYXZhdGFyID8/IGFzc2lzdGFudC5hdmF0YXIsXG4gICAgICB0b25lOiBkYXRhLnRvbmUgPz8gYXNzaXN0YW50LnRvbmUsXG4gICAgICB3ZWxjb21lTWVzc2FnZTogZGF0YS53ZWxjb21lTWVzc2FnZSA/PyBhc3Npc3RhbnQud2VsY29tZU1lc3NhZ2UsXG4gICAgICBpbnN0cnVjdGlvbnM6IGRhdGEuaW5zdHJ1Y3Rpb25zID8/IGFzc2lzdGFudC5pbnN0cnVjdGlvbnMsXG4gICAgICBuZXZlckRvUnVsZXM6IGRhdGEubmV2ZXJEb1J1bGVzID8/IGFzc2lzdGFudC5uZXZlckRvUnVsZXMsXG4gICAgICBlc2NhbGF0ZVRyaWdnZXJzOiBkYXRhLmVzY2FsYXRlVHJpZ2dlcnMgPz8gYXNzaXN0YW50LmVzY2FsYXRlVHJpZ2dlcnMsXG4gICAgICBhY3RpdmU6IGRhdGEuYWN0aXZlICE9PSB1bmRlZmluZWQgPyBkYXRhLmFjdGl2ZSA6IGFzc2lzdGFudC5hY3RpdmUsXG4gICAgICBtb2RlbFNlbGVjdGVkOiBkYXRhLm1vZGVsU2VsZWN0ZWQgPz8gYXNzaXN0YW50Lm1vZGVsU2VsZWN0ZWQsXG4gICAgICBzYWZlTW9kZTogZGF0YS5zYWZlTW9kZSAhPT0gdW5kZWZpbmVkID8gZGF0YS5zYWZlTW9kZSA6IGFzc2lzdGFudC5zYWZlTW9kZVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgc3VjY2VzczogdHJ1ZSwgYXNzaXN0YW50OiB1cGRhdGVkIH0pO1xufVxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsInByaXNtYSIsImdldEN1cnJlbnRVc2VyIiwiR0VUIiwidXNlciIsImpzb24iLCJlcnJvciIsInN0YXR1cyIsImFzc2lzdGFudCIsImFzc2lzdGFudENvbmZpZyIsImZpbmRGaXJzdCIsIlBVVCIsInJlcSIsImRhdGEiLCJ1cGRhdGVkIiwidXBkYXRlIiwid2hlcmUiLCJpZCIsIm5hbWUiLCJhdmF0YXIiLCJ0b25lIiwid2VsY29tZU1lc3NhZ2UiLCJpbnN0cnVjdGlvbnMiLCJuZXZlckRvUnVsZXMiLCJlc2NhbGF0ZVRyaWdnZXJzIiwiYWN0aXZlIiwidW5kZWZpbmVkIiwibW9kZWxTZWxlY3RlZCIsInNhZmVNb2RlIiwic3VjY2VzcyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/assistant/route.ts\n");

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
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/jose"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fassistant%2Froute&page=%2Fapi%2Fassistant%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fassistant%2Froute.ts&appDir=C%3A%5CUsers%5CMicro%5COneDrive%5CDesktop%5Cassistente%20de%20ia%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CMicro%5COneDrive%5CDesktop%5Cassistente%20de%20ia&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();