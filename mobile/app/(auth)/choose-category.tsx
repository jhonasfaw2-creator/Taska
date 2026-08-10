import { useCallback, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Typography } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTaskContext } from '@/store/TaskContext';
import { TASK_CATEGORIES } from '@/data/taskCategories';
import type { TaskCategory } from '@/data/taskCategories';
import { Icon } from '@/components/Icon';

function CategoryCard({
  category,
  selected,
  onPress,
}: {
  category: TaskCategory;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={category.title}
      testID={`category-${category.id}`}
      className={`flex-1 rounded-2xl border p-lg ${
        selected ? 'border-primary bg-primary/10' : 'border-border bg-surface'
      }`}
    >
      <View className="flex-row items-start justify-between">
        <View
          className={`h-14 w-14 items-center justify-center rounded-full ${
            selected ? 'bg-primary' : 'bg-primary/10'
          }`}
        >
          <Icon name={category.icon} size={28} color={selected ? '#FFFFFF' : '#2563EB'} accessibilityLabel={category.title} />
        </View>
        <View
          className={`h-6 w-6 items-center justify-center rounded-full ${
            selected ? 'bg-primary' : 'border-2 border-border'
          }`}
        >
          {selected && <Icon name="check" size={14} color="#FFFFFF" accessibilityLabel="Selected" />}
        </View>
      </View>

      <Typography variant="body" weight="semibold" className="mt-md text-text-primary">
        {category.title}
      </Typography>
      <Typography variant="caption" color="secondary" className="mt-xs">
        {category.description}
      </Typography>
    </TouchableOpacity>
  );
}

export default function ChooseCategoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, setCategory } = useTaskContext();

  const selectedId = state.category?.id ?? null;

  const handleSelect = useCallback(
    (category: TaskCategory) => {
      setCategory(category);
    },
    [setCategory],
  );

  const handleContinue = useCallback(() => {
    if (!selectedId) return;
    router.push('/task-details');
  }, [selectedId, router]);

  const rows = useMemo(() => {
    const result: TaskCategory[][] = [];
    for (let i = 0; i < TASK_CATEGORIES.length; i += 2) {
      result.push(TASK_CATEGORIES.slice(i, i + 2));
    }
    return result;
  }, []);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <ScreenHeader
          title="What do you need help with?"
          subtitle="Choose a category for your task."
        />

        <View className="flex-col gap-md px-screen-padding pt-xl">
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row gap-md">
              {row.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  selected={selectedId === category.id}
                  onPress={() => handleSelect(category)}
                />
              ))}
              {row.length === 1 && <View className="flex-1" />}
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="px-screen-padding pb-xl pt-lg">
        <Button
          label="Continue"
          radius="lg"
          shadow={selectedId ? 'lg' : 'none'}
          disabled={!selectedId}
          onPress={handleContinue}
          testID="choose-category-continue"
        />
      </View>
    </View>
  );
}
