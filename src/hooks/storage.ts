import {
  Dispatch,
  Reducer,
  ReducerAction,
  ReducerState,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";

export const useLocalStorageState = <T>(
  storageKey: string,
  initialValue: T
) => {
  const [state, setState] = useState<T>(() => {
    try {
      const stateFromStorage = JSON.parse(
        localStorage.getItem(storageKey) as string
      );
      if (stateFromStorage) {
        return stateFromStorage;
      } else {
        return initialValue;
      }
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const handleStateChange = (v: T | ((val: T) => T)) => {
    try {
      const resolvedValue = v instanceof Function ? v(state) : v;

      setState(resolvedValue);
      window.localStorage.setItem(storageKey, JSON.stringify(resolvedValue));
    } catch (error) {
      console.error(error);
    }
  };

  return [state, handleStateChange] as const;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useLocalStorageReducer = <R extends Reducer<any, any>>(
  storageKey: string,
  reducer: R,
  initialState: ReducerState<R>
): [ReducerState<R>, Dispatch<ReducerAction<R>>] => {
  const prevState = useRef(initialState);

  const [state, dispatch] = useReducer(reducer, null, () => {
    try {
      const stateFromStorage = JSON.parse(
        localStorage.getItem(storageKey) as string
      );
      if (stateFromStorage) {
        return stateFromStorage;
      } else {
        return initialState;
      }
    } catch (error) {
      console.error(error);
      return initialState;
    }
  });

  const handleDispatch = (args: ReducerAction<R>) => {
    prevState.current = state;

    return dispatch(args);
  };

  useEffect(() => {
    if (state == prevState.current) {
      return;
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.error(error);
    }
  }, [state]);

  return [state, handleDispatch];
};
