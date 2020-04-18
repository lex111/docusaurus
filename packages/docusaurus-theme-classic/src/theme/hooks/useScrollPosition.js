/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {useState, useEffect} from 'react';

const getScrollPosition = () => ({
  scrollX: typeof window !== 'undefined' ? window.pageXOffset : 0,
  scrollY: typeof window !== 'undefined' ? window.pageYOffset : 0,
});

const useScrollPosition = (effect, deps = []) => {
  const [scrollPosition, setScrollPosition] = useState(getScrollPosition());

  const handleScroll = () => {
    const currentScrollPosition = getScrollPosition();

    setScrollPosition(currentScrollPosition);

    if (effect) {
      effect(currentScrollPosition);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () =>
      window.removeEventListener('scroll', handleScroll, {
        passive: true,
      });
  }, deps);

  return scrollPosition;
};

export default useScrollPosition;
