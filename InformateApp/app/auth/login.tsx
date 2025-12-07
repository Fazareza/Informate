import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../src/api";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Logo from "../../assets/images/logo.png";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });

      await AsyncStorage.setItem("userToken", res.data.token);

      const role = res.data.user?.role || res.data.role; // sesuaikan dengan API-mu

      Alert.alert("Sukses", "Login berhasil!");

      if (role === "organizer") {
        router.replace("/admin");
      } else {
        router.replace("/(tabs)");
      }
    } catch (e: any) {
      const msg = e.response?.data?.message || "Login gagal";
      Alert.alert("Error", msg);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#dbeafe", "#f0f9ff"]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.card}>
        <View style={styles.logoWrapper}>
          <Image source={Logo} style={styles.logo} />
        </View>

        <Text style={styles.title}>INFORMATE</Text>
        <Text style={styles.subtitle}>Masuk ke akun Anda</Text>

        {/* EMAIL */}
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={18} color="#2c3e50" />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#666"
            style={styles.input}
            value={email}
            autoCapitalize="none"
            onChangeText={setEmail}
          />
        </View>

        {/* PASSWORD */}
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={18} color="#2c3e50" />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#666"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={18}
              color="#2c3e50"
            />
          </TouchableOpacity>
        </View>
        {/* FORGOT PASSWORD */}
        <View
          style={{ width: "100%", alignItems: "flex-end", marginBottom: 20 }}
        >
          <TouchableOpacity onPress={() => router.push("/auth/resetPassword")}>
            <Text style={{ color: "#007BFF", fontWeight: "600", fontSize: 14 }}>
              Lupa Password?
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleLogin}>
          <Text style={styles.btnText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/auth/register")}>
          <Text style={styles.register}>Belum punya akun? Daftar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: "90%", // MOBILE RESPONSIVE
    maxWidth: 420, // WEB RESPONSIVE
    paddingVertical: 40,
    paddingHorizontal: 25,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    shadowColor: "#93c5fd",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    alignItems: "center",
  },

  logoWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 2,
    borderColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1e3a8a",
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 25,
  },

  inputWrapper: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.85)",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    gap: 8,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
    paddingVertical: Platform.OS === "web" ? 0 : 6,
  },

  btn: {
    width: "100%",
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
  },

  register: {
    textAlign: "center",
    marginTop: 18,
    color: "#2563eb",
    fontWeight: "600",
  },
});
