import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import api from "../../src/api";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

export default function ManageAccount() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  const getData = async () => {
    const res = await api.get("/auth/me");
    setData(res.data.data);
  };

  useEffect(() => {
    getData();
  }, []);

  const pickAvatar = async () => {
    let res = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!res.canceled) {
      setData({ ...data, avatar: res.assets[0].uri });
    }
  };

  const handleSave = async () => {
    try {
      await api.put("/auth/update-profile", data);
      Alert.alert("Sukses", "Profil diperbarui.");
      router.back();
    } catch (e) {
      Alert.alert("Error", "Gagal memperbarui profil.");
    }
  };

  if (!data) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickAvatar}>
        <Image
          source={{
            uri: data.avatar || "https://ui-avatars.com/api/?name=" + data.name,
          }}
          style={styles.avatar}
        />
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Nama Lengkap"
        value={data.name}
        onChangeText={(t) => setData({ ...data, name: t })}
      />
      <TextInput
        style={styles.input}
        placeholder="Nomor HP"
        value={data.phone || ""}
        onChangeText={(t) => setData({ ...data, phone: t })}
      />

      <TouchableOpacity style={styles.btn} onPress={handleSave}>
        <Text style={styles.btnText}>Simpan Perubahan</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 25 },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignSelf: "center",
    marginBottom: 25,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
  },
  btn: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
  },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "700" },
});
