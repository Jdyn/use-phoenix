import require$$0, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Socket, Channel, Presence } from 'phoenix';

function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function (n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}
function _objectWithoutPropertiesLoose(r, e) {
  if (null == r) return {};
  var t = {};
  for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
    if (-1 !== e.indexOf(n)) continue;
    t[n] = r[n];
  }
  return t;
}

var jsxRuntime = {exports: {}};

var reactJsxRuntime_production_min = {};

/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactJsxRuntime_production_min;

function requireReactJsxRuntime_production_min () {
	if (hasRequiredReactJsxRuntime_production_min) return reactJsxRuntime_production_min;
	hasRequiredReactJsxRuntime_production_min = 1;
var f=require$$0,k=Symbol.for("react.element"),l=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,n=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:true,ref:true,__self:true,__source:true};
	function q(c,a,g){var b,d={},e=null,h=null;void 0!==g&&(e=""+g);void 0!==a.key&&(e=""+a.key);void 0!==a.ref&&(h=a.ref);for(b in a)m.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps,a) void 0===d[b]&&(d[b]=a[b]);return {$$typeof:k,type:c,key:e,ref:h,props:d,_owner:n.current}}reactJsxRuntime_production_min.Fragment=l;reactJsxRuntime_production_min.jsx=q;reactJsxRuntime_production_min.jsxs=q;
	return reactJsxRuntime_production_min;
}

var hasRequiredJsxRuntime;

function requireJsxRuntime () {
	if (hasRequiredJsxRuntime) return jsxRuntime.exports;
	hasRequiredJsxRuntime = 1;

	{
	  jsxRuntime.exports = requireReactJsxRuntime_production_min();
	}
	return jsxRuntime.exports;
}

var jsxRuntimeExports = requireJsxRuntime();

var PhoenixContext = /*#__PURE__*/require$$0.createContext(null);
var usePhoenix = function usePhoenix() {
  var context = require$$0.useContext(PhoenixContext);
  if (context === null) throw new Error('usePhoenix must be used within a PhoenixProvider');
  return context;
};

var _excluded = ["url", "options"];
var cache$2 = new Map();
function PhoenixProvider(_ref) {
  var url = _ref.url,
    options = _ref.options,
    props = _objectWithoutPropertiesLoose(_ref, _excluded);
  var children = props.children,
    onOpen = props.onOpen,
    onClose = props.onClose,
    onError = props.onError;
  var _useState = useState(null),
    socket = _useState[0],
    set = _useState[1];
  var _useState2 = useState(false),
    isConnected = _useState2[0],
    setConnected = _useState2[1];
  var _useState3 = useState(false),
    isError = _useState3[0],
    setError = _useState3[1];
  var socketRef = useRef(socket);
  var _options = useMemo(function () {
    return options;
  }, [options]);
  var defaultListeners = useCallback(function (socket) {
    socket.onMessage(function (_ref2) {
      var event = _ref2.event,
        payload = _ref2.payload,
        topic = _ref2.topic;
      if (event === 'phx_reply') return;
      if (event === 'phx_close') {
        cache$2.forEach(function (_, key) {
          if (key.startsWith(topic + ":")) {
            cache$2["delete"](key);
          }
        });
      } else {
        cache$2.set(topic + ":" + event, payload);
      }
    });
    if (onOpen) socket.onOpen(onOpen);
    if (onClose) socket.onClose(onClose);
    if (onError) socket.onError(onError);
    socket.onOpen(function () {
      setConnected(true);
      setError(false);
    });
    socket.onClose(function () {
      setConnected(false);
      setError(false);
    });
    socket.onError(function () {
      setConnected(false);
      setError(true);
    });
  }, [onClose, onError, onOpen]);
  var connect = useCallback(function (url, options) {
    var socket = new Socket(url, options != null ? options : {});
    socket.connect();
    socketRef.current = socket;
    set(socket);
    defaultListeners(socket);
    return socket;
  }, []);
  useEffect(function () {
    if (!url) return;
    var socket = connect(url, _options || {});
    return function () {
      if (url) socket.disconnect();
    };
  }, [url, _options, connect]);
  return jsxRuntimeExports.jsx(PhoenixContext.Provider, {
    value: {
      socket: socketRef.current,
      connect: connect,
      isConnected: isConnected,
      isError: isError
    },
    children: children
  });
}

