import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  StatusBar,
  Image,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Colors, Gradients } from "../theme/colors";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    emoji: "💰",
    title: "Track Every Rupee",
    desc: "Know where your money goes. Add income & expenses in seconds.",
  },
  {
    id: "2",
    emoji: "📊",
    title: "Smart Analytics",
    desc: "Visual charts & insights to help you save more every month.",
  },
  {
    id: "3",
    emoji: "🎯",
    title: "Achieve Your Goals",
    desc: "Set savings goals, track progress and celebrate milestones.",
  },
];

export default function OnboardingScreen({ onDone }) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const flatRef = useRef(null);

  const next = () => {
    if (activeIndex < slides.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1 });
      setActiveIndex(activeIndex + 1);
    } else {
      onDone();
    }
  };

  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <FlatList
        ref={flatRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(idx);
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.emojiCircle}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>

      {/* Button */}
      <TouchableOpacity
        onPress={next}
        activeOpacity={0.85}
        style={styles.btnWrap}
      >
        <LinearGradient
          colors={Gradients.primary}
          style={styles.btn}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.btnText}>
            {activeIndex === slides.length - 1 ? "Let's Start 🚀" : "Next"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity onPress={onDone} style={styles.skip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingBottom: 40 },
  slide: {
    width,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emojiCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.primaryGlow,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 36,
  },
  emoji: { fontSize: 60 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 16,
  },
  desc: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  dots: { flexDirection: "row", gap: 8, marginBottom: 28 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textMuted,
  },
  dotActive: { width: 24, backgroundColor: Colors.primary },
  btnWrap: {
    width: width - 64,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 16,
  },
  btn: { paddingVertical: 18, alignItems: "center", borderRadius: 18 },
  btnText: { fontSize: 16, fontWeight: "700", color: Colors.white },
  skip: { paddingVertical: 8 },
  skipText: { color: Colors.textSecondary, fontSize: 14 },
});
