import React, { createContext, useContext, useState } from "react";

const RouterCtx = createContext(null);
export function RouterProvider({ children }) {
  const [path, setPath] = useState("/");
  return <RouterCtx.Provider value={{ path, push: setPath }}>{children}</RouterCtx.Provider>;
}
export const useRouter = () => useContext(RouterCtx);
export function Link({ href, children, className, style, onNav }) {
  const { push } = useRouter();
  return (
    <a href={href} className={className} style={style}
      onClick={(e) => { e.preventDefault(); push(href); onNav && onNav(); }}>{children}</a>
  );
}

