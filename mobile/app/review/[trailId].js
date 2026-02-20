import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { addReview, uploadImage } from '../../services/api';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import useSubscriptionStore from '../../store/subscriptionStore';
import PremiumGate from '../../components/PremiumGate';

export default function WriteReviewScreen() {
  const { trailId } = useLocalSearchParams();
  const router = useRouter();
  const { subscribed, loading: subLoading } = useSubscriptionStore();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhotos([...photos, ...result.assets.map((a) => a.uri)]);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) return Alert.alert('Rating Required', 'Please select a star rating');
    if (text.trim().length < 10) return Alert.alert('Review Too Short', 'Please write at least 10 characters');

    setLoading(true);
    try {
      // Upload photos first
      const uploadedUrls = [];
      for (const uri of photos) {
        const formData = new FormData();
        formData.append('image', { uri, name: 'review.jpg', type: 'image/jpeg' });
        const { data } = await uploadImage(formData);
        uploadedUrls.push(data.url);
      }

      await addReview({
        trail: trailId,
        rating,
        text: text.trim(),
        photos: uploadedUrls,
      });

      Alert.alert('Thank you!', 'Your review has been submitted');
      router.back();
    } catch {
      Alert.alert('Error', 'Could not submit review. Please try again.');
    }
    setLoading(false);
  };

  if (!subLoading && !subscribed) {
    return <PremiumGate feature="Write Reviews" />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Star rating */}
      <Text style={styles.label}>Your Rating</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <TouchableOpacity key={i} onPress={() => setRating(i)}>
            <Ionicons
              name={i <= rating ? 'star' : 'star-outline'}
              size={40}
              color={COLORS.systemYellow}
            />
          </TouchableOpacity>
        ))}
      </View>
      {rating > 0 && (
        <Text style={styles.ratingLabel}>
          {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
        </Text>
      )}

      {/* Review text */}
      <Text style={styles.label}>Your Review</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Share your experience on this trail..."
        placeholderTextColor={COLORS.placeholderText}
        value={text}
        onChangeText={setText}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />

      {/* Photos */}
      <Text style={styles.label}>Photos (Optional)</Text>
      <View style={styles.photosRow}>
        {photos.map((uri, i) => (
          <View key={i} style={styles.photoWrap}>
            <Image source={{ uri }} style={styles.photo} />
            <TouchableOpacity
              style={styles.removePhoto}
              onPress={() => setPhotos(photos.filter((_, idx) => idx !== i))}
            >
              <Ionicons name="close" size={12} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        ))}
        {photos.length < 4 && (
          <TouchableOpacity style={styles.addPhotoBtn} onPress={handlePickPhoto}>
            <Ionicons name="camera-outline" size={28} color={COLORS.systemGray} />
            <Text style={styles.addPhotoText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, (rating === 0 || loading) && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={rating === 0 || loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.submitText}>Submit Review</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.systemGroupedBackground,
  },
  content: {
    padding: SPACING.lg,
  },
  label: {
    ...TYPOGRAPHY.headline,
    color: COLORS.label,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  starsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  ratingLabel: {
    textAlign: 'center',
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    color: COLORS.tint,
    marginTop: SPACING.xs,
  },
  textArea: {
    backgroundColor: COLORS.secondarySystemGroupedBackground,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...TYPOGRAPHY.body,
    color: COLORS.label,
    minHeight: 140,
  },
  photosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  photoWrap: {
    position: 'relative',
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.sm,
  },
  removePhoto: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.systemRed,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoBtn: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.tertiarySystemFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.secondaryLabel,
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: COLORS.tint,
    height: 50,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.white,
  },
});
