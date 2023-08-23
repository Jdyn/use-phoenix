# use-phoenix

## Note
If you happen to come across this package somehow, note this is a very early stage and things probably don't work entirely. This has mainly been used internally by me and does not support or guarantee a lot of functionality outside of the "happy path" of Phoenix channels usage. The API is very subject to change quickly.

## Usage
Usage of the hooks requires a `PhoenixProvider` to be placed somewhere within your application
```tsx
// App.tsx
import { PhoenixProvider } from 'use-phoenix';

const Application = () => {

	return (
		<PhoenixProvider>

		</PhoenixProvider>
	)
}
```

There are two ways to connect to your Phoenix server:

1. Passing a `url` prop to your `PhoenixProvder` along with your necessary parameters:
	```tsx
	return (
		<PhoenixProvider
			url="ws://localhost:4000/socket"
			options={{ 
				params: { token: 'xyz' }
			}}
		>

		</PhoenixProvider>
	)
	```
2. utilizing the `usePhoenix` hook to connect lazily:

	Provide your `PhoenixProvider` **without** a `url`:
   ```tsx
	 // App.tsx
	 return (
		<PhoenixProvider>

		</PhoenixProvider>
	 )
	 ```
	Later on when you would like to connect the socket:
	```ts
	// Component.tsx
	import { usePhoenix } from 'use-phoenix';

	const Component = () => {
		const { socket, connect } = usePhoenix();

		useEffect(() => {
			connect('ws://localhost:4000/socket', {
				params: { token: 'xyz' }
			})

		}, [connect])
	}
	```
### Listening for events - `useEvent` & `useChannel`
Example:
```tsx
// typechecking the event responses:
type joinEvent = {
	event: 'join',
	response: {
		members: Record<string, User>
	}
}

const channel = useChannel('chat:lobby')

// pass in a channel directly
useEvent<JoinEvent>(channel, 'join', (response) => {
	...
})

// pass in a channel topic and let the hook manage the channel
useEvent<JoinEvent>('chat:lobby', 'join', (response) => {
	...
})
```
