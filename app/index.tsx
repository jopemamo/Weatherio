import { getWeatherByLocation } from "@/services/weatherService";
import { Text, View } from "react-native";

export default function Index() {
  const fetchWeather = async () => {
    const weather = await getWeatherByLocation("Oslo")
    console.log(weather)
  };

  fetchWeather()
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
