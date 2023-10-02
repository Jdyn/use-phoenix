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
	return <PhoenixProvider>...</PhoenixProvider>;
};
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
   );
   ```
2. utilizing the `usePhoenix` hook to connect lazily:

   Provide your `PhoenixProvider` **without** a `url`:

   ```tsx
   // App.tsx
   return <PhoenixProvider>...</PhoenixProvider>;
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
   		});
   	}, [connect]);
   };
   ```

## Listening for events - `useEvent` & `useChannel`

### Quick Usage

You can pass a short circuit expression to delay connection to an event or channel. If for example you are waiting to recieve an id to use from some network request, `useEvent` and `useChannel` will not connect until it is defined. Below is a contrived example:

```ts
interface MessagesEvent {
	event: 'messages';
	data: {
		messages: { id: number; body: string }[];
	};
}
// async request
const id = fetchRoomId();

// Channel will not connect until id is defined
const [channel, { push }] = useChannel(id && `chat:${id}`);

const { data } = useEvent(channel, 'messages');

return (
	<div>
		<button
			onClick={() => {
				push('new_msg', { body: 'hi' });
			}}
		>
			another one
		</button>
		{data && data.messages.map((message) => <div key={message.id}>{message.body}</div>)}
	</div>
);
```

# useEvent

`useEvent` is a hook that allows you to succinctly listen in on a channel and receive responses.

### Example Usage

```ts
...
// Type check your event
type joinEvent = {
	event: 'join',
	data: {
		members: Record<string, User>
	}
}

const [channel, { isSuccess, isError, ...rest }] = useChannel('chat:lobby')

// pass in a channel directly
const { data } = useEvent<JoinEvent>(channel, 'join')

// OR pass in a channel topic and let the hook create the channel internally
const { data } = useEvent<JoinEvent>('chat:lobby', 'join');

// typed
console.log(data.members)
```

Optionally, if you would rather capture the response in a callback you can:

```tsx
useEvent<JoinEvent>('chat:lobby', 'join', (response) => {
	console.log(response);
});
```

## useChannel

`useChannel` gives you important functions and information about the state of the channel. The following properties are available for `useChannel`

```ts
data: TJoinResponse | null; // the join response from the server
status: ChannelStatus;
isSuccess: boolean;
isLoading: boolean;
isError: boolean;
error: any;
push: PushFunction // push a message to the server
leave: () => void // leave the channel
```

### Example Usage

```tsx
const [channel, { push }] = useChannel('room:1');

push('new_msg', { msg: 'Hello World' });
leave();
```

## usePresence

Quickly setup presence tracking by connecting to your presence channel

```tsx
const users = usePresence('room:lobby');
```

the response is transformed to make it easier to use. Typically it is an object of `id: { ..., metas: [{ ... }] }`. In all of my use cases, the `metas` field is always an array of one object, and I found myself having to constantly drill into the first index `metas[0]`. Thus, the hook automatically returns `metas[0]` if the metas field is a single index array.

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
users[0].user;

// id and metas are automatically typed
users[0].id;
```

Additionally, you can type extra fields into the `metas`:

```tsx
// If you have a custom metas, type it easily
const users = usePresence<void, { lastSeen: string }>('room:lobby');

// typed lastSeen
users[0].metas.lastSeen;
```

## Notes

- If a channel recieves a `phx_error` event, meaning there was some internal server error, `useChannel` will leave the associated channel to avoid infinite error looping.

- Currently, `useChannel` does not automatically `leave` when the hook unmounts so the socket will continue to listen in on the channel. It is best to handle leaving the channel explicitly using `leave`:

  ```ts
  const [channel, { leave }] = useChannel('chat:lobby');

  useEffect(() => {
  	return () => {
  		leave();
  	};
  }, [leave]);
  ```