var useLatest = (function (val) {
  var ref = useRef(val);
  ref.current = val;
  return ref;
});

var findChannel = function findChannel(socket, topic) {
  if (typeof topic !== 'string') return undefined;
  return socket == null ? void 0 : socket.channels.find(function (channel) {
    return channel.topic === topic;
  });
};
var createMeta = function createMeta(isSuccess, isLoading, isError, error, data, status) {
  return {
    isSuccess: isSuccess,
    isLoading: isLoading,
    isError: isError,
    error: error,
    data: data,
    status: status
  };
};
var pushPromise = function pushPromise(push) {
  return new Promise(function (resolve, reject) {
    push.receive('ok', resolve).receive('error', reject);
  });
};

var cache = new Map();
var defaultMeta = {
  data: undefined,
  status: 'joining',
  isSuccess: false,
  isLoading: true,
  isError: false,
  error: null
};
var cache$1 = {
  insert: function insert(topic, channelMeta) {
    cache.set(topic, channelMeta);
  },
  get: function get(topic) {
    if (typeof topic !== 'string') return defaultMeta;
    var result = cache.get(topic);
    if (result) {
      return result;
    } else {
      return defaultMeta;
    }
  },
  "delete": function _delete(topic) {
    return cache["delete"](topic);
  }
};

/**
 * A hook to open a new Phoenix channel, or attach to an existing one
 * that has been opened by another component.
 *
 * Note If the channel is already open, the hook will return the existing
 * channel and state.
 *
 * This behavior differs from Phoenix.js where any time you create
 * a new channel, it will close the existing one. This hook will not close
 * the existing channel and instead attaches to it.
 *
 * This is useful for when you have multiple components that need to interact
 * with the same channel.
 *
 * @example
 * ```ts
 *	const [channel, { push, leave, data }] = useChannel('room:1', { params: { token: '123' } });
 *	useEvent(channel, 'new_message', handleMessage);
 * ```
 *
 * @param topic - the topic to connect to.
 * @param options - options for the channel.
 *  - `params` - The params to send to the server when joining the channel.
 *  - `passive` - A boolean indicating whether the channel should wait until another `useChannel` hook has connected to the topic instead of trying to connect itself.
 */
