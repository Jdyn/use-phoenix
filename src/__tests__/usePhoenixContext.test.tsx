import React from "react";
import { render } from "@testing-library/react";

import { PhoenixProvider } from "../PhoenixProvider";
import { usePhoenix } from "../usePhoenix";

describe("PhoenixProvider", () => {
  it("should have access to PhoenixProvider context", () => {
    const Test = () => {
      const { socket, connect } = usePhoenix();

			expect(socket).toBeNull();
			expect(typeof connect).toBe("function");

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
});
