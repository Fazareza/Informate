import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import api from "../../src/api";

export default function ChangePassword() {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleChange = async () => {
    if (!oldPass || !newPass) {
      return Alert.alert("Validasi", "Password lama & baru wajib diisi.");
    }
    if (newPass !== confirm) {
      return Alert.alert("Validasi", "Konfirmasi password tidak cocok.");
    }

    try {
      await api.put("/auth/change-password", {
        old_password: oldPass,
        new_password: newPass,
      });

      Alert.alert("Sukses", "Password berhasil diperbarui.");
    } catch (e) {
      Alert.alert("Error", "Gagal memperbarui password.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ubah Password</Text>

      <TextInput
        secureTextEntry
        style={styles.input}
        placeholder="Password Lama"
        value={oldPass}
        onChangeText={setOldPass}
      />
      <TextInput
        secureTextEntry
        style={styles.input}
        placeholder="Password Baru"
        value={newPass}
        onChangeText={setNewPass}
      />
      <TextInput
        secureTextEntry
        style={styles.input}
        placeholder="Konfirmasi Password"
        value={confirm}
        onChangeText={setConfirm}
      />

      <TouchableOpacity style={styles.btn} onPress={handleChange}>
        <Text style={styles.btnText}>Simpan Password</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 25 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 20 },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
  },
  btn: {
    backgroundColor: "#ef4444",
    padding: 14,
    borderRadius: 12,
  },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "700" },
});
