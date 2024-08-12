# 0.0.2

2024-4-5

### Breaking changes
- before a channel connects, `data` is now `undefined` rather than `null`

- **basic `useEvent` data caching**

  The last response from any `useEvent` is cached across all instances. This means that if if you recieve any event for a channel topic, and for example the `useEvent` hook unmounts, once it remounts, it will instantly load the last recieved data and state for the given `event`.

  Previously if you recieved an event and the hook unmounted and remounted, the data stored in the `useEvent` hook was lost and you have needed to recieve the event again to get the data back.

  Once you leave a channel using `leave()` all cached data for the `useEvent` will be cleared.

### Additional changes
- `useChannel` now accepts a `passive` option

  `passive` will instruct the channel to wait for another instance of `useChannel` to connect with the necessary params and then once a connection is made, the `passive` channel will connect itself. See the js docs for more information.
# 0.0.1

2024-2-15

I have been using this version enough in a few complex projects and has been performing very well. I'd like to move away from alpha version and just iterate versions normally. I feel the API is pretty stable at this point and I am not anticipating much more deviation except for `usePresence`. The `usePresence` hook will need to be looked at in more depth to understand the most common access patterns and provide an API that applies to the most people. Currently it deviates quite a bit from the vanilla SDK in terms of the outputted data.

### Breaking changes

- Completely remove calling `useEvent` with a `string` channel topic.
  - The benefit was reusing existing channels but `useChannel` now does it inherently by default. Additionally you usually want access to important channel metadata and functions like `push` and `leave` which you simply did not get if you used a channel `string`. It is possible I reintroduce it in the future but it adds some more complexity and was not working consistently.

### Additional changes

- Calling `useChannel` on the same channel topic across any number of components should just work, and keep all components connected and listening. Additionally, the state object should be consistent across all `useChannel` topics across components.

- expose an `isConnected` boolean inside `usePhoenix` to know when the socket has officially connected. This is useful for example, in cases when you want to request data with push right when the socket connects, and you dont want to specify the socket itself as a dependency to the useEffect since it would trigger the useEffect many times.
# 0.0.1-alpha.8

2023-1-05

### Breaking changes
None

### Additional changes
* Fix a bug where a component re-render would cause `useEvent` to stop listening and responding to the event correctly if `leave` was recently called.

# 0.0.1-alpha.7

2023-12-27

### Breaking changes

None

### Additional changes

- Fix buggy behavior where the reference to `useChannel` functions would be changing on every render. This would cause your useEffects to run even if there should be no change.

# 0.0.1-alpha.6

2023-12-23

### Breaking changes

None

### Additional changes

- Fixed a bug where if you successfully connected to a channel, but then later on the topic supplied to `useChannel` had changed to `null` and then back to the valid topic, the `useChannel` hook functions like `push` would no longer be holding a valid reference to the channel. Now, the hook will successfully update the reference and the functions will work as if the channel topic never changed.
- Use the internel channel `ref` when using `useChannel`'s `leave`

# 0.0.1-alpha.5

2023-12-17

### Breaking changes

- The typescript type for `useChannel`'s `PushEvent` now aligns with the rest of the types

```jsx
type PushEvent = {
	- type: string;
	+ event: string;

	- payload?: Record<string, any>
	+ data?: Record<string, any>
}
```

### Additional changes

- Added rollup build tooling which should reduce bundle size slightly
- Phoenix.js is now marked as a peer dependency
- `useChannel` can now accept a short circuit operation to delay connecting to the channel until the condition is met.

  ```jsx
  // Delay connecting until id is defined
  const [channel] = useChannel(id && `room:${id}`);
  ```

- The `push` function type has been improved to catch more potential errors.
