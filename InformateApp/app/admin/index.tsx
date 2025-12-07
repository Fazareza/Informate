// screens/IndexTabs.tsx
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Text,
} from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import EventCard from "../../components/EventCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";

const Tab = createMaterialTopTabNavigator();
const STORAGE_KEY = "@informate_saved_events_v1";

function AllScreen({ navigation }: any) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // ganti ke api.get("/events") di app asli
      const res = await fetch("https://example.com/api/events"); // placeholder
      const json = await res.json();
      setEvents(json.data || []);
    } catch (e) {
      console.warn("fetch failed, using mock", e);
      // fallback mock for demo
      setEvents([
        {
          event_id: "1",
          nama_acara: "Seminar AI: Tren 2025",
          tanggal_mulai: new Date().toISOString(),
          lokasi: "Aula Fasilkom",
          kategori: "Seminar",
          image_url: "https://picsum.photos/200/200",
        },
        // ...more
      ]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  const onPress = (item: any) => {
    navigation.navigate("EventDetail", { id: item.event_id, item });
  };

  const onEdit = (id: any) => {
    navigation.push("AdminEdit", { id });
  };

  const onDelete = (id: any) => {
    // call delete api, then refresh
    setEvents((s) => s.filter((e) => e.event_id !== id));
  };

  const onShare = (it: any) => {
    // invoke share
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 30 }} />
      ) : events.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 16, color: "#6b7280" }}>
            Belum ada event.
          </Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(i) => String(i.event_id)}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <EventCard
              item={item}
              onPress={onPress}
              onEdit={onEdit}
              onDelete={onDelete}
              onShare={onShare}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

function SavedScreen({ navigation }: any) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSaved = async () => {
    setLoading(true);
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    setSavedIds(list);
    // Ideally fetch events by ids
    // demo: filter from local cache or call `/events?ids=...`
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadSaved();
    }, [])
  );

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 30 }} />
      ) : savedIds.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 16, color: "#6b7280" }}>
            Belum ada event tersimpan. Simpan event untuk menemukannya di sini.
          </Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(i) => String(i.event_id)}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <EventCard
              item={item}
              initialSaved={true}
              onPress={(it) =>
                navigation.navigate("EventDetail", { id: it.event_id })
              }
            />
          )}
        />
      )}
    </View>
  );
}

function CalendarScreen() {
  return (
    <View style={styles.empty}>
      <Text style={{ fontSize: 16, color: "#6b7280" }}>
        Tampilan kalender — (Integrasikan react-native-calendars atau custom
        calendar)
      </Text>
    </View>
  );
}

export default function IndexTabs() {
  return (
    <Tab.Navigator
      initialRouteName="All"
      screenOptions={{
        tabBarIndicatorStyle: { backgroundColor: "#2563eb" },
        tabBarActiveTintColor: "#111827",
        tabBarStyle: { backgroundColor: "#fff" },
      }}
    >
      <Tab.Screen
        name="All"
        component={AllScreen}
        options={{ title: "Semua" }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedScreen}
        options={{ title: "Tersimpan" }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ title: "Kalender" }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
});
