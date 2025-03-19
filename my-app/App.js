import React from "react";
import StackNavigator from "./navigation/StackNavigator.js";
import store from "./store";
import { Provider } from "react-redux";
import { ModalPortal } from "react-native-modals";
import { UserContext } from "./UserContext.js";
import { GestureHandlerRootView } from "react-native-gesture-handler";
function App() {
  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <UserContext>
            <StackNavigator />
            <ModalPortal />
          </UserContext>
        </Provider>
      </GestureHandlerRootView>
    </>
  );
}

export default App;
