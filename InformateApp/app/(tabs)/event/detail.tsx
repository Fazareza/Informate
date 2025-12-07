import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import api from "../../../src/api";

export default function EventDetail() {
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/events/${id}`);
      // Pastikan ambil data objectnya langsung
      setEvent(res.data.data);
    } catch (e) {
      console.log("Error load detail:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadDetail();
  }, [id]);

  if (loading || !event) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  // Pastikan Kategori ada, jika kosong kasih strip
  const displayKategori = event.kategori ? event.kategori : "Umum";

  // Konversi Harga dari String "0" ke Integer 0 agar logika deteksi GRATIS jalan
  const hargaAngka = parseInt(event.harga_tiket);
  const displayHarga = hargaAngka === 0
    ? "GRATIS"
    : `Rp ${hargaAngka.toLocaleString('id-ID')}`;

  // Kuota
  const displayKuota = event.kuota_maksimal;


  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#e0f2fe", "#eef2ff", "#f5f3ff"]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Banner Image */}
        {event.image_url ? (
          <Image
            source={{ uri: event.image_url }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.bannerImage, styles.placeholderBanner]}>
            <Ionicons name="image-outline" size={50} color="#9ca3af" />
            <Text style={{ color: "#9ca3af" }}>Tidak ada gambar</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.headerCard}>
          <Text style={styles.title}>{event.nama_acara}</Text>
          <Text style={styles.subtitle}>Detail informasi lengkap acara</Text>
        </View>

        {/* Deskripsi */}
        <View style={styles.glassCard}>
          <Text style={styles.cardTitle}>Deskripsi</Text>
          <Text style={styles.content}>{event.deskripsi}</Text>
        </View>

        {/* Waktu & Lokasi */}
        <View style={styles.glassCard}>
          <Text style={styles.cardTitle}>Waktu & Lokasi</Text>

          <View style={styles.row}>
            <Ionicons name="calendar-outline" size={20} color="#4338ca" />
            <Text style={[styles.content, { flex: 1 }]}>
              {new Date(event.tanggal_mulai).toLocaleString()}
            </Text>
          </View>

          <View style={[styles.row, { marginTop: 8 }]}>
            <Ionicons name="location-outline" size={20} color="#4338ca" />
            <Text style={[styles.content, { flex: 1 }]}>{event.lokasi}</Text>
          </View>
        </View>

        {/* Info Lain (BAGIAN YANG HILANG TADI) */}
        <View style={styles.glassCard}>
          <Text style={styles.cardTitle}>Info Lainnya</Text>

          {/* KATEGORI */}
          <View style={styles.row}>
            <Ionicons name="pricetag-outline" size={20} color="#4338ca" />
            {/* Tambahkan flex: 1 agar teks tidak terpotong layout */}
            <Text style={[styles.content, { flex: 1 }]}>
              Kategori: {displayKategori}
            </Text>
          </View>

          {/* HARGA */}
          <View style={[styles.row, { marginTop: 8 }]}>
            <Ionicons name="cash-outline" size={20} color="#4338ca" />
            <Text style={[styles.content, { flex: 1 }]}>
              Harga: {displayHarga}
            </Text>
          </View>

          {/* KUOTA */}
          <View style={[styles.row, { marginTop: 8 }]}>
            <Ionicons name="people-outline" size={20} color="#4338ca" />
            <Text style={[styles.content, { flex: 1 }]}>
              Kuota: {displayKuota} Peserta
            </Text>
          </View>

          <View style={[styles.row, { marginTop: 8, alignItems: 'flex-start' }]}>
            <Ionicons name="call-outline" size={20} color="#4338ca" />
            <Text style={[styles.content, { flex: 1, flexWrap: 'wrap' }]}>
              Hubungi: {event.contact_person || "-"}
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  container: {
    padding: 22,
    paddingBottom: 90,
  },

  bannerImage: {
    width: "100%",
    height: 260,
    borderRadius: 26,
    backgroundColor: "#e5e7eb",
    marginBottom: 26,
    overflow: "hidden",
    elevation: 8,
  },

  placeholderBanner: {
    justifyContent: "center",
    alignItems: "center",
  },

  headerCard: {
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: 26,
    marginBottom: 22,
    elevation: 4,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1e1b4b",
  },

  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },

  glassCard: {
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: 26,
    marginBottom: 24,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#312e81",
    marginBottom: 12,
  },

  content: {
    fontSize: 15,
    color: "#1f2937",
    lineHeight: 22,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});
