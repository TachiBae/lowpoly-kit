import React, {createContext, useContext} from 'react';

/**
 * Visual look version. v1 = original darker kit, kept for comparison.
 * v2 = ambient occlusion, warm/cool split lighting, ground haze, colour grade, ground blobs.
 * A story picks its look in story.ts (`look: 'v2'`); default is v1.
 */
export type Look = 'v1' | 'v2';
export const LookContext = createContext<Look>('v1');
export const useLook = () => useContext(LookContext);

/** Wrap a component so it renders with a given look (used for shots and Lab A/B compositions). */
export const withLook = <P extends object>(C: React.FC<P>, look: Look): React.FC<P> => {
  const Wrapped: React.FC<P> = (props) => (
    <LookContext.Provider value={look}>
      <C {...props} />
    </LookContext.Provider>
  );
  Wrapped.displayName = `withLook(${look})`;
  return Wrapped;
};

/** v2 edge style: 'clean' (default), 'soft' (rounder, bigger bevels), 'outline' (thin tinted outline post effect). */
export type Edge = 'clean' | 'soft' | 'outline';
export const EdgeContext = createContext<Edge>('clean');
export const useEdge = () => useContext(EdgeContext);
