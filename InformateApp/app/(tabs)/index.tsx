// app/(tabs)/index.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Easing,
  FlatList,
  Dimensions,
  Image,
  Platform,
  StatusBar,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Swipeable } from "react-native-gesture-handler";
import EventCard from "@/components/EventCard";
import api from "../../src/api";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useThemeMode } from "@/hooks/useTheme";
import { Colors } from "@/constants/colors";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = Math.round(width * 0.78);
const SIDE_PADDING = (width - ITEM_WIDTH) / 2;
const CAROUSEL_HEIGHT = Math.round(ITEM_WIDTH * 0.56);

export default function TabsHome() {
  const { theme, toggleTheme } = useThemeMode();
  const c = Colors[theme];
  const router = useRouter();

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [calendarVisible, setCalendarVisible] = useState(true);

  const animCalendar = useRef(new Animated.Value(1)).current;
  const carouselRef = useRef<FlatList<any> | null>(null);
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentCarouselIndex = useRef(0);

  /* ==========================
     Helper: bookmarks
  ========================== */
  const loadBookmarks = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem("informate_bookmarks_v1");
      setBookmarks(raw ? JSON.parse(raw) : []);
    } catch (err) {
      console.log("Error loading bookmarks:", err);
      setBookmarks([]);
    }
  }, []);

  const saveBookmark = useCallback(
    async (eventId: number, state: boolean) => {
      let updated = [...bookmarks];
      if (state) {
        if (!updated.includes(eventId)) updated.push(eventId);
      } else {
        updated = updated.filter((id) => id !== eventId);
      }
      setBookmarks(updated);
      await AsyncStorage.setItem(
        "informate_bookmarks_v1",
        JSON.stringify(updated)
      );
      // optional: sync to backend if needed
      // try { await api.post(`/events/${eventId}/bookmark`, { bookmarked: state }); } catch {}
    },
    [bookmarks]
  );

  /* ==========================
     Notifications
  ========================== */
  const requestNotifPermission = useCallback(async () => {
    try {
      const settings = await Notifications.getPermissionsAsync();
      if (!settings.granted) {
        await Notifications.requestPermissionsAsync();
      }
    } catch (err) {
      console.log("Error requesting notification permission:", err);
    }
  }, []);

  const scheduleNotificationForEvent = useCallback(async (ev: any) => {
    try {
      if (!ev?.tanggal_mulai) return;
      const date = new Date(ev.tanggal_mulai);
      const triggerDate = new Date(date.getTime() - 60 * 60 * 1000); // 1 hour before
      const diffSec = Math.floor((triggerDate.getTime() - Date.now()) / 1000);
      if (diffSec > 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Pengingat: ${ev.nama_acara}`,
            body: `Acara dimulai ${date.toLocaleString()}`,
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 5,
            repeats: false,
          },
        });
      }
    } catch (err) {
      console.warn("schedule notification failed", err);
    }
  }, []);

  const onBookmarkChange = useCallback(
    async (eventId: number, state: boolean) => {
      await saveBookmark(eventId, state);
      if (state) {
        const ev = events.find((e) => e.event_id === eventId);
        if (ev) scheduleNotificationForEvent(ev);
      }
    },
    [events, saveBookmark, scheduleNotificationForEvent]
  );

  /* ==========================
     Events loading + carousel auto-scroll
  ========================== */
  // start auto-scroll using provided data (avoid race with setState)
  const startAutoScrollWithData = useCallback((data: any[]) => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }
    if (!carouselRef.current || data.length <= 1) return;

    autoScrollTimer.current = setInterval(() => {
      currentCarouselIndex.current =
        (currentCarouselIndex.current + 1) % data.length;
      carouselRef.current?.scrollToOffset({
        offset: currentCarouselIndex.current * (ITEM_WIDTH + 20),
        animated: true,
      });
    }, 4000);
  }, []);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/events");
      const newEvents = res.data?.data || [];
      setEvents(newEvents);

      // compute carouselData similarly to render logic
      const featured = (
        newEvents.filter((e: any) => e.is_featured || e.is_popular) as any[]
      ).slice(0, 8);
      const carouselData = featured.length
        ? featured
        : newEvents.slice(0, Math.min(newEvents.length, 8));

      // start auto scroll based on fresh data
      startAutoScrollWithData(carouselData);
    } catch (err) {
      console.warn("Load events failed", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [startAutoScrollWithData]);

  /* Cleanup timer on unmount */
  useEffect(() => {
    (async () => {
      await loadBookmarks();
      await loadEvents();
      await requestNotifPermission();
    })();

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
        autoScrollTimer.current = null;
      }
    };
  }, [loadBookmarks, loadEvents, requestNotifPermission]);

  /* ==========================
     Calendar marked dates
  ========================== */
  const buildMarkedDates = useCallback(() => {
    const map: Record<string, any> = {};
    events.forEach((ev) => {
      if (!ev.tanggal_mulai) return;
      const key = ev.tanggal_mulai.slice(0, 10);
      map[key] = map[key] || { dots: [] };
      map[key].dots.push({ key: `ev-${ev.event_id}`, color: "#2563eb" });
    });

    if (selectedDate) {
      map[selectedDate] = {
        ...(map[selectedDate] || {}),
        selected: true,
        selectedColor: "#2563eb",
      };
    }

    setMarkedDates(map);
  }, [events, selectedDate]);

  useEffect(() => {
    buildMarkedDates();
  }, [buildMarkedDates]);

  /* ==========================
     Carousel helpers & render
  ========================== */
  const featured = (
    events.filter((e) => e.is_featured || e.is_popular) as any[]
  ).slice(0, 8);
  const carouselData = featured.length
    ? featured
    : events.slice(0, Math.min(events.length, 8));

  /* ==========================
     Small helpers & UI
  ========================== */
  const eventsForDate = (d: string) =>
    events.filter((ev) => ev.tanggal_mulai?.slice(0, 10) === d);
  const filteredEvents = selectedDate ? eventsForDate(selectedDate) : events;

  const renderRight = (ev: any) => (
    <View style={styles.swipeAction}>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/event/detail",
            params: { id: ev.event_id },
          })
        }
        style={styles.swipeBtn}
      >
        <Ionicons name="eye" size={18} color="#fff" />
        <Text style={styles.swipeText}>Lihat</Text>
      </TouchableOpacity>
    </View>
  );

  const toggleCalendar = () => {
    Animated.timing(animCalendar, {
      toValue: calendarVisible ? 0 : 1,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start(() => setCalendarVisible(!calendarVisible));
  };

  /* ==========================
     Render
  ========================== */
  return (
    <View style={[styles.outer, { backgroundColor: c.background }]}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.h1, { color: c.text }]}>Informate</Text>
          <Text style={[styles.h2, { color: c.secondaryText }]}>
            Events & activities around you
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={toggleTheme}>
            <Ionicons
              name={theme === "dark" ? "sunny-outline" : "moon-outline"}
              size={20}
              color={c.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/profile")}
          >
            <Ionicons name="person-circle-outline" size={24} color={c.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView contentContainerStyle={{ paddingBottom: 160 }}>
        {/* CAROUSEL */}
        <View style={{ paddingVertical: 10 }}>
          {carouselData.length > 0 ? (
            <FlatList
              ref={carouselRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToAlignment="center"
              snapToInterval={ITEM_WIDTH + 20}
              contentContainerStyle={{ paddingHorizontal: SIDE_PADDING }}
              getItemLayout={(_, index) => ({
                length: ITEM_WIDTH + 20,
                offset: (ITEM_WIDTH + 20) * index,
                index,
              })}
              onScrollToIndexFailed={(info) => {
                setTimeout(() => {
                  carouselRef.current?.scrollToOffset({
                    offset: info.index * (ITEM_WIDTH + 20),
                    animated: false,
                  });
                }, 80);
              }}
              data={[
                carouselData[carouselData.length - 1],
                ...carouselData,
                carouselData[0],
              ]}
              keyExtractor={(_, idx) => "inf-" + idx}
              onLayout={() => {
                carouselRef.current?.scrollToIndex({
                  index: 1,
                  animated: false,
                });
              }}
              onMomentumScrollEnd={(ev) => {
                let index = Math.round(
                  ev.nativeEvent.contentOffset.x / (ITEM_WIDTH + 20)
                );
                if (index === 0) {
                  carouselRef.current?.scrollToIndex({
                    index: carouselData.length,
                    animated: false,
                  });
                }
                if (index === carouselData.length + 1) {
                  carouselRef.current?.scrollToIndex({
                    index: 1,
                    animated: false,
                  });
                }
              }}
              renderItem={({ item }) => {
                if (!item) return null;
                return (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() =>
                      router.push({
                        pathname: "/event/detail",
                        params: { id: item.event_id },
                      })
                    }
                    style={{
                      width: ITEM_WIDTH,
                      marginHorizontal: 10,
                      height: CAROUSEL_HEIGHT,
                      borderRadius: 16,
                      overflow: "hidden",
                      backgroundColor: "#111",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Image
                      source={{
                        uri:
                          item.image_url ||
                          "https://via.placeholder.com/1200x800",
                      }}
                      style={{
                        width: "100%",
                        height: "100%",
                        resizeMode: "cover",
                      }}
                    />

                    <View
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: 16,
                        backgroundColor: "rgba(0,0,0,0.35)",
                      }}
                    >
                      <Text
                        numberOfLines={2}
                        style={{
                          color: "#fff",
                          fontWeight: "800",
                          fontSize: 18,
                        }}
                      >
                        {item.nama_acara}
                      </Text>
                      <Text
                        style={{ color: "#fff", opacity: 0.9, marginTop: 4 }}
                      >
                        {item.tanggal_mulai
                          ? new Date(item.tanggal_mulai).toLocaleDateString()
                          : "-"}{" "}
                        • {item.lokasi || "-"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          ) : (
            <Text
              style={{
                textAlign: "center",
                color: c.secondaryText,
                marginTop: 20,
              }}
            >
              Tidak ada event untuk ditampilkan.
            </Text>
          )}
        </View>

        {/* Calendar toggle + calendar */}
        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          <TouchableOpacity
            onPress={toggleCalendar}
            style={styles.calendarToggle}
          >
            <Text style={{ color: c.text, fontWeight: "700" }}>
              {calendarVisible ? "Hide calendar" : "Show calendar"}
            </Text>
            <Ionicons
              name={calendarVisible ? "chevron-up" : "chevron-down"}
              color={c.text}
              size={16}
            />
          </TouchableOpacity>
          <Animated.View
            style={[
              styles.calendarWrap,
              {
                backgroundColor: c.card,
                height: animCalendar.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 320],
                }),
                opacity: animCalendar,
              },
            ]}
          >
            <Calendar
              markingType="multi-dot"
              markedDates={markedDates}
              onDayPress={(d) => setSelectedDate(d.dateString)}
              theme={{
                backgroundColor: c.card,
                calendarBackground: c.card,
                dayTextColor: c.text,
                monthTextColor: c.text,
                textDisabledColor: c.secondaryText,
                todayTextColor: theme === "dark" ? "#38bdf8" : "#0ea5e9",
                selectedDayBackgroundColor:
                  theme === "dark" ? "#1d4ed8" : "#2563eb",
                selectedDayTextColor: "#fff",
                arrowColor: theme === "dark" ? "#60a5fa" : "#2563eb",
                textSectionTitleColor: c.text,
              }}
            />

            {selectedDate && (
              <View style={styles.selectedInfo}>
                <Text style={{ color: c.text }}>
                  {eventsForDate(selectedDate).length} acara pada{" "}
                  <Text style={{ fontWeight: "700" }}>{selectedDate}</Text>
                </Text>
                <TouchableOpacity onPress={() => setSelectedDate(null)}>
                  <Text style={{ color: "#2563eb" }}>Clear</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </View>

        {/* Events list */}
        <View style={{ paddingHorizontal: 12, marginTop: 8 }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>
              Upcoming
            </Text>
            <TouchableOpacity onPress={() => setSelectedDate(null)}>
              <Text style={{ color: "#2563eb" }}>Reset</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color={c.text}
              style={{ marginTop: 20 }}
            />
          ) : filteredEvents.length === 0 ? (
            <Text style={[styles.noEvent, { color: c.secondaryText }]}>
              Tidak ada acara.
            </Text>
          ) : (
            filteredEvents.map((ev) => (
              <Swipeable
                key={ev.event_id}
                overshootRight={false}
                renderRightActions={() => renderRight(ev)}
              >
                <EventCard
                  event={ev}
                  themeColors={c}
                  bookmarked={bookmarks.includes(ev.event_id)}
                  onBookmarkChange={(state: boolean) =>
                    onBookmarkChange(ev.event_id, state)
                  }
                  onPress={() =>
                    router.push({
                      pathname: "/event/detail",
                      params: { id: ev.event_id },
                    })
                  }
                />
              </Swipeable>
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating bookmark button */}
      <TouchableOpacity
        style={[styles.floatingBtn, { backgroundColor: "#2563eb" }]}
        onPress={() => router.push("/bookmark")}
      >
        <Ionicons name="bookmark" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

/* ==========================
   Styles
   ========================== */
const styles = StyleSheet.create({
  outer: { flex: 1 },

  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 18 : 42,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  h1: { fontSize: 28, fontWeight: "800" },
  h2: { fontSize: 12, marginTop: 2, opacity: 0.9 },

  headerRight: { flexDirection: "row", gap: 12 },

  iconBtn: { padding: 8, borderRadius: 12 },

  /* carousel */
  carouselItem: {
    height: CAROUSEL_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#111",
    justifyContent: "flex-end",
    marginVertical: 5,
    elevation: 4,
  },

  carouselImage: {
    width: ITEM_WIDTH,
    height: CAROUSEL_HEIGHT,
    borderRadius: 12,
    position: "absolute",
    top: 0,
    left: 0,
  },

  carouselOverlay: {
    backgroundColor: "rgba(0,0,0,0.36)",
    padding: 12,
    paddingBottom: 18,
  },

  carouselTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  carouselMeta: { color: "#fff", fontSize: 12, marginTop: 6, opacity: 0.95 },

  carouselBookmark: {
    position: "absolute",
    right: 12,
    top: 12,
    backgroundColor: "rgba(0,0,0,0.45)",
    padding: 8,
    borderRadius: 20,
  },

  /* calendar */
  calendarToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  calendarWrap: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },

  selectedInfo: {
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  /* list */
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    alignItems: "center",
  },
  sectionTitle: { fontSize: 18, fontWeight: "800" },
  noEvent: { textAlign: "center", marginTop: 20 },

  swipeAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 72,
    backgroundColor: "#2563eb",
    borderRadius: 12,
    marginVertical: 8,
    marginRight: 6,
  },
  swipeBtn: {
    justifyContent: "center",
    alignItems: "center",
    width: 72,
    height: "100%",
  },
  swipeText: { color: "#fff", fontSize: 12, marginTop: 4 },

  floatingBtn: {
    position: "absolute",
    right: 18,
    bottom: 22,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
});
