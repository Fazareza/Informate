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
    } catch (e) {
      Alert.alert("Error", "Gagal mengambil data event");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // ==================== DATE FIRST → TIME SECOND ====================
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

  // ===== PERBAIKAN HANDLE UPDATE (GUNAKAN FORMDATA) =====
  // ===== UPDATE EVENT (VERSI PERBAIKAN) =====
  const handleUpdate = async () => {
    setSaving(true);
    try {
      // 1. Gunakan FormData
      const formData = new FormData();

      formData.append('nama_acara', form.nama_acara);
      formData.append('tanggal_mulai', form.tanggal_mulai);
      formData.append('lokasi', form.lokasi);
      formData.append('deskripsi', form.deskripsi || '');
      formData.append('kategori', form.kategori);
      formData.append('harga_tiket', String(form.harga_tiket || '0'));
      formData.append('kuota_maksimal', String(form.kuota_maksimal || '0'));
      formData.append('contact_person', form.contact_person || '-');

      // 2. Cek apakah user memilih gambar BARU?
      // (form.image terisi saat user pickImage, form.image_url adalah gambar lama)
      if (form.image && form.image.uri) {
         const uriParts = form.image.uri.split('.');
         const fileType = uriParts[uriParts.length - 1];

         formData.append('banner_image', {
            uri: form.image.uri,
            name: `updated_photo.${fileType}`,
            type: `image/${fileType}`,
         } as any);
      }
      
      // 3. Kirim PUT
      await api.put(`/events/${id}`, formData);

      Alert.alert("Sukses", "Event berhasil diperbarui!");
      router.back();
    } catch (e) {
      console.log("Error Update:", e);
      Alert.alert("Error", "Gagal mengupdate event");
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

      {/* ========== TANGGAL & JAM ========== */}
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

      {/* HARGA & KUOTA */}
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
