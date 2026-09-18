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
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./src/context/AuthContext.tsx":
/*!*************************************!*\
  !*** ./src/context/AuthContext.tsx ***!
  \*************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   AuthProvider: () => (/* binding */ AuthProvider),\n/* harmony export */   useAuth: () => (/* binding */ useAuth)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _services_api__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/services/api */ \"./src/services/api.ts\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_services_api__WEBPACK_IMPORTED_MODULE_3__]);\n_services_api__WEBPACK_IMPORTED_MODULE_3__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\n\nconst AuthContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)({\n    user: null,\n    login: async ()=>{},\n    logout: ()=>{},\n    isLoading: true\n});\nconst AuthProvider = ({ children })=>{\n    const [user, setUser] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [isLoading, setIsLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(true);\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_2__.useRouter)();\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        // Check saved session in localStorage\n        const savedUser = localStorage.getItem(\"agri_user\");\n        if (savedUser) {\n            try {\n                setUser(JSON.parse(savedUser));\n            } catch (e) {\n                localStorage.removeItem(\"agri_user\");\n            }\n        }\n        setIsLoading(false);\n    }, []);\n    const login = async (email, forceRole)=>{\n        setIsLoading(true);\n        let role = forceRole || (email.includes(\"admin\") ? \"admin\" : \"farmer\");\n        try {\n            // Try backend authentication or default demo mock\n            const res = await _services_api__WEBPACK_IMPORTED_MODULE_3__.apiClient.post(\"/auth/login\", {\n                email: email,\n                password: role === \"admin\" ? \"admin123\" : \"password123\"\n            }).catch(()=>null);\n            const userObj = {\n                id: res?.data?.user?.id || (role === \"admin\" ? 2 : 1),\n                email: email,\n                full_name: role === \"admin\" ? \"AgriTech System Admin\" : \"John Deere (Farmer)\",\n                role: role\n            };\n            setUser(userObj);\n            localStorage.setItem(\"agri_user\", JSON.stringify(userObj));\n            // Role-Based Redirection\n            if (role === \"admin\") {\n                router.push(\"/admin\");\n            } else {\n                router.push(\"/dashboard\");\n            }\n        } catch (err) {\n            console.error(\"Login failed:\", err);\n        } finally{\n            setIsLoading(false);\n        }\n    };\n    const logout = ()=>{\n        setUser(null);\n        localStorage.removeItem(\"agri_user\");\n        router.push(\"/\");\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(AuthContext.Provider, {\n        value: {\n            user,\n            login,\n            logout,\n            isLoading\n        },\n        children: children\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\Hello\\\\Desktop\\\\agtech\\\\agtech_frontend\\\\src\\\\context\\\\AuthContext.tsx\",\n        lineNumber: 85,\n        columnNumber: 5\n    }, undefined);\n};\nconst useAuth = ()=>(0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(AuthContext);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY29udGV4dC9BdXRoQ29udGV4dC50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUE4RTtBQUN0QztBQUNHO0FBZ0IzQyxNQUFNTyw0QkFBY04sb0RBQWFBLENBQWtCO0lBQ2pETyxNQUFNO0lBQ05DLE9BQU8sV0FBYTtJQUNwQkMsUUFBUSxLQUFPO0lBQ2ZDLFdBQVc7QUFDYjtBQUVPLE1BQU1DLGVBQXdELENBQUMsRUFBRUMsUUFBUSxFQUFFO0lBQ2hGLE1BQU0sQ0FBQ0wsTUFBTU0sUUFBUSxHQUFHWCwrQ0FBUUEsQ0FBcUI7SUFDckQsTUFBTSxDQUFDUSxXQUFXSSxhQUFhLEdBQUdaLCtDQUFRQSxDQUFVO0lBQ3BELE1BQU1hLFNBQVNYLHNEQUFTQTtJQUV4QkQsZ0RBQVNBLENBQUM7UUFDUixzQ0FBc0M7UUFDdEMsTUFBTWEsWUFBWUMsYUFBYUMsT0FBTyxDQUFDO1FBQ3ZDLElBQUlGLFdBQVc7WUFDYixJQUFJO2dCQUNGSCxRQUFRTSxLQUFLQyxLQUFLLENBQUNKO1lBQ3JCLEVBQUUsT0FBT0ssR0FBRztnQkFDVkosYUFBYUssVUFBVSxDQUFDO1lBQzFCO1FBQ0Y7UUFDQVIsYUFBYTtJQUNmLEdBQUcsRUFBRTtJQUVMLE1BQU1OLFFBQVEsT0FBT2UsT0FBZUM7UUFDbENWLGFBQWE7UUFDYixJQUFJVyxPQUEyQkQsYUFBY0QsQ0FBQUEsTUFBTUcsUUFBUSxDQUFDLFdBQVcsVUFBVSxRQUFPO1FBRXhGLElBQUk7WUFDRixrREFBa0Q7WUFDbEQsTUFBTUMsTUFBTSxNQUFNdEIsb0RBQVNBLENBQUN1QixJQUFJLENBQUMsZUFBZTtnQkFDOUNMLE9BQU9BO2dCQUNQTSxVQUFVSixTQUFTLFVBQVUsYUFBYTtZQUM1QyxHQUFHSyxLQUFLLENBQUMsSUFBTTtZQUVmLE1BQU1DLFVBQXVCO2dCQUMzQkMsSUFBSUwsS0FBS00sTUFBTTFCLE1BQU15QixNQUFPUCxDQUFBQSxTQUFTLFVBQVUsSUFBSTtnQkFDbkRGLE9BQU9BO2dCQUNQVyxXQUFXVCxTQUFTLFVBQVUsMEJBQTBCO2dCQUN4REEsTUFBTUE7WUFDUjtZQUVBWixRQUFRa0I7WUFDUmQsYUFBYWtCLE9BQU8sQ0FBQyxhQUFhaEIsS0FBS2lCLFNBQVMsQ0FBQ0w7WUFFakQseUJBQXlCO1lBQ3pCLElBQUlOLFNBQVMsU0FBUztnQkFDcEJWLE9BQU9zQixJQUFJLENBQUM7WUFDZCxPQUFPO2dCQUNMdEIsT0FBT3NCLElBQUksQ0FBQztZQUNkO1FBQ0YsRUFBRSxPQUFPQyxLQUFLO1lBQ1pDLFFBQVFDLEtBQUssQ0FBQyxpQkFBaUJGO1FBQ2pDLFNBQVU7WUFDUnhCLGFBQWE7UUFDZjtJQUNGO0lBRUEsTUFBTUwsU0FBUztRQUNiSSxRQUFRO1FBQ1JJLGFBQWFLLFVBQVUsQ0FBQztRQUN4QlAsT0FBT3NCLElBQUksQ0FBQztJQUNkO0lBRUEscUJBQ0UsOERBQUMvQixZQUFZbUMsUUFBUTtRQUFDQyxPQUFPO1lBQUVuQztZQUFNQztZQUFPQztZQUFRQztRQUFVO2tCQUMzREU7Ozs7OztBQUdQLEVBQUU7QUFFSyxNQUFNK0IsVUFBVSxJQUFNMUMsaURBQVVBLENBQUNLLGFBQWEiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hZ3RlY2gtZnJvbnRlbmQvLi9zcmMvY29udGV4dC9BdXRoQ29udGV4dC50c3g/NmVlNCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgY3JlYXRlQ29udGV4dCwgdXNlQ29udGV4dCwgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgdXNlUm91dGVyIH0gZnJvbSBcIm5leHQvcm91dGVyXCI7XG5pbXBvcnQgeyBhcGlDbGllbnQgfSBmcm9tIFwiQC9zZXJ2aWNlcy9hcGlcIjtcblxuaW50ZXJmYWNlIFVzZXJQcm9maWxlIHtcbiAgaWQ6IG51bWJlcjtcbiAgZW1haWw6IHN0cmluZztcbiAgZnVsbF9uYW1lOiBzdHJpbmc7XG4gIHJvbGU6IFwiZmFybWVyXCIgfCBcImFkbWluXCI7XG59XG5cbmludGVyZmFjZSBBdXRoQ29udGV4dFR5cGUge1xuICB1c2VyOiBVc2VyUHJvZmlsZSB8IG51bGw7XG4gIGxvZ2luOiAoZW1haWw6IHN0cmluZywgcm9sZT86IFwiZmFybWVyXCIgfCBcImFkbWluXCIpID0+IFByb21pc2U8dm9pZD47XG4gIGxvZ291dDogKCkgPT4gdm9pZDtcbiAgaXNMb2FkaW5nOiBib29sZWFuO1xufVxuXG5jb25zdCBBdXRoQ29udGV4dCA9IGNyZWF0ZUNvbnRleHQ8QXV0aENvbnRleHRUeXBlPih7XG4gIHVzZXI6IG51bGwsXG4gIGxvZ2luOiBhc3luYyAoKSA9PiB7fSxcbiAgbG9nb3V0OiAoKSA9PiB7fSxcbiAgaXNMb2FkaW5nOiB0cnVlLFxufSk7XG5cbmV4cG9ydCBjb25zdCBBdXRoUHJvdmlkZXI6IFJlYWN0LkZDPHsgY2hpbGRyZW46IFJlYWN0LlJlYWN0Tm9kZSB9PiA9ICh7IGNoaWxkcmVuIH0pID0+IHtcbiAgY29uc3QgW3VzZXIsIHNldFVzZXJdID0gdXNlU3RhdGU8VXNlclByb2ZpbGUgfCBudWxsPihudWxsKTtcbiAgY29uc3QgW2lzTG9hZGluZywgc2V0SXNMb2FkaW5nXSA9IHVzZVN0YXRlPGJvb2xlYW4+KHRydWUpO1xuICBjb25zdCByb3V0ZXIgPSB1c2VSb3V0ZXIoKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIC8vIENoZWNrIHNhdmVkIHNlc3Npb24gaW4gbG9jYWxTdG9yYWdlXG4gICAgY29uc3Qgc2F2ZWRVc2VyID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJhZ3JpX3VzZXJcIik7XG4gICAgaWYgKHNhdmVkVXNlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgc2V0VXNlcihKU09OLnBhcnNlKHNhdmVkVXNlcikpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcImFncmlfdXNlclwiKTtcbiAgICAgIH1cbiAgICB9XG4gICAgc2V0SXNMb2FkaW5nKGZhbHNlKTtcbiAgfSwgW10pO1xuXG4gIGNvbnN0IGxvZ2luID0gYXN5bmMgKGVtYWlsOiBzdHJpbmcsIGZvcmNlUm9sZT86IFwiZmFybWVyXCIgfCBcImFkbWluXCIpID0+IHtcbiAgICBzZXRJc0xvYWRpbmcodHJ1ZSk7XG4gICAgbGV0IHJvbGU6IFwiZmFybWVyXCIgfCBcImFkbWluXCIgPSBmb3JjZVJvbGUgfHwgKGVtYWlsLmluY2x1ZGVzKFwiYWRtaW5cIikgPyBcImFkbWluXCIgOiBcImZhcm1lclwiKTtcbiAgICBcbiAgICB0cnkge1xuICAgICAgLy8gVHJ5IGJhY2tlbmQgYXV0aGVudGljYXRpb24gb3IgZGVmYXVsdCBkZW1vIG1vY2tcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGFwaUNsaWVudC5wb3N0KFwiL2F1dGgvbG9naW5cIiwge1xuICAgICAgICBlbWFpbDogZW1haWwsXG4gICAgICAgIHBhc3N3b3JkOiByb2xlID09PSBcImFkbWluXCIgPyBcImFkbWluMTIzXCIgOiBcInBhc3N3b3JkMTIzXCJcbiAgICAgIH0pLmNhdGNoKCgpID0+IG51bGwpO1xuXG4gICAgICBjb25zdCB1c2VyT2JqOiBVc2VyUHJvZmlsZSA9IHtcbiAgICAgICAgaWQ6IHJlcz8uZGF0YT8udXNlcj8uaWQgfHwgKHJvbGUgPT09IFwiYWRtaW5cIiA/IDIgOiAxKSxcbiAgICAgICAgZW1haWw6IGVtYWlsLFxuICAgICAgICBmdWxsX25hbWU6IHJvbGUgPT09IFwiYWRtaW5cIiA/IFwiQWdyaVRlY2ggU3lzdGVtIEFkbWluXCIgOiBcIkpvaG4gRGVlcmUgKEZhcm1lcilcIixcbiAgICAgICAgcm9sZTogcm9sZVxuICAgICAgfTtcblxuICAgICAgc2V0VXNlcih1c2VyT2JqKTtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiYWdyaV91c2VyXCIsIEpTT04uc3RyaW5naWZ5KHVzZXJPYmopKTtcblxuICAgICAgLy8gUm9sZS1CYXNlZCBSZWRpcmVjdGlvblxuICAgICAgaWYgKHJvbGUgPT09IFwiYWRtaW5cIikge1xuICAgICAgICByb3V0ZXIucHVzaChcIi9hZG1pblwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJvdXRlci5wdXNoKFwiL2Rhc2hib2FyZFwiKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJMb2dpbiBmYWlsZWQ6XCIsIGVycik7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldElzTG9hZGluZyhmYWxzZSk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGxvZ291dCA9ICgpID0+IHtcbiAgICBzZXRVc2VyKG51bGwpO1xuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwiYWdyaV91c2VyXCIpO1xuICAgIHJvdXRlci5wdXNoKFwiL1wiKTtcbiAgfTtcblxuICByZXR1cm4gKFxuICAgIDxBdXRoQ29udGV4dC5Qcm92aWRlciB2YWx1ZT17eyB1c2VyLCBsb2dpbiwgbG9nb3V0LCBpc0xvYWRpbmcgfX0+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9BdXRoQ29udGV4dC5Qcm92aWRlcj5cbiAgKTtcbn07XG5cbmV4cG9ydCBjb25zdCB1c2VBdXRoID0gKCkgPT4gdXNlQ29udGV4dChBdXRoQ29udGV4dCk7XG4iXSwibmFtZXMiOlsiUmVhY3QiLCJjcmVhdGVDb250ZXh0IiwidXNlQ29udGV4dCIsInVzZVN0YXRlIiwidXNlRWZmZWN0IiwidXNlUm91dGVyIiwiYXBpQ2xpZW50IiwiQXV0aENvbnRleHQiLCJ1c2VyIiwibG9naW4iLCJsb2dvdXQiLCJpc0xvYWRpbmciLCJBdXRoUHJvdmlkZXIiLCJjaGlsZHJlbiIsInNldFVzZXIiLCJzZXRJc0xvYWRpbmciLCJyb3V0ZXIiLCJzYXZlZFVzZXIiLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwiSlNPTiIsInBhcnNlIiwiZSIsInJlbW92ZUl0ZW0iLCJlbWFpbCIsImZvcmNlUm9sZSIsInJvbGUiLCJpbmNsdWRlcyIsInJlcyIsInBvc3QiLCJwYXNzd29yZCIsImNhdGNoIiwidXNlck9iaiIsImlkIiwiZGF0YSIsImZ1bGxfbmFtZSIsInNldEl0ZW0iLCJzdHJpbmdpZnkiLCJwdXNoIiwiZXJyIiwiY29uc29sZSIsImVycm9yIiwiUHJvdmlkZXIiLCJ2YWx1ZSIsInVzZUF1dGgiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/context/AuthContext.tsx\n");

