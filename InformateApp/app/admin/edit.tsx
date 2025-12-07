import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import api from "../../src/api";
import { router, useLocalSearchParams } from "expo-router";
import { useThemeMode } from "@/hooks/useTheme";
import { Colors } from "@/constants/colors";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";

export default function EditEvent() {
  const { id } = useLocalSearchParams();
  const { theme } = useThemeMode();

  const [form, setForm] = useState({
    nama_acara: "",
    tanggal_mulai: "",
    lokasi: "",
    deskripsi: "",
    kategori: "",
    harga_tiket: "0",
    kuota_maksimal: "0",
    contact_person: "",
    image_url: "",
    image: null as any,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      const data = res.data.data;

      const dateStr = data.tanggal_mulai
        ? data.tanggal_mulai.replace("T", " ").slice(0, 19)
        : "";

      setForm({
        nama_acara: data.nama_acara,
        tanggal_mulai: dateStr,
        lokasi: data.lokasi,
        deskripsi: data.deskripsi,
        kategori: data.kategori,
        harga_tiket: String(data.harga_tiket),
        kuota_maksimal: String(data.kuota_maksimal),
        contact_person: data.contact_person,
        image_url: data.image_url,
        image: null,
      });
    } catch (error) {
      console.log("Error fetch event:", error);
      Alert.alert("Error", "Gagal mengambil data event");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // ==================== DATE PICKER ====================
  const onSelectDate = (event: any, selectedDate: Date | undefined) => {
    if (selectedDate) {
      setTempDate(selectedDate);
      setShowDatePicker(false);
      setShowTimePicker(true);
    } else {
      setShowDatePicker(false);
    }
  };

  const onSelectTime = (event: any, selectedDate: Date | undefined) => {
    const finalDate = selectedDate || tempDate;
    setShowTimePicker(Platform.OS === "ios");

    const combined = new Date(
      tempDate.getFullYear(),
      tempDate.getMonth(),
      tempDate.getDate(),
      finalDate.getHours(),
      finalDate.getMinutes()
    );

    const formatted = combined.toISOString().slice(0, 19).replace("T", " ");
    setForm({ ...form, tanggal_mulai: formatted });
  };

  // ==================== IMAGE PICKER ====================
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setForm({ ...form, image: result.assets[0] });
    }
  };

  // ==================== TEST FETCH API ====================
  // const testFetchAPI = async () => {
  //   Alert.alert("Testing", "Mencoba koneksi dengan Fetch API...");

  //   try {
  //     // Test 1: GET request sederhana
  //     console.log('🧪 Test 1: Fetch GET /api/test');
  //     const response1 = await fetch('https://cutest-laura-overfrugally.ngrok-free.dev/api/test', {
  //       method: 'GET',
  //       headers: {
  //         'Accept': 'application/json',
  //         'ngrok-skip-browser-warning': 'true',
  //       }
  //     });

  //     const data1 = await response1.json();
  //     console.log('✅ Test 1 Success:', data1);

  //     // Test 2: GET events
  //     console.log('🧪 Test 2: Fetch GET /api/events');
  //     const token = await AsyncStorage.getItem('userToken');

  //     const response2 = await fetch('https://cutest-laura-overfrugally.ngrok-free.dev/api/events', {
  //       method: 'GET',
  //       headers: {
  //         'Accept': 'application/json',
  //         'Authorization': `Bearer ${token}`,
  //         'ngrok-skip-browser-warning': 'true',
  //       }
  //     });

  //     const data2 = await response2.json();
  //     console.log('✅ Test 2 Success:', data2.data.length, 'events');

  //     // Test 3: PUT request dengan JSON (bukan FormData)
  //     console.log(`🧪 Test 3: Fetch PUT /api/events/${id}`);
  //     const response3 = await fetch(`https://cutest-laura-overfrugally.ngrok-free.dev/api/events/${id}`, {
  //       method: 'PUT',
  //       headers: {
  //         'Accept': 'application/json',
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`,
  //         'ngrok-skip-browser-warning': 'true',
  //       },
  //       body: JSON.stringify({
  //         nama_acara: form.nama_acara || 'Test Update Fetch',
  //         tanggal_mulai: form.tanggal_mulai || '2025-01-15 10:00:00',
  //         lokasi: form.lokasi || 'Jakarta',
  //         deskripsi: form.deskripsi || 'Test',
  //         kategori: form.kategori || 'Test',
  //         harga_tiket: String(form.harga_tiket || '0'),
  //         kuota_maksimal: String(form.kuota_maksimal || '100'),
  //         contact_person: form.contact_person || '08123456789'
  //       })
  //     });

  //     const data3 = await response3.json();
  //     console.log('✅ Test 3 Success:', data3);

  //     Alert.alert("Success! ✅",
  //       "Semua test berhasil!\n\n" +
  //       "✅ Test 1: API Test OK\n" +
  //       "✅ Test 2: GET Events OK\n" +
  //       "✅ Test 3: PUT Update OK\n\n" +
  //       "Masalah ada di Axios, bukan koneksi!"
  //     );

  //   } catch (error: any) {
  //     console.error('❌ Fetch Test Error:', error);
  //     Alert.alert("Error ❌",
  //       `Fetch gagal: ${error.message}\n\n` +
  //       "Kemungkinan:\n" +
  //       "• Ngrok expired\n" +
  //       "• Backend tidak running\n" +
  //       "• Koneksi internet bermasalah"
  //     );
  //   }
  // };

  // ==================== UPDATE EVENT ====================
  const handleUpdate = async () => {
    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("nama_acara", form.nama_acara);
      formData.append("tanggal_mulai", form.tanggal_mulai);
      formData.append("lokasi", form.lokasi);
      formData.append("deskripsi", form.deskripsi || "");
      formData.append("kategori", form.kategori);
      formData.append("harga_tiket", String(form.harga_tiket || "0"));
      formData.append("kuota_maksimal", String(form.kuota_maksimal || "0"));
      formData.append("contact_person", form.contact_person || "-");

      if (form.image && form.image.uri) {
        const uriParts = form.image.uri.split(".");
        const fileType = uriParts[uriParts.length - 1];

        formData.append("banner_image", {
          uri:
            Platform.OS === "android"
              ? form.image.uri
              : form.image.uri.replace("file://", ""),
          name: `updated_event_${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        } as any);

        console.log("📸 Gambar baru akan diupload");
      }

      console.log("📤 Updating event ID:", id);

      const response = await api.put(`/events/${id}`, formData);

      console.log("✅ Update berhasil:", response.data);

      Alert.alert("Sukses", "Event berhasil diperbarui!");
      router.back();
    } catch (error: any) {
      console.error("❌ Error Update:", error);

      let errorMessage = "Gagal mengupdate event.";

      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
        console.error("📛 Server response:", error.response.data);
      } else if (error.request) {
        errorMessage =
          "Tidak ada respons dari server. Periksa:\n" +
          "1. Koneksi internet\n" +
          "2. Ngrok aktif\n" +
          "3. Backend running";
        console.error("📛 No response");
      } else {
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // ==================== DELETE EVENT ====================
  const handleDelete = () => {
    Alert.alert("Hapus Event", "Event ini akan dihapus permanen. Yakin?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            setDeleting(true);
            await api.delete(`/events/${id}`);
            Alert.alert("Dihapus", "Event berhasil dihapus.");
            router.replace("/admin");
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: Colors[theme].card,
      color: Colors[theme].text,
      borderColor: Colors[theme].border,
    },
  ];

  const labelStyle = [styles.label, { color: Colors[theme].secondaryText }];

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
    >
      <Text style={[styles.title, { color: Colors[theme].text }]}>
        Edit Event
      </Text>

      {/* ========== IMAGE ========== */}
      <Text style={labelStyle}>Poster / Gambar Event</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {form.image ? (
          <Image source={{ uri: form.image.uri }} style={styles.imagePreview} />
        ) : form.image_url ? (
          <Image source={{ uri: form.image_url }} style={styles.imagePreview} />
        ) : (
          <Text style={{ color: Colors[theme].secondaryText }}>
            Tekan untuk memilih gambar baru
          </Text>
        )}
      </TouchableOpacity>

      {/* FORM INPUT */}
      <Text style={labelStyle}>Nama Acara</Text>
      <TextInput
        style={inputStyle}
        value={form.nama_acara}
        onChangeText={(t) => setForm({ ...form, nama_acara: t })}
      />

      <Text style={labelStyle}>Kategori</Text>
      <TextInput
        style={inputStyle}
        value={form.kategori}
        onChangeText={(t) => setForm({ ...form, kategori: t })}
      />

      <Text style={labelStyle}>Tanggal & Waktu</Text>
      <TouchableOpacity
        style={[inputStyle, { justifyContent: "center" }]}
        onPress={() => setShowDatePicker(true)}
      >
        <Text
          style={{
            color: form.tanggal_mulai
              ? Colors[theme].text
              : Colors[theme].secondaryText,
          }}
        >
          {form.tanggal_mulai || "Pilih tanggal & jam"}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={onSelectDate}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={tempDate}
          mode="time"
          display="default"
          onChange={onSelectTime}
        />
      )}

      <Text style={labelStyle}>Lokasi</Text>
      <TextInput
        style={inputStyle}
        value={form.lokasi}
        onChangeText={(t) => setForm({ ...form, lokasi: t })}
      />

      <View style={{ flexDirection: "row", gap: 15 }}>
        <View style={{ flex: 1 }}>
          <Text style={labelStyle}>Harga Tiket</Text>
          <TextInput
            style={inputStyle}
            keyboardType="numeric"
            value={form.harga_tiket}
            onChangeText={(t) => setForm({ ...form, harga_tiket: t })}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={labelStyle}>Kuota</Text>
          <TextInput
            style={inputStyle}
            keyboardType="numeric"
            value={form.kuota_maksimal}
            onChangeText={(t) => setForm({ ...form, kuota_maksimal: t })}
          />
        </View>
      </View>

      <Text style={labelStyle}>Contact Person</Text>
      <TextInput
        style={inputStyle}
        value={form.contact_person}
        onChangeText={(t) => setForm({ ...form, contact_person: t })}
      />

      <Text style={labelStyle}>Deskripsi</Text>
      <TextInput
        style={[inputStyle, { height: 100, textAlignVertical: "top" }]}
        multiline
        value={form.deskripsi}
        onChangeText={(t) => setForm({ ...form, deskripsi: t })}
      />

      {/* ========== TEST BUTTON ========== */}
      {/* <TouchableOpacity 
        style={styles.testBtn}
        onPress={testFetchAPI}
      >
        <Text style={styles.testBtnText}>
          🧪 Test Koneksi (Debug)
        </Text>
      </TouchableOpacity> */}

      {/* ========== BUTTON ROW ========== */}
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.7 }]}
          disabled={saving}
          onPress={handleUpdate}
        >
          <Text style={styles.btnText}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteBtn, deleting && { opacity: 0.7 }]}
          disabled={deleting}
          onPress={handleDelete}
        >
          <Text style={styles.btnText}>Hapus</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 14, marginBottom: 6, fontWeight: "600" },
  input: { borderWidth: 1, padding: 12, borderRadius: 10, marginBottom: 15 },

  imagePicker: {
    borderWidth: 1,
    borderRadius: 12,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  imagePreview: {
    width: "100%",
    height: 180,
    borderRadius: 12,
  },

  // TEST BUTTON (TAMBAHAN)
  testBtn: {
    backgroundColor: "#10b981",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },

  testBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },

  // BUTTON ROW
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 15,
  },

  saveBtn: {
    flex: 1,
    backgroundColor: "#f59e0b",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  deleteBtn: {
    width: 95,
    backgroundColor: "#ef4444",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  btnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});
