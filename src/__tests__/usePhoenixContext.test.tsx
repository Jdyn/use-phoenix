import React from 'react';
import { render } from '@testing-library/react';
import {WebSocket } from 'mock-socket';

import { PhoenixProvider } from '../PhoenixProvider';
import { usePhoenix } from '../usePhoenix';

describe('PhoenixProvider', () => {

  beforeEach(() => {
    window.WebSocket = WebSocket;
  });

  it('should have access to PhoenixProvider context', () => {
    const Test = () => {
      const { socket, connect } = usePhoenix();

      expect(socket).toBeNull();
      expect(typeof connect).toBe('function');

      return null;
    };

    const App = () => {
      return (
        <PhoenixProvider>
          <Test />
        </PhoenixProvider>
      );
    };

    render(<App />);
  });

  it('should call onOpen when socket is connected', () => {
    const onOpen = jest.fn();

    const App = () => <PhoenixProvider url="/" onOpen={onOpen} />;

    render(<App />);

    expect(onOpen).toHaveBeenCalled();
  });
});
