# 0.0.1-alpha.7

2023-12-27

### Breaking changes
None

### Additional changes
* Fix buggy behavior where the reference to `useChannel` functions would be changing on every render. This would cause your useEffects to run even if there should be no change.

# 0.0.1-alpha.6

2023-12-23

### Breaking changes
None

### Additional changes
* Fixed a bug where if you successfully connected to a channel, but then later on the topic supplied to `useChannel` had changed to `null` and then back to the valid topic, the `useChannel` hook functions like `push` would no longer be holding a valid reference to the channel. Now, the hook will successfully update the reference and the functions will work as if the channel topic never changed.
* Use the internel channel `ref` when using `useChannel`'s `leave`
# 0.0.1-alpha.5

2023-12-17

### Breaking changes
* The typescript type for `useChannel`'s `PushEvent` now aligns with the rest of the types
```jsx
type PushEvent = {
	- type: string;
	+ event: string;

	- payload?: Record<string, any>
	+ data?: Record<string, any>
}
```

### Additional changes
* Added rollup build tooling which should reduce bundle size slightly
* Phoenix.js is now marked as a peer dependency
* `useChannel` can now accept a short circuit operation to delay connecting to the channel until the condition is met.

	```jsx
	// Delay connecting until id is defined
	const [channel] = useChannel(id && `room:${id}`)
	```
* The `push` function type has been improved to catch more potential errors.
