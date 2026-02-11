import { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PhotoGallery({ images = [] }) {
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) return null;

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {images.map((uri, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => { setActiveIndex(i); setVisible(true); }}
          >
            <Image source={{ uri }} style={styles.thumb} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modal}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setVisible(false)}>
            <Ionicons name="close" size={28} color={COLORS.white} />
          </TouchableOpacity>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: activeIndex * SCREEN_WIDTH, y: 0 }}
          >
            {images.map((uri, i) => (
              <Image
                key={i}
                source={{ uri }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            ))}
          </ScrollView>
          <Text style={styles.counter}>
            {activeIndex + 1} / {images.length}
          </Text>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  thumb: {
    width: 100,
    height: 80,
    borderRadius: RADIUS.sm,
  },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  counter: {
    color: COLORS.white,
    textAlign: 'center',
    marginTop: SPACING.md,
    fontSize: 14,
  },
});
