import React, { useMemo } from 'react';
import { FlatList, type FlatListProps, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useHeaderAutoHideListScroll } from '@/components/common/headerMotion';

export function HeaderAwareFlatList<ItemT,>(props: FlatListProps<ItemT>) {
  const headerScroll = useHeaderAutoHideListScroll();
  const scrollEventThrottle = props.scrollEventThrottle ?? headerScroll.scrollEventThrottle;

  const mergedOnScroll = useMemo(() => {
    if (!props.onScroll) {
      return headerScroll.onScroll;
    }

    return (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      headerScroll.onScroll(event);
      props.onScroll?.(event);
    };
  }, [headerScroll, props.onScroll]);

  return <FlatList {...props} onScroll={mergedOnScroll} scrollEventThrottle={scrollEventThrottle} />;
}
