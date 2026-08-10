import { useCallback, useState } from 'react';
import { View, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Button, Typography } from '@/components/ui';

const MOCK_COMPLETION = {
  category: 'Delivery',
  taskerName: 'Abebe Kebede',
  pickup: 'Bole, Addis Ababa, Ethiopia',
  dropoff: 'Kazanchis, Addis Ababa, Ethiopia',
  completionTime: '3:45 PM',
  total: 6.50,
  currency: 'ETB',
};

function StarSelector({
  rating,
  onRate,
}: {
  rating: number;
  onRate: (value: number) => void;
}) {
  return (
    <View className="flex-row items-center justify-center gap-xs">
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= rating;

        return (
          <TouchableOpacity
            key={i}
            accessibilityRole="button"
            accessibilityLabel={`${starValue} star${starValue !== 1 ? 's' : ''}`}
            onPress={() => onRate(starValue)}
            testID={`star-${starValue}`}
            activeOpacity={0.6}
            className="p-xs"
          >
            <Typography
              variant="h1"
              weight="bold"
              className={isFilled ? 'text-warning' : 'text-border'}
            >
              ★
            </Typography>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TaskCompletionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const hasRating = rating > 0;

  const handleRate = useCallback((value: number) => {
    setRating(value);
  }, []);

  const handleReviewTextChange = useCallback((text: string) => {
    setReviewText(text);
  }, []);

  const handleSubmitReview = useCallback(() => {
    router.push('/task-history');
  }, [router]);

  const handleSkip = useCallback(() => {
    router.push('/task-history');
  }, [router]);

  const formatCurrency = (value: number) =>
    `${MOCK_COMPLETION.currency} ${value.toFixed(2)}`;

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <ScrollView
      className="flex-1 bg-background"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 100,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-screen-padding pt-md">
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          testID="task-completion-back-button"
          className="mb-xl h-11 w-11 items-center justify-center rounded-full bg-surface active:opacity-60"
          hitSlop={8}
        >
          <ArrowLeft size={20} className="text-text-primary" />
        </TouchableOpacity>

        <View className="mb-md items-center">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-success/20">
            <Typography variant="h1" className="text-success">
              ✓
            </Typography>
          </View>
        </View>

        <Typography variant="h2" weight="bold" className="text-center text-text-primary">
          Task completed!
        </Typography>

        <View className="mt-sm">
          <Typography
            variant="body"
            color="secondary"
            className="text-center leading-relaxed"
          >
            Your task has been successfully completed.
          </Typography>
        </View>
      </View>

      <View className="flex-1 px-screen-padding pt-xl">
        <View className="mb-md overflow-hidden rounded-2xl border border-border bg-surface">
          <View className="border-b border-border bg-surface-secondary/50 px-lg py-md">
            <Typography
              variant="caption"
              weight="semibold"
              className="uppercase tracking-wider text-text-secondary"
            >
              Completion Summary
            </Typography>
          </View>

          <View className="px-lg py-sm">
            <SummaryRow
              icon="📂"
              label="Category"
              value={MOCK_COMPLETION.category}
            />
            <SummaryRow
              icon="👤"
              label="Tasker"
              value={MOCK_COMPLETION.taskerName}
            />
            <SummaryRow
              icon="📍"
              label="Pickup"
              value={MOCK_COMPLETION.pickup}
            />
            <SummaryRow
              icon="🏁"
              label="Drop-off"
              value={MOCK_COMPLETION.dropoff}
            />
            <SummaryRow
              icon="⏱️"
              label="Completed at"
              value={MOCK_COMPLETION.completionTime}
            />
            <SummaryRow
              icon="💰"
              label="Total payment"
              value={formatCurrency(MOCK_COMPLETION.total)}
              isLast
            />
          </View>
        </View>

        <View className="mb-md overflow-hidden rounded-2xl border border-border bg-surface px-lg py-lg">
          <Typography
            variant="caption"
            weight="semibold"
            className="mb-md uppercase tracking-wider text-text-secondary"
          >
            Payment
          </Typography>

          <View className="flex-row items-center justify-between">
            <View>
              <Typography variant="body" weight="semibold" className="text-text-primary">
                Total paid
              </Typography>
              <Typography variant="h2" weight="bold" className="mt-xs text-text-primary">
                {formatCurrency(MOCK_COMPLETION.total)}
              </Typography>
            </View>

            <View className="items-end rounded-full bg-success/20 px-md py-sm">
              <View className="flex-row items-center gap-xs">
                <Typography variant="caption" className="text-success">
                  ✓
                </Typography>
                <Typography
                  variant="caption"
                  weight="semibold"
                  className="text-success"
                >
                  Payment completed
                </Typography>
              </View>
            </View>
          </View>
        </View>

        <View className="mb-md overflow-hidden rounded-2xl border border-border bg-surface px-lg py-lg">
          <Typography
            variant="caption"
            weight="semibold"
            className="mb-md text-center uppercase tracking-wider text-text-secondary"
          >
            Rate your tasker
          </Typography>

          <StarSelector rating={rating} onRate={handleRate} />

          {rating > 0 && (
            <View className="mt-sm">
              <Typography
                variant="body"
                weight="semibold"
                className="text-center text-primary"
              >
                {ratingLabels[rating]}
              </Typography>
            </View>
          )}

          <View className="mt-lg">
            <View className="rounded-xl border border-border bg-surface px-md">
              <TextInput
                value={reviewText}
                onChangeText={handleReviewTextChange}
                placeholder="Write a review (optional)..."
                placeholderTextColor="rgba(107, 114, 128, 0.5)"
                autoComplete="off"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                returnKeyType="done"
                testID="task-completion-review-input"
                nativeID="task-review"
                className="py-md text-body text-text-primary min-h-[100px]"
                accessibilityLabel="Write a review"
                maxLength={500}
              />
            </View>
            <View className="mt-xs flex-row justify-end px-xs">
              <Typography variant="caption" color="secondary">
                {reviewText.length}/500
              </Typography>
            </View>
          </View>
        </View>
      </View>

      <View className="gap-md border-t border-border bg-background px-screen-padding pb-xl pt-lg">
        <Button
          label="Submit Review"
          radius="lg"
          shadow={hasRating ? 'lg' : 'none'}
          disabled={!hasRating}
          onPress={handleSubmitReview}
          testID="task-completion-submit"
        />

        <Button
          label="Skip"
          variant="outline"
          radius="lg"
          onPress={handleSkip}
          testID="task-completion-skip"
        />
      </View>
    </ScrollView>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  isLast = false,
}: {
  icon: string;
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center py-sm ${isLast ? '' : 'border-b border-border'}`}
    >
      <View className="mr-md h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
        <Typography variant="caption" className="text-primary">
          {icon}
        </Typography>
      </View>
      <View className="flex-1">
        <Typography variant="caption" color="secondary" className="uppercase tracking-wide">
          {label}
        </Typography>
        <Typography variant="body" weight="medium" className="mt-px text-text-primary">
          {value}
        </Typography>
      </View>
    </View>
  );
}