/***/ }),

/***/ "./src/pages/_app.tsx":
/*!****************************!*\
  !*** ./src/pages/_app.tsx ***!
  \****************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ App)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/styles/globals.css */ \"./src/styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _context_AuthContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/context/AuthContext */ \"./src/context/AuthContext.tsx\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_context_AuthContext__WEBPACK_IMPORTED_MODULE_2__]);\n_context_AuthContext__WEBPACK_IMPORTED_MODULE_2__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\nfunction App({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_context_AuthContext__WEBPACK_IMPORTED_MODULE_2__.AuthProvider, {\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n            ...pageProps\n        }, void 0, false, {\n            fileName: \"C:\\\\Users\\\\Hello\\\\Desktop\\\\agtech\\\\agtech_frontend\\\\src\\\\pages\\\\_app.tsx\",\n            lineNumber: 8,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\Hello\\\\Desktop\\\\agtech\\\\agtech_frontend\\\\src\\\\pages\\\\_app.tsx\",\n        lineNumber: 7,\n        columnNumber: 5\n    }, this);\n}\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvcGFnZXMvX2FwcC50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUE4QjtBQUV1QjtBQUV0QyxTQUFTQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsU0FBUyxFQUFZO0lBQzVELHFCQUNFLDhEQUFDSCw4REFBWUE7a0JBQ1gsNEVBQUNFO1lBQVcsR0FBR0MsU0FBUzs7Ozs7Ozs7Ozs7QUFHOUIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hZ3RlY2gtZnJvbnRlbmQvLi9zcmMvcGFnZXMvX2FwcC50c3g/ZjlkNiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXCJAL3N0eWxlcy9nbG9iYWxzLmNzc1wiO1xuaW1wb3J0IHR5cGUgeyBBcHBQcm9wcyB9IGZyb20gXCJuZXh0L2FwcFwiO1xuaW1wb3J0IHsgQXV0aFByb3ZpZGVyIH0gZnJvbSBcIkAvY29udGV4dC9BdXRoQ29udGV4dFwiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBcHAoeyBDb21wb25lbnQsIHBhZ2VQcm9wcyB9OiBBcHBQcm9wcykge1xuICByZXR1cm4gKFxuICAgIDxBdXRoUHJvdmlkZXI+XG4gICAgICA8Q29tcG9uZW50IHsuLi5wYWdlUHJvcHN9IC8+XG4gICAgPC9BdXRoUHJvdmlkZXI+XG4gICk7XG59XG5cbiJdLCJuYW1lcyI6WyJBdXRoUHJvdmlkZXIiLCJBcHAiLCJDb21wb25lbnQiLCJwYWdlUHJvcHMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/pages/_app.tsx\n");

