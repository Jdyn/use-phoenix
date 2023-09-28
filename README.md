# use-phoenix

## Note
If you happen to come across this package somehow, note this is a very early stage and things probably don't work entirely. This has mainly been used internally by me and does not support or guarantee a lot of functionality outside of the "happy path" of Phoenix channels usage. The API is very subject to change quickly.

If you do use this package, I would love to hear how it is working for you and any issues you find.

## Usage
Usage of the hooks requires a `PhoenixProvider` to be placed somewhere within your application
```tsx
// App.tsx
import { PhoenixProvider } from 'use-phoenix';

const Application = () => {

	return (
		<PhoenixProvider>
		...
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
		...
		</PhoenixProvider>
	)
	```
2. utilizing the `usePhoenix` hook to connect lazily:

	Provide your `PhoenixProvider` **without** a `url`:
   ```tsx
	 // App.tsx
	 return (
		<PhoenixProvider>
		...
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
...
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

// OR pass in a channel topic and let the hook create the channel internally
useEvent<JoinEvent>('chat:lobby', 'join', (response) => {
	// response.members typed properly
	setMembers(response.members)
})
```
## usePresence
Quickly setup presence tracking by connecting to your presence channel
```tsx
const users = usePresence('room:lobby');
```
the response is transformed to make it easier to use. Typically it is an object of `id: { ..., metas: [{ ... }] }`. In my use case, the `metas` field is always an array of one object, and i found myself having to constantly drill into the first index `metas[0]`. The hook automatically returns `metas[0]` if the metas field is a single index array.

The response takes the form:
```js
[
	{
		id: number;
		metas: object;
		// any other fields from your server.
	}
]
```
Say you add a `user` field to each presence from your server; you can easily type the field using generics
```tsx
const users = usePresence<{ user: User }>('room:lobby');

// typed User
users[0].user

// id and metas are automatically typed
users[0].id
```
Additionally, you can type extra fields into the `metas`:
```tsx
// If you have a custom metas, type it easily
const users = usePresence<void, { lastSeen: string }>('room:lobby');

// typed lastSeen
users[0].metas.lastSeen
```
