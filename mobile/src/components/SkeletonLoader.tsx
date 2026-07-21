import { View } from 'react-native';

export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <View
      className={`rounded-md bg-border/50 ${className ?? ''}`}
      style={{ opacity: 0.5 }}
    />
  );
}

export function HeaderSkeleton() {
  return (
    <View className="flex-row items-start justify-between px-screen-padding pt-lg">
      <View className="flex-1 gap-sm">
        <SkeletonBlock className="h-8 w-3/5" />
        <SkeletonBlock className="h-4 w-2/5" />
      </View>
      <SkeletonBlock className="h-11 w-11 rounded-full" />
    </View>
  );
}

export function SearchSkeleton() {
  return (
    <View className="px-screen-padding pt-xl">
      <SkeletonBlock className="h-14 w-full rounded-2xl" />
    </View>
  );
}

export function CategoriesSkeleton() {
  return (
    <View className="pt-xl">
      <SkeletonBlock className="mb-md ml-screen-padding h-6 w-1/3" />
      <View className="flex-row gap-md px-screen-padding">
        {Array.from({ length: 5 }).map((_, i) => (
          <View key={i} className="items-center gap-sm">
            <SkeletonBlock className="h-14 w-14 rounded-full" />
            <SkeletonBlock className="h-3 w-16" />
          </View>
        ))}
      </View>
    </View>
  );
}

export function TaskListSkeleton() {
  return (
    <View className="px-screen-padding pt-xl">
      <SkeletonBlock className="mb-md h-6 w-1/4" />
      {Array.from({ length: 3 }).map((_, i) => (
        <View key={i} className="mb-sm rounded-2xl border border-border bg-surface p-lg">
          <SkeletonBlock className="mb-sm h-5 w-3/5" />
          <SkeletonBlock className="h-4 w-1/3" />
        </View>
      ))}
    </View>
  );
}

export function HomeSkeleton() {
  return (
    <View className="flex-1 bg-background">
      <HeaderSkeleton />
      <SearchSkeleton />
      <CategoriesSkeleton />
      <TaskListSkeleton />
    </View>
  );
}