function useChannel(topic, _options) {
  var _usePhoenix = usePhoenix(),
    socket = _usePhoenix.socket,
    isConnected = _usePhoenix.isConnected;
  var _useState = useState(findChannel(socket, topic)),
    channel = _useState[0],
    set = _useState[1];
  var channelRef = useRef(null);
  var _useState2 = useState(cache$1.get(topic)),
    meta = _useState2[0],
    setMeta = _useState2[1];
  var optionsRef = useLatest(_options);
  var messageRef = useRef(undefined);
  var handleJoin = useCallback(function (_channel) {
    /* If we find an existing channel with this topic,
        we reconect our internal reference. */
    set(_channel);
    channelRef.current = _channel;
    var _topic = _channel.topic;
    if (_channel.state === 'joining') {
      _channel.on('phx_reply', function () {
        /* It is possible that we found an existing channel
            but it has not yet fully joined. In this case, we want to
            listen in on phx_reply, to update our meta from the
            useChannel that is actually doing the join()  */
        setMeta(cache$1.get(_topic));
      });
    } else {
      setMeta(cache$1.get(_topic));
    }
  }, [set, setMeta]);
  useEffect(function () {
    var _optionsRef$current$p, _optionsRef$current, _optionsRef$current$p2, _optionsRef$current2;
    if (!socket) return;
    if (!isConnected) return;
    if (typeof topic !== 'string') return;
    var isPassive = (_optionsRef$current$p = (_optionsRef$current = optionsRef.current) == null ? void 0 : _optionsRef$current.passive) != null ? _optionsRef$current$p : false;
    if (isPassive) return;
    // Reusing the exising channel doesn't seem to work
    // when re-connecting to the socket after a disconnect.
    // const existingChannel = findChannel(socket, topic);
    // if (existingChannel) {
    //   return handleJoin(existingChannel);
    // }
    var params = (_optionsRef$current$p2 = (_optionsRef$current2 = optionsRef.current) == null ? void 0 : _optionsRef$current2.params) != null ? _optionsRef$current$p2 : {};
    var _channel = socket.channel(topic, params);
    var recieveOk = function recieveOk(response) {
      var meta = createMeta(true, false, false, null, response, 'success');
      cache$1.insert(topic, meta);
      setMeta(meta);
    };
    var recieveError = function recieveError(error) {
      var meta = createMeta(false, false, true, error, undefined, 'error');
      setMeta(meta);
    };
    var recieveTimeout = function recieveTimeout() {
      setMeta(createMeta(false, false, true, null, undefined, 'connection timeout'));
    };
    var onError = function onError(error) {
      var meta = createMeta(false, false, true, error, undefined, 'error');
      setMeta(meta);
    };
    var onPhxError = function onPhxError() {
      var meta = createMeta(false, false, true, null, undefined, 'internal server error');
      setMeta(meta);
    };
    _channel.join().receive('ok', recieveOk).receive('error', recieveError).receive('timeout', recieveTimeout);
    _channel.onError(onError);
    _channel.on('phx_error', onPhxError);
    set(_channel);
    channelRef.current = _channel;
    return function () {
      if (_channel) {
        /*
          So the problem is that these .recieve() functions stay persisted even after this hook
          has potentially moved on to an entirely different topic.
                   So consider the following scenario:
            - we connect on topic 'room:1' and we error. That is, we aren't permitted to enter.
            - Then, using the same hook, we connect to room:2 and we are permitted.
            - Since the first one errored, **and the socket has configured rejoin() timeouts**,
              the socket will attempt to rejoin 'room:1' even though we have already moved
              on to 'room:2'. The rejoin attempt will actually call the recieve functions
              and be able to update the state of the hook, even though we are no longer
              interested in that topic.
                     - So, we will be in a success state after joining 'room:2', and then rejoin will
              trigger and the recieve('ok') will be called, and since it's for room:1, it will
              update the state of the hook back into an error state.
                     - Here, once the topic changes, we remove all recieve hooks to prevent this from happening.
            - So the rejoin() attempt will be called, but this hook won't be listening!
                   This can be entirely avoided if, the hook-user correctly calls leave() when the `room:1` join
          fails, but that's not a guarantee, and I think the expected behavior is that the hook no
          longer cares about it's previous topic.
        */
        // @ts-ignore
        if (_channel.joinPush) _channel.joinPush.recHooks = [];
      }
    };
  }, [isConnected, topic, handleJoin]);
  useEffect(function () {
    var _optionsRef$current$p3, _optionsRef$current3;
    var isPassive = (_optionsRef$current$p3 = (_optionsRef$current3 = optionsRef.current) == null ? void 0 : _optionsRef$current3.passive) != null ? _optionsRef$current$p3 : false;
    if (!isPassive) return;
    if (!socket) return;
    if (!isConnected) return;
    if (typeof topic !== 'string') return;
    messageRef.current = socket.onMessage(function (_ref) {
      var _topic = _ref.topic;
      if (channelRef.current === null && _topic === topic) {
        var _channel2 = findChannel(socket, topic);
        if (_channel2) handleJoin(_channel2);
      }
    });
  }, [isConnected, topic, handleJoin]);
  useEffect(function () {
    return function () {
      var _optionsRef$current$p4, _optionsRef$current4;
      var isPassive = (_optionsRef$current$p4 = (_optionsRef$current4 = optionsRef.current) == null ? void 0 : _optionsRef$current4.passive) != null ? _optionsRef$current$p4 : false;
      if (isPassive && channel && socket && messageRef.current) {
        socket.off([messageRef.current]);
        messageRef.current = undefined;
      }
    };
  }, []);
  /**
   * Pushes an event to the channel.
   *
   * @param event - The event to push.
   * @param payload - The payload to send with the event.
   * @returns Promise
   */
  var push = useCallback(function (event, payload) {
    if (channelRef.current === null) return Promise.reject('Channel is not connected.');
    return pushPromise(channelRef.current.push(event, payload != null ? payload : {}));
  }, []);
  /**
   * Allows you to leave the channel.
   *
   * useChannel does not automatically leave the channel when the component unmounts by default. If
   * you want to leave the channel when the component unmounts, you can use a useEffect:
   *
   * @example
   * ```ts
   *  useEffect(() => {
   *    return () => {
   *      leave();
   *    };
   *  }, []);
   * ```
   * @returns void
   */
  var leave = useCallback(function () {
    if (channelRef.current instanceof Channel) {
      channelRef.current.leave();
      set(undefined);
      setMeta(defaultMeta);
    }
  }, []);
  return [channel, _extends({}, meta, {
    push: push,
    leave: leave
  })];
}

