import React, { useState, useRef, useMemo } from 'react'
import { View, StyleSheet, Dimensions, ScrollView, FlatList } from "react-native"
import CarouselCardItem from './CarouselCardItem'
import data_carousel from '../../assets/data/data_carousel_presentation'

const SLIDER_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = SLIDER_WIDTH * 0.8;

const CarouselCards = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  // Option 1: Convert to array (your current approach - already working)
  const data = useMemo(() => {
    return (data_carousel && Array.isArray(data_carousel.items))
      ? data_carousel.items
      : [];
  }, []);

  // Option 2: Create a Map for O(1) lookups by ID/key
  const dataMap = useMemo(() => {
    const map = new Map();
    if (data_carousel && Array.isArray(data_carousel.items)) {
      data_carousel.items.forEach((item, index) => {
        // Use item.id if it exists, otherwise use index
        const key = item.id || index;
        map.set(key, item);
      });
    }
    return map;
  }, []);

  // Option 3: Convert to object/dictionary for key-based access
  const dataObject = useMemo(() => {
    const obj = {};
    if (data_carousel && Array.isArray(data_carousel.items)) {
      data_carousel.items.forEach((item, index) => {
        const key = item.id || index;
        obj[key] = item;
      });
    }
    return obj;
  }, []);

  // Helper function to get item by key from Map
  const getItemByKey = (key) => {
    return dataMap.get(key);
  };

  // Helper function to get all values from Map as array
  const getDataAsArray = () => {
    return Array.from(dataMap.values());
  };

  const renderItem = ({ item }) => {
    return <CarouselCardItem item={item} />;
  };

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / ITEM_WIDTH);
    setActiveIndex(index);
  };

  // Early return if no data
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.log("No data carousel");
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          {/* You can add a loading indicator or empty state here */}
        </View>
      </View>
    );
  }

  // You can now use any of these approaches:
  // 1. data - array for FlatList (current approach)
  // 2. dataMap - Map object for key-based lookups
  // 3. dataObject - plain object for key-based access
  // 4. getDataAsArray() - get array from Map

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={data} // Using array for FlatList
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={styles.flatListContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      <View style={styles.paginationContainer}>
        {data.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              idx === activeIndex ? styles.activeDot : styles.inactiveDot
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingVertical: 40,
  },
  flatListContent: {
    paddingHorizontal: (SLIDER_WIDTH - ITEM_WIDTH) / 2,
    display: 'flex',
    gap: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 7,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
  },
  inactiveDot: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CarouselCards;
