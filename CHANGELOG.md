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