/***/ }),

/***/ "./src/services/api.ts":
/*!*****************************!*\
  !*** ./src/services/api.ts ***!
  \*****************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   apiClient: () => (/* binding */ apiClient),\n/* harmony export */   createCommunityPost: () => (/* binding */ createCommunityPost),\n/* harmony export */   createMission: () => (/* binding */ createMission),\n/* harmony export */   createSupportTicket: () => (/* binding */ createSupportTicket),\n/* harmony export */   fetchAnalyticsReport: () => (/* binding */ fetchAnalyticsReport),\n/* harmony export */   fetchAuditLogs: () => (/* binding */ fetchAuditLogs),\n/* harmony export */   fetchCommunityPosts: () => (/* binding */ fetchCommunityPosts),\n/* harmony export */   fetchCrops: () => (/* binding */ fetchCrops),\n/* harmony export */   fetchDetections: () => (/* binding */ fetchDetections),\n/* harmony export */   fetchFarms: () => (/* binding */ fetchFarms),\n/* harmony export */   fetchFields: () => (/* binding */ fetchFields),\n/* harmony export */   fetchProducts: () => (/* binding */ fetchProducts),\n/* harmony export */   fetchRovers: () => (/* binding */ fetchRovers),\n/* harmony export */   fetchSprayLogs: () => (/* binding */ fetchSprayLogs),\n/* harmony export */   fetchSupportTickets: () => (/* binding */ fetchSupportTickets),\n/* harmony export */   fetchWeather: () => (/* binding */ fetchWeather),\n/* harmony export */   inspectCropImage: () => (/* binding */ inspectCropImage),\n/* harmony export */   processFieldVideo: () => (/* binding */ processFieldVideo),\n/* harmony export */   sendRoverCommand: () => (/* binding */ sendRoverCommand)\n/* harmony export */ });\n/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ \"axios\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([axios__WEBPACK_IMPORTED_MODULE_0__]);\naxios__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\nconst API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || \"http://localhost:8000/api/v1\";\nconst apiClient = axios__WEBPACK_IMPORTED_MODULE_0__[\"default\"].create({\n    baseURL: API_BASE_URL,\n    headers: {\n        \"Content-Type\": \"application/json\"\n    }\n});\nconst fetchFarms = ()=>apiClient.get(\"/farms\").then((res)=>res.data);\nconst fetchFields = ()=>apiClient.get(\"/fields\").then((res)=>res.data);\nconst fetchCrops = ()=>apiClient.get(\"/crops\").then((res)=>res.data);\nconst fetchRovers = ()=>apiClient.get(\"/rovers\").then((res)=>res.data);\nconst sendRoverCommand = (roverId, command, params)=>apiClient.post(`/rovers/${roverId}/command`, {\n        command,\n        params\n    }).then((res)=>res.data);\nconst fetchDetections = ()=>apiClient.get(\"/detections\").then((res)=>res.data);\nconst inspectCropImage = (formData)=>apiClient.post(\"/detections/inspect-image\", formData, {\n        headers: {\n            \"Content-Type\": \"multipart/form-data\"\n        }\n    }).then((res)=>res.data);\nconst processFieldVideo = (formData)=>apiClient.post(\"/video-analysis/process\", formData, {\n        headers: {\n            \"Content-Type\": \"multipart/form-data\"\n        }\n    }).then((res)=>res.data);\nconst fetchSprayLogs = ()=>apiClient.get(\"/spraying/logs\").then((res)=>res.data);\nconst fetchWeather = ()=>apiClient.get(\"/weather/current\").then((res)=>res.data);\nconst fetchAnalyticsReport = ()=>apiClient.get(\"/reports/summary\").then((res)=>res.data);\nconst fetchSupportTickets = ()=>apiClient.get(\"/support/tickets\").then((res)=>res.data);\nconst createSupportTicket = (payload)=>apiClient.post(\"/support/tickets\", payload).then((res)=>res.data);\nconst fetchCommunityPosts = ()=>apiClient.get(\"/community/posts\").then((res)=>res.data);\nconst createCommunityPost = (payload)=>apiClient.post(\"/community/posts\", payload).then((res)=>res.data);\nconst fetchProducts = ()=>apiClient.get(\"/products\").then((res)=>res.data);\nconst fetchAuditLogs = ()=>apiClient.get(\"/audit/logs\").then((res)=>res.data);\nconst createMission = (payload)=>apiClient.post(\"/missions\", payload).then((res)=>res.data);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNDLENBQUFBLE1BQU9BLElBQUlDLElBQUksRUFBRTtBQUM3RSxNQUFNc0IsaUJBQWlCLElBQU05QixVQUFVSyxHQUFHLENBQUMsZUFBZUMsSUFBSSxDQUFDQyxDQUFBQSxNQUFPQSxJQUFJQyxJQUFJLEVBQUU7QUFDaEYsTUFBTXVCLGdCQUFnQixDQUFDTCxVQUFvQjFCLFVBQVVnQixJQUFJLENBQUMsYUFBYVUsU0FBU3BCLElBQUksQ0FBQ0MsQ0FBQUEsTUFBT0EsSUFBSUMsSUFBSSxFQUFFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYWd0ZWNoLWZyb250ZW5kLy4vc3JjL3NlcnZpY2VzL2FwaS50cz85NTZlIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcblxuY29uc3QgQVBJX0JBU0VfVVJMID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfQVBJX1VSTCB8fCBcImh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvdjFcIjtcblxuZXhwb3J0IGNvbnN0IGFwaUNsaWVudCA9IGF4aW9zLmNyZWF0ZSh7XG4gIGJhc2VVUkw6IEFQSV9CQVNFX1VSTCxcbiAgaGVhZGVyczoge1xuICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiXG4gIH1cbn0pO1xuXG5leHBvcnQgY29uc3QgZmV0Y2hGYXJtcyA9ICgpID0+IGFwaUNsaWVudC5nZXQoXCIvZmFybXNcIikudGhlbihyZXMgPT4gcmVzLmRhdGEpO1xuZXhwb3J0IGNvbnN0IGZldGNoRmllbGRzID0gKCkgPT4gYXBpQ2xpZW50LmdldChcIi9maWVsZHNcIikudGhlbihyZXMgPT4gcmVzLmRhdGEpO1xuZXhwb3J0IGNvbnN0IGZldGNoQ3JvcHMgPSAoKSA9PiBhcGlDbGllbnQuZ2V0KFwiL2Nyb3BzXCIpLnRoZW4ocmVzID0+IHJlcy5kYXRhKTtcbmV4cG9ydCBjb25zdCBmZXRjaFJvdmVycyA9ICgpID0+IGFwaUNsaWVudC5nZXQoXCIvcm92ZXJzXCIpLnRoZW4ocmVzID0+IHJlcy5kYXRhKTtcbmV4cG9ydCBjb25zdCBzZW5kUm92ZXJDb21tYW5kID0gKHJvdmVySWQ6IHN0cmluZywgY29tbWFuZDogc3RyaW5nLCBwYXJhbXM/OiBvYmplY3QpID0+XG4gIGFwaUNsaWVudC5wb3N0KGAvcm92ZXJzLyR7cm92ZXJJZH0vY29tbWFuZGAsIHsgY29tbWFuZCwgcGFyYW1zIH0pLnRoZW4ocmVzID0+IHJlcy5kYXRhKTtcblxuZXhwb3J0IGNvbnN0IGZldGNoRGV0ZWN0aW9ucyA9ICgpID0+IGFwaUNsaWVudC5nZXQoXCIvZGV0ZWN0aW9uc1wiKS50aGVuKHJlcyA9PiByZXMuZGF0YSk7XG5leHBvcnQgY29uc3QgaW5zcGVjdENyb3BJbWFnZSA9IChmb3JtRGF0YTogRm9ybURhdGEpID0+XG4gIGFwaUNsaWVudC5wb3N0KFwiL2RldGVjdGlvbnMvaW5zcGVjdC1pbWFnZVwiLCBmb3JtRGF0YSwge1xuICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJtdWx0aXBhcnQvZm9ybS1kYXRhXCIgfVxuICB9KS50aGVuKHJlcyA9PiByZXMuZGF0YSk7XG5cbmV4cG9ydCBjb25zdCBwcm9jZXNzRmllbGRWaWRlbyA9IChmb3JtRGF0YTogRm9ybURhdGEpID0+XG4gIGFwaUNsaWVudC5wb3N0KFwiL3ZpZGVvLWFuYWx5c2lzL3Byb2Nlc3NcIiwgZm9ybURhdGEsIHtcbiAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwibXVsdGlwYXJ0L2Zvcm0tZGF0YVwiIH1cbiAgfSkudGhlbihyZXMgPT4gcmVzLmRhdGEpO1xuXG5leHBvcnQgY29uc3QgZmV0Y2hTcHJheUxvZ3MgPSAoKSA9PiBhcGlDbGllbnQuZ2V0KFwiL3NwcmF5aW5nL2xvZ3NcIikudGhlbihyZXMgPT4gcmVzLmRhdGEpO1xuZXhwb3J0IGNvbnN0IGZldGNoV2VhdGhlciA9ICgpID0+IGFwaUNsaWVudC5nZXQoXCIvd2VhdGhlci9jdXJyZW50XCIpLnRoZW4ocmVzID0+IHJlcy5kYXRhKTtcbmV4cG9ydCBjb25zdCBmZXRjaEFuYWx5dGljc1JlcG9ydCA9ICgpID0+IGFwaUNsaWVudC5nZXQoXCIvcmVwb3J0cy9zdW1tYXJ5XCIpLnRoZW4ocmVzID0+IHJlcy5kYXRhKTtcbmV4cG9ydCBjb25zdCBmZXRjaFN1cHBvcnRUaWNrZXRzID0gKCkgPT4gYXBpQ2xpZW50LmdldChcIi9zdXBwb3J0L3RpY2tldHNcIikudGhlbihyZXMgPT4gcmVzLmRhdGEpO1xuZXhwb3J0IGNvbnN0IGNyZWF0ZVN1cHBvcnRUaWNrZXQgPSAocGF5bG9hZDogb2JqZWN0KSA9PiBhcGlDbGllbnQucG9zdChcIi9zdXBwb3J0L3RpY2tldHNcIiwgcGF5bG9hZCkudGhlbihyZXMgPT4gcmVzLmRhdGEpO1xuZXhwb3J0IGNvbnN0IGZldGNoQ29tbXVuaXR5UG9zdHMgPSAoKSA9PiBhcGlDbGllbnQuZ2V0KFwiL2NvbW11bml0eS9wb3N0c1wiKS50aGVuKHJlcyA9PiByZXMuZGF0YSk7XG5leHBvcnQgY29uc3QgY3JlYXRlQ29tbXVuaXR5UG9zdCA9IChwYXlsb2FkOiBvYmplY3QpID0+IGFwaUNsaWVudC5wb3N0KFwiL2NvbW11bml0eS9wb3N0c1wiLCBwYXlsb2FkKS50aGVuKHJlcyA9PiByZXMuZGF0YSk7XG5leHBvcnQgY29uc3QgZmV0Y2hQcm9kdWN0cyA9ICgpID0+IGFwaUNsaWVudC5nZXQoXCIvcHJvZHVjdHNcIikudGhlbihyZXMgPT4gcmVzLmRhdGEpO1xuZXhwb3J0IGNvbnN0IGZldGNoQXVkaXRMb2dzID0gKCkgPT4gYXBpQ2xpZW50LmdldChcIi9hdWRpdC9sb2dzXCIpLnRoZW4ocmVzID0+IHJlcy5kYXRhKTtcbmV4cG9ydCBjb25zdCBjcmVhdGVNaXNzaW9uID0gKHBheWxvYWQ6IG9iamVjdCkgPT4gYXBpQ2xpZW50LnBvc3QoXCIvbWlzc2lvbnNcIiwgcGF5bG9hZCkudGhlbihyZXMgPT4gcmVzLmRhdGEpO1xuIl0sIm5hbWVzIjpbImF4aW9zIiwiQVBJX0JBU0VfVVJMIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX0FQSV9VUkwiLCJhcGlDbGllbnQiLCJjcmVhdGUiLCJiYXNlVVJMIiwiaGVhZGVycyIsImZldGNoRmFybXMiLCJnZXQiLCJ0aGVuIiwicmVzIiwiZGF0YSIsImZldGNoRmllbGRzIiwiZmV0Y2hDcm9wcyIsImZldGNoUm92ZXJzIiwic2VuZFJvdmVyQ29tbWFuZCIsInJvdmVySWQiLCJjb21tYW5kIiwicGFyYW1zIiwicG9zdCIsImZldGNoRGV0ZWN0aW9ucyIsImluc3BlY3RDcm9wSW1hZ2UiLCJmb3JtRGF0YSIsInByb2Nlc3NGaWVsZFZpZGVvIiwiZmV0Y2hTcHJheUxvZ3MiLCJmZXRjaFdlYXRoZXIiLCJmZXRjaEFuYWx5dGljc1JlcG9ydCIsImZldGNoU3VwcG9ydFRpY2tldHMiLCJjcmVhdGVTdXBwb3J0VGlja2V0IiwicGF5bG9hZCIsImZldGNoQ29tbXVuaXR5UG9zdHMiLCJjcmVhdGVDb21tdW5pdHlQb3N0IiwiZmV0Y2hQcm9kdWN0cyIsImZldGNoQXVkaXRMb2dzIiwiY3JlYXRlTWlzc2lvbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/services/api.ts\n");

/***/ }),

/***/ "./src/styles/globals.css":
/*!********************************!*\
  !*** ./src/styles/globals.css ***!
  \********************************/
/***/ (() => {



/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react-dom":
/*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("react-dom");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "react/jsx-runtime":
/*!************************************!*\
  !*** external "react/jsx-runtime" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ }),

/***/ "axios":
/*!************************!*\
  !*** external "axios" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = import("axios");;

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc"], () => (__webpack_exec__("./src/pages/_app.tsx")));
module.exports = __webpack_exports__;

})();