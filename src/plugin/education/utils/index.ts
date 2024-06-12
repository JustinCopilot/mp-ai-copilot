import { useReducer as _useReducer } from 'react';

/** 封装useReducer 使默认的dispatch方法更简捷 dispatch({type, payload}) >>>>>> dispatch(type, payload) */
export const useReducer = <T = object>(initalState, initalAction?: any) => {
  const reducer = (state, action) => {
    return action?.type === 'state' ? { ...state, ...action?.payload } : { ...state, [action?.type]: action?.payload };
  };
  const [state, _dispatch] = _useReducer(reducer, initalState, initalAction);
  const dispatch = (type, payload) => _dispatch({ type, payload });
  return [state, dispatch] as [T, any];
};
