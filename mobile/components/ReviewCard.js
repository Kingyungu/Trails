import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

export default function ReviewCard({ review }) {
  const date = new Date(review.created_at).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          {review.user?.avatar ? (
            <Image source={{ uri: review.user.avatar }} style={styles.avatarImg} />
          ) : (
            <Ionicons name="person" size={20} color={COLORS.white} />
          )}
        </View>
        <View style={styles.meta}>
          <Text style={styles.name}>{review.user?.name || 'Anonymous'}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        <View style={styles.rating}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Ionicons
              key={i}
              name={i <= review.rating ? 'star' : 'star-outline'}
              size={14}
              color={COLORS.star}
            />
          ))}
        </View>
      </View>
      <Text style={styles.text}>{review.text}</Text>
      {review.photos?.length > 0 && (
        <View style={styles.photos}>
          {review.photos.map((photo, i) => (
            <Image key={i} source={{ uri: photo }} style={styles.photo} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: 36,
    height: 36,
  },
  meta: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  name: {
    fontWeight: '600',
    fontSize: 14,
    color: COLORS.text,
  },
  date: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  rating: {
    flexDirection: 'row',
    gap: 2,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  photos: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  photo: {
    width: 70,
    height: 70,
    borderRadius: RADIUS.sm,
  },
});
