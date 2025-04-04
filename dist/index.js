"use strict";var n=require("react"),e=require("phoenix");function r(){return r=Object.assign?Object.assign.bind():function(n){for(var e=1;e<arguments.length;e++){var r=arguments[e];for(var t in r)({}).hasOwnProperty.call(r,t)&&(n[t]=r[t])}return n},r.apply(null,arguments)}var t,o,u={exports:{}},i={};var c=(o||(o=1,u.exports=function(){if(t)return i;t=1;var e=n,r=Symbol.for("react.element"),o=Symbol.for("react.fragment"),u=Object.prototype.hasOwnProperty,c=e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,s={key:!0,ref:!0,__self:!0,__source:!0};function f(n,e,t){var o,i={},f=null,a=null;for(o in void 0!==t&&(f=""+t),void 0!==e.key&&(f=""+e.key),void 0!==e.ref&&(a=e.ref),e)u.call(e,o)&&!s.hasOwnProperty(o)&&(i[o]=e[o]);if(n&&n.defaultProps)for(o in e=n.defaultProps)void 0===i[o]&&(i[o]=e[o]);return{$$typeof:r,type:n,key:f,ref:a,props:i,_owner:c.current}}return i.Fragment=o,i.jsx=f,i.jsxs=f,i}()),u.exports),s=n.createContext(null),f=function(){var e=n.useContext(s);if(null===e)throw new Error("usePhoenix must be used within a PhoenixProvider");return e},a=["url","options"],l=new Map;var v=function(e){var r=n.useRef(e);return r.current=e,r},p=function(n,e){if("string"==typeof e)return null==n?void 0:n.channels.find((function(n){return n.topic===e}))},d=function(n,e,r,t,o,u){return{isSuccess:n,isLoading:e,isError:r,error:t,data:o,status:u}},h=new Map,y={data:void 0,status:"joining",isSuccess:!1,isLoading:!0,isError:!1,error:null},x=function(n,e){h.set(n,e)},E=function(n){if("string"!=typeof n)return y;var e=h.get(n);return e||y};exports.PhoenixProvider=function(r){var t=r.url,o=r.options,u=function(n,e){if(null==n)return{};var r={};for(var t in n)if({}.hasOwnProperty.call(n,t)){if(-1!==e.indexOf(t))continue;r[t]=n[t]}return r}(r,a),i=u.children,f=u.onOpen,v=u.onClose,p=u.onError,d=n.useState(null),h=d[0],y=d[1],x=n.useState(!1),E=x[0],_=x[1],g=n.useState(!1),P=g[0],k=g[1],O=n.useRef(h),C=n.useMemo((function(){return o}),[o]),S=n.useCallback((function(n){n.onMessage((function(n){var e=n.event,r=n.payload,t=n.topic;"phx_reply"!==e&&("phx_close"===e?l.forEach((function(n,e){e.startsWith(t+":")&&l.delete(e)})):l.set(t+":"+e,r))})),f&&n.onOpen(f),v&&n.onClose(v),p&&n.onError(p),n.onOpen((function(){_(!0),k(!1)})),n.onClose((function(){_(!1),k(!1)})),n.onError((function(){_(!1),k(!0)}))}),[v,p,f]),m=n.useCallback((function(n,r){var t=new e.Socket(n,null!=r?r:{});return t.connect(),O.current=t,y(t),S(t),t}),[]);return n.useEffect((function(){if(t){var n=m(t,C||{});return function(){t&&n.disconnect()}}}),[t,C,m]),c.jsx(s.Provider,{value:{socket:O.current,connect:m,isConnected:E,isError:P},children:i})},exports.useChannel=function(t,o){var u=f(),i=u.socket,c=u.isConnected,s=n.useState(p(i,t)),a=s[0],l=s[1],h=n.useRef(null),_=n.useState(E(t)),g=_[0],P=_[1],k=v(o),O=n.useRef(void 0),C=n.useCallback((function(n){l(n),h.current=n;var e=n.topic;"joining"===n.state?n.on("phx_reply",(function(){P(E(e))})):P(E(e))}),[l,P]);n.useEffect((function(){var n,e,r,o;if(i&&(c&&"string"==typeof t&&!(null!=(n=null==(e=k.current)?void 0:e.passive)&&n))){var u=null!=(r=null==(o=k.current)?void 0:o.params)?r:{},s=i.channel(t,u);return s.join().receive("ok",(function(n){var e=d(!0,!1,!1,null,n,"success");x(t,e),P(e)})).receive("error",(function(n){var e=d(!1,!1,!0,n,void 0,"error");P(e)})).receive("timeout",(function(){P(d(!1,!1,!0,null,void 0,"connection timeout"))})),s.onError((function(n){var e=d(!1,!1,!0,n,void 0,"error");P(e)})),s.on("phx_error",(function(){var n=d(!1,!1,!0,null,void 0,"internal server error");P(n)})),l(s),h.current=s,function(){s&&s.joinPush&&(s.joinPush.recHooks=[])}}}),[c,t,C]),n.useEffect((function(){var n,e;null!=(n=null==(e=k.current)?void 0:e.passive)&&n&&i&&c&&"string"==typeof t&&(O.current=i.onMessage((function(n){var e=n.topic;if(null===h.current&&e===t){var r=p(i,t);r&&C(r)}})))}),[c,t,C]),n.useEffect((function(){return function(){var n,e;null!=(n=null==(e=k.current)?void 0:e.passive)&&n&&a&&i&&O.current&&(i.off([O.current]),O.current=void 0)}}),[]);var S=n.useCallback((function(n,e){return null===h.current?Promise.reject("Channel is not connected."):function(n){return new Promise((function(e,r){n.receive("ok",e).receive("error",r)}))}(h.current.push(n,null!=e?e:{}))}),[]),m=n.useCallback((function(){h.current instanceof e.Channel&&(h.current.leave(),l(void 0),P(y))}),[]);return[a,r({},g,{push:S,leave:m})]},exports.useEvent=function(e,r,t){var o=v(t),u=n.useState(!1),i=u[0],c=u[1],s=n.useState(l.get((null==e?void 0:e.topic)+":"+r)),f=s[0],a=s[1];return n.useEffect((function(){if(e&&"string"==typeof r){if(!i){c(!0);var n=l.get(e.topic+":"+r);n&&("function"==typeof o.current&&o.current(n),a(n))}var t=e.on(r,(function(n){"function"==typeof o.current&&o.current(n),a(n)}));return function(){e.off(r,t)}}}),[e,r,o]),{data:f}},exports.usePhoenix=f,exports.usePresence=function(t){var o=n.useState({}),u=o[0],i=o[1],c=f().socket;return n.useEffect((function(){if(c&&t){var n=c.channel(t,{});return n.on("presence_state",(function(n){i((function(t){if(0===Object.keys(t).length)return n;var o=r({},t);return e.Presence.syncState(o,n)}))})),n.on("presence_diff",(function(n){i((function(t){var o=r({},t);return e.Presence.syncDiff(o,n)}))})),n.join(),function(){n.leave(),i({})}}return function(){}}),[c,i,t]),n.useMemo((function(){return u?Object.keys(u).map((function(n){var e=u[n].metas;return Array.isArray(e)&&1===e.length&&(e=e[0]),r({id:n},u[n],{metas:e})})):[]}),[u])};
//# sourceMappingURL=index.js.map