/**
 * A hook to subscribe to a Phoenix Channel event.
 *
 * You may obtain the event data from the `data` property and/or the `listener` callback.
 *
 * @example
 * ```ts
 * 	type NewMessageEvent = {
 *			event: 'new_message';
 *			data: { message: string };
 * 	};
 *
 *	const [channel, state] = useChannel('room:1');
 *	const { data } = useEvent<NewMessageEvent>(channel, 'new_message', handleMessage);
 * ```
 *
 *
 * @param channel - A `Channel` provided by `useChannel`.
 * @param event - The event name to listen for.
 * @param listener - The callback function to invoke when the event is received.
 *
 * @returns The data from the event.
 */
function useEvent(channel, event, listener) {
  var handler = useLatest(listener);
  var _useState = useState(false),
    loaded = _useState[0],
    setLoaded = _useState[1];
  var _useState2 = useState(cache$2.get((channel == null ? void 0 : channel.topic) + ":" + event)),
    data = _useState2[0],
    setData = _useState2[1];
  useEffect(function () {
    if (!channel) return;
    if (typeof event !== 'string') return;
    if (!loaded) {
      setLoaded(true);
      var _data = cache$2.get(channel.topic + ":" + event);
      if (_data) {
        if (typeof handler.current === 'function') {
          handler.current(_data);
        }
        setData(_data);
      }
    }
    var ref = channel.on(event, function (message) {
      if (typeof handler.current === 'function') {
        handler.current(message);
      }
      setData(message);
    });
    return function () {
      channel.off(event, ref);
    };
  }, [channel, event, handler]);
  return {
    data: data
  };
}

function usePresence(topic) {
  var _useState = useState({}),
    _presence = _useState[0],
    _setPresence = _useState[1];
  var _usePhoenix = usePhoenix(),
    socket = _usePhoenix.socket;
  useEffect(function () {
    if (socket && topic) {
      var channel = socket.channel(topic, {});
      channel.on('presence_state', function (newState) {
        _setPresence(function (prevState) {
          if (Object.keys(prevState).length === 0) return newState;
          var nextState = _extends({}, prevState);
          return Presence.syncState(nextState, newState);
        });
      });
      channel.on('presence_diff', function (newDiff) {
        _setPresence(function (prevState) {
          // Note that prevState might be empty, we still need to sync it
          var nextState = _extends({}, prevState);
          return Presence.syncDiff(nextState, newDiff);
        });
      });
      channel.join();
      return function () {
        channel.leave();
        _setPresence({});
      };
    }
    return function () {};
  }, [socket, _setPresence, topic]);
  var items = useMemo(function () {
    return _presence ? Object.keys(_presence).map(function (key) {
      var metas = _presence[key].metas;
      if (Array.isArray(metas) && metas.length === 1) {
        metas = metas[0];
      }
      return _extends({
        id: key
      }, _presence[key], {
        metas: metas
      });
    }) : [];
  }, [_presence]);
  return items;
}

export { PhoenixProvider, useChannel, useEvent, usePhoenix, usePresence };
//# sourceMappingURL=index.esm.js.map
